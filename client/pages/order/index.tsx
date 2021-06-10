import { GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";
import { axios } from "../../util/axiosInstance";

const Orders = ({ orders }) => {
  console.log(orders);
  return (
    <div className="container py-2" style={{ maxWidth: 800 }}>
      {orders.length ? (
        <div className="list-group">
          {orders.map((order) => (
            <Link href="#" key={order.id}>
              <a
                className={`list-group-item list-group-item-action ${
                  order.status !== "completed" ? "disabled" : ""
                }`}
                aria-current="true"
              >
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">{order.ticket.title}</h5>
                  <small>{order.status}</small>
                </div>
                <p className="mb-1">${order.ticket.price}</p>
                {/* <small>And some small print.</small> */}
              </a>
            </Link>
          ))}
        </div>
      ) : (
        <div className="alert alert-dark my-2" role="alert">
          No Orders Found...
        </div>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  try {
    const { headers } = req;
    const res = await axios.get(`/order`, { headers });
    return {
      props: { orders: res.data.data },
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

export default Orders;
