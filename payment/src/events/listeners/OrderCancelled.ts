import {
  ErrorResponse,
  NATSListener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@aldabil/microservice-common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { GROUPNAME } from "./GroupName";

export class OrderCancelledListener extends NATSListener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  group = GROUPNAME;
  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findCurrentVersion(data);

    if (!order) {
      throw new ErrorResponse(404, "Order not found");
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
