import {
  NATSListener,
  OrderCreatedEvent,
  Subjects,
} from "@aldabil/microservice-common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { GROUPNAME } from "./groupName";

export class OrderCreatedListener extends NATSListener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  group = GROUPNAME;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(`Delayed for: ${(delay / 60000).toFixed(2)} min(s)`);
    await expirationQueue.add({ order_id: data.id }, { delay });
    msg.ack();
  }
}
