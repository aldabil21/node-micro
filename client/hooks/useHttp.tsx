import { axios } from "../util/axiosInstance";
import { useState } from "react";

type Request = {
  url: string;
  method?: "get" | "post" | "put" | "delete";
  body?: Record<string, any>;
};

interface useHttp {
  startHttp(body?: Record<string, any>): Promise<any>;
  loading: boolean;
  errors: Record<string, any>;
}

const useHttp = ({ url, method = "get", body }: Request): useHttp => {
  const [loading, setLoading] = useState(null);
  const [errors, setErrors] = useState(null);

  const startHttp = async (bodyArgs: Record<string, any>) => {
    try {
      setLoading(true);
      if (errors) {
        setErrors(null);
      }
      const _body = body || bodyArgs;
      const res = await axios[method](url, _body);
      return res.data;
    } catch (err) {
      const error = err?.response?.data || err;
      setErrors(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { startHttp, loading, errors };
};

export default useHttp;
