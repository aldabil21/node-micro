import {
  ErrorResponse,
  NATSListener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@aldabil/microservice-common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/orders";
import { QGROUPNAME } from "./groupName";

export class PaymentCreatedListener extends NATSListener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  group = QGROUPNAME;
  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.order_id);
    if (!order) {
      throw new ErrorResponse(404, "Order not found...");
    }
    order.set({ status: OrderStatus.Completed });
    await order.save();

    msg.ack();
  }
}
