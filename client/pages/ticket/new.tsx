import React, { ChangeEvent, FormEvent, useState } from "react";
import useHttp from "../../hooks/useHttp";
import { useRouter } from "next/router";

const NewTicket = ({ user }) => {
  const [state, setState] = useState({ title: "", price: "" });
  const { startHttp, loading, errors } = useHttp({
    url: "/ticket/",
    method: "post",
    body: state,
  });
  const router = useRouter();

  const handleState = (e: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
    ``;
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await startHttp();
    router.push("/");
  };
  return (
    <div className="container-sm" style={{ maxWidth: 500 }}>
      <h1>Create Ticket</h1>
      <form className="card p-3" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            className="form-control"
            value={state.title}
            onChange={handleState}
            name="title"
            required
          />
          {errors?.fields?.title && (
            <div className="text-danger">{errors.fields.title}</div>
          )}
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            className="form-control"
            value={state.price}
            onChange={handleState}
            name="price"
            required
            inputMode="numeric"
            onBlur={() =>
              setState((prev) => {
                return {
                  ...prev,
                  price: isNaN(+prev.price)
                    ? prev.price
                    : parseFloat(prev.price).toFixed(2),
                };
              })
            }
          />
          {errors?.fields?.price && (
            <div className="text-danger">{errors.fields.price}</div>
          )}
        </div>

        {errors?.message && (
          <div className="alert alert-danger" role="alert">
            {errors.message}
          </div>
        )}
        <button className="btn btn-primary" disabled={loading}>
          {loading && (
            <span
              className="spinner-border spinner-border-sm mx-2"
              role="status"
              aria-hidden="true"
            ></span>
          )}
          Create
        </button>
      </form>
    </div>
  );
};

export default NewTicket;
