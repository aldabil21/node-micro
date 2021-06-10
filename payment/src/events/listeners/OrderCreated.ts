import {
  NATSListener,
  OrderCreatedEvent,
  Subjects,
} from "@aldabil/microservice-common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { GROUPNAME } from "./GroupName";

export class OrderCreatedListener extends NATSListener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  group = GROUPNAME;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.add({
      id: data.id,
      status: data.status,
      total: data.ticket.price,
      userId: data.user_id,
      version: data.version,
    });

    await order.save();

    msg.ack();
  }
}
