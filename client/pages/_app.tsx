import "bootstrap/dist/css/bootstrap.min.css";
import { AppContext } from "next/app";
import Layout from "../components/layout/Layout";
import { axios } from "../util/axiosInstance";

export type user = {
  email: string;
  exp?: number;
  iat?: number;
  id: string;
  token: string;
};
interface Myapp extends AppContext {
  user: user | null;
  pageProps: any;
}

function MyApp({ Component, pageProps, user }: Myapp) {
  return (
    <Layout user={user}>
      <Component {...pageProps} user={user} />
    </Layout>
  );
}

MyApp.getInitialProps = async ({ ctx }: AppContext) => {
  const res = await axios.get("/user", {
    headers: ctx.req?.headers,
  });
  console.log("_app: CALLED");
  return {
    user: res.data?.data || "",
  };
};

export default MyApp;
