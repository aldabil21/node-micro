import { app } from "./app";
import { ErrorResponse } from "@aldabil/microservice-common";
import { db_seed } from "./db/seed";
import { natsClient } from "./nats";
import { OrderCreatedListener } from "./events/listeners/orderCreated";
import { OrderCancelledListener } from "./events/listeners/orderCancelled";

const ENVs = [
  "JWT_SECRET",
  "ROOT_PASSWORD",
  "DB_USER",
  "DB_HOST",
  "NATS_HOST",
  "NATS_CLUSTER_ID",
  "NATS_CLIENT_ID",
];

for (const env of ENVs) {
  if (!process.env[env]) {
    throw new ErrorResponse(502, `Env ${env} is missing`);
  }
}

natsClient
  .connect(
    process.env.NATS_CLUSTER_ID!,
    process.env.NATS_HOST!,
    process.env.NATS_CLIENT_ID
  )
  .then((stan) => {
    stan.on("close", () => {
      console.log("CLOSING: ", process.env.NATS_CLUSTER_ID);
      process.exit();
    });
    return db_seed(true);
  })
  .then(() => {
    new OrderCreatedListener(natsClient.client).listen();
    new OrderCancelledListener(natsClient.client).listen();

    app.listen(3000, () => {
      console.log(`Listening on PORT 3000`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

process.on("exit", () => natsClient.close());
process.on("SIGTERM", () => natsClient.close());
process.on("SIGINT", () => natsClient.close());
