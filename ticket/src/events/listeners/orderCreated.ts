import {
  NATSListener,
  OrderCreatedEvent,
  Subjects,
} from "@aldabil/microservice-common";
import { Message } from "node-nats-streaming";
import { patchTicket } from "../../model/ticket";
import { GROUPNAME } from "./groupName";

export class OrderCreatedListener extends NATSListener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  group = GROUPNAME;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    await patchTicket(data.ticket.id, { order_id: data.id });
    msg.ack();
  }
}
