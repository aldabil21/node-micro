import React, { useEffect, useState, Fragment } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { axios } from "../../util/axiosInstance";
import { isBrowser } from "../../util/helpers";
import StripeLoader from "../../components/stripe/StripeLoader";
import StripeButton from "../../components/stripe/StripeButton";
import StripeCard from "../../components/stripe/StripeCard";
import Link from "next/link";
import useHttp from "../../hooks/useHttp";

const OrderPage = ({ order, client_secret, error }) => {
  const [left, setLeft] = useState(
    new Date(order?.expiresAt).getTime() - Date.now()
  );
  const router = useRouter();
  const isExpired = new Date(order?.expiresAt).getTime() <= Date.now();
  const is_browser = isBrowser();
  const { startHttp, errors } = useHttp({ url: "/payment", method: "post" });
  const errs = error || errors;

  useEffect(() => {
    const timeCounter = setInterval(() => {
      if (!isExpired) {
        setLeft(new Date(order?.expiresAt).getTime() - Date.now());
      }
    }, 1000);
    return () => clearInterval(timeCounter);
  }, []);

  const onConfirmPayment = async (pm, data) => {
    try {
      const res = await startHttp({ order_id: order.id, pi: pm.id });
      router.replace("/order");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container py-2" style={{ maxWidth: 800 }}>
      <div className="card p-2">
        {!order || error ? (
          "ERROR"
        ) : (
          <Fragment>
            <h4>Your order: {order.ticket.title}</h4>
            <p>
              {isExpired
                ? "Timeout! Please re-order the ticket"
                : `You need to complete the order within: ${`${new Date(
                    left
                  ).getMinutes()}:${new Date(left).getSeconds()}`}`}
            </p>
            {isExpired ? (
              <Link href={`/ticket/${order.ticket.ticketId}`}>
                <a className="btn btn-block btn-light">
                  Timeout! Click to Re-order!
                </a>
              </Link>
            ) : (
              <StripeLoader locale={"ar"}>
                <div className="row">
                  <div className="col-md-6 col-sm-12">
                    <StripeCard
                      amount={order.ticket.price || 0}
                      client_secret={client_secret}
                      onConfirm={onConfirmPayment}
                    />
                  </div>
                  <div className="col-md-6 col-sm-12">
                    You also can
                    <StripeButton
                      amount={order.ticket.price || 0}
                      client_secret={client_secret}
                      onConfirm={onConfirmPayment}
                    />
                  </div>
                </div>
              </StripeLoader>
            )}
          </Fragment>
        )}
        {/* Errors */}
        {errs?.message && (
          <div className="alert alert-danger my-2" role="alert">
            {errs.message}
          </div>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  try {
    const { headers } = req;
    const { orderId } = params;
    const res = await axios.get(`/order/${orderId}`, { headers });
    const intent = await axios.get(`/payment?order_id=${orderId}`, { headers });
    return {
      props: { order: res.data.data, client_secret: intent.data.data },
    };
  } catch (err) {
    const error = err.response.data;
    if (error.statusCode === 401) {
      return {
        props: {},
        redirect: {
          destination: "/",
        },
      };
    } else {
      return {
        props: {
          order: {},
          error: err.response.data,
        },
      };
    }
  }
};

export default OrderPage;
