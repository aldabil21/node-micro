import { app } from "./app";
import { ErrorResponse } from "@aldabil/microservice-common";
import { natsClient } from "./nats";
import { db } from "./config/db";
import { OrderCreatedListener } from "./events/listeners/OrderCreated";
import { OrderCancelledListener } from "./events/listeners/OrderCancelled";

const ENVs = [
  "JWT_SECRET",
  "MONGO_URI",
  "NATS_HOST",
  "NATS_CLUSTER_ID",
  "NATS_CLIENT_ID",
  "STRIPE_SECRET",
];

for (const env of ENVs) {
  if (!process.env[env]) {
    throw new ErrorResponse(502, `Env ${env} is missing`);
  }
}
db.then(() =>
  natsClient.connect(
    process.env.NATS_CLUSTER_ID!,
    process.env.NATS_HOST!,
    process.env.NATS_CLIENT_ID
  )
)
  .then((stan) => {
    new OrderCreatedListener(natsClient.client).listen();
    new OrderCancelledListener(natsClient.client).listen();

    stan.on("close", () => {
      console.log("CLOSING: ", process.env.NATS_CLUSTER_ID);
      process.exit();
    });

    app.listen(3000, () => {
      console.log(`Listening on PORT 3000`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

process.on("exit", () => natsClient.close());
process.on("SIGTERM", () => natsClient.close());
process.on("SIGINT", () => natsClient.close());
