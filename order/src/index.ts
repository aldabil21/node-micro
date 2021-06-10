import { app } from "./app";
import { db } from "./config/db";
import { ErrorResponse } from "@aldabil/microservice-common";
import { natsClient } from "./nats";
import { TicketCreatedListener } from "./events/listeners/ticketCreated";
import { TicketUpdatedListener } from "./events/listeners/ticketUpdated";
import { OrderExpiredListener } from "./events/listeners/orderExpired";
import { PaymentCreatedListener } from "./events/listeners/paymentCreated";

const ENVs = [
  "JWT_SECRET",
  "MONGO_URI",
  "NATS_HOST",
  "NATS_CLUSTER_ID",
  "NATS_CLIENT_ID",
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
    stan.on("close", () => {
      console.log("CLOSING: ", process.env.NATS_CLUSTER_ID);
      process.exit();
    });

    new TicketCreatedListener(natsClient.client).listen();
    new TicketUpdatedListener(natsClient.client).listen();
    new OrderExpiredListener(natsClient.client).listen();
    new PaymentCreatedListener(natsClient.client).listen();

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
