import {
  NATSListener,
  OrderCancelledEvent,
  Subjects,
} from "@aldabil/microservice-common";
import { Message } from "node-nats-streaming";
import { patchTicket } from "../../model/ticket";
import { GROUPNAME } from "./groupName";

export class OrderCancelledListener extends NATSListener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  group = GROUPNAME;
  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    await patchTicket(data.ticket.id, { order_id: undefined });
    msg.ack();
  }
}
