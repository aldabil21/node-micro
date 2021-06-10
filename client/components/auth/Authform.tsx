import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/router";
import useHttp from "../../hooks/useHttp";

type AuthForm = {
  label: string;
  route: "signup" | "signin";
};

const AuthForm = ({ label, route }: AuthForm) => {
  const router = useRouter();
  const [state, setState] = useState({ email: "", password: "" });
  const { startHttp, loading, errors } = useHttp({
    url: "/user/" + route,
    method: "post",
    body: state,
  });

  const handleState = (e: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await startHttp();
    router.replace("/");
  };

  return (
    <div className="container">
      <form className="card p-3" onSubmit={handleSubmit}>
        <h1> {label} </h1>
        <div className="form-group">
          <label>Email</label>
          <input
            className="form-control"
            value={state.email}
            onChange={handleState}
            name="email"
            required
          />
          {errors?.fields?.email && (
            <div className="text-danger">{errors.fields.email}</div>
          )}
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            className="form-control"
            type="password"
            value={state.password}
            onChange={handleState}
            name="password"
            required
          />
          {errors?.fields?.password && (
            <div className="text-danger">{errors.fields.password}</div>
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
          {label}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
