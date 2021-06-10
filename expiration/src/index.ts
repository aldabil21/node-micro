import { ErrorResponse } from "@aldabil/microservice-common";
import { OrderCreatedListener } from "./events/listeners/orderCreated";
import { natsClient } from "./nats";

const ENVs = ["NATS_HOST", "NATS_CLUSTER_ID", "NATS_CLIENT_ID", "REDIS_HOST"];

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
    new OrderCreatedListener(natsClient.client).listen();

    stan.on("close", () => {
      console.log("CLOSING: ", process.env.NATS_CLUSTER_ID);
      process.exit();
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

process.on("exit", () => natsClient.close());
process.on("SIGTERM", () => natsClient.close());
process.on("SIGINT", () => natsClient.close());
