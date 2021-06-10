import Queue from "bull";
import { OrderExpiredPublisher } from "../events/publishers/orderExpired";
import { natsClient } from "../nats";

interface Payload {
  order_id: string;
}
const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: { host: process.env.REDIS_HOST },
});

expirationQueue.process(async (job) => {
  new OrderExpiredPublisher(natsClient.client).publish({
    id: job.data.order_id,
  });
});

export { expirationQueue };
