import { GetServerSideProps } from "next";
import Head from "next/head";
import { axios } from "../util/axiosInstance";
import Link from "next/link";

export default function Home({ user, tickets }) {
  return (
    <div>
      <Head>
        <title>Client</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container py-3">
        <div className="row">
          {tickets.map((ticket) => (
            <div className="col-md-4 col-sm-6" key={ticket.id}>
              <div className="card p-2">
                <h2>{ticket.title}</h2>
                <h5>${ticket.price}</h5>
                <div className="flex">
                  <Link href={`/ticket/${ticket.id}`}>
                    <a>
                      <button
                        type="button"
                        className="btn btn-primary btn-md btn-outline"
                        disabled={!!ticket.order_id}
                      >
                        {!!ticket.order_id ? "SOLD" : "Detail"}
                      </button>
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { headers } = req;
  const res = await axios.get("/ticket", { headers });

  return {
    props: { tickets: res.data.data },
  };
};
