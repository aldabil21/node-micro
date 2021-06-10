import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { axios } from "../../util/axiosInstance";
import useHttp from "../../hooks/useHttp";
import { useRouter } from "next/router";

const Ticket = ({ ticket }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { startHttp, errors } = useHttp({
    url: "/order",
    method: "post",
    body: { ticketId: ticket.id },
  });
  const createOrder = async () => {
    try {
      setLoading(true);
      const order = await startHttp();
      router.push(`/order/${order.data.id}`);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>{ticket.title}</h1>
      <h6>${ticket.price}</h6>
      {errors?.message && (
        <div className="alert alert-danger" role="alert">
          {errors.message}
        </div>
      )}
      <button
        type="button"
        className="btn btn-primary btn-md btn-outline"
        onClick={createOrder}
        disabled={loading}
      >
        {loading && (
          <span
            className="spinner-border spinner-border-sm mx-2"
            role="status"
            aria-hidden="true"
          ></span>
        )}
        Buy
      </button>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const { headers } = req;
  const { ticketId } = params;
  const res = await axios.get(`/ticket/${ticketId}`, { headers });
  return {
    props: { ticket: res.data.data },
  };
};

export default Ticket;
