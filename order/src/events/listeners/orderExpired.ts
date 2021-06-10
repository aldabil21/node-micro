import {
  NATSListener,
  Subjects,
  OrderExpiredEvent,
  ErrorResponse,
  OrderStatus,
} from "@aldabil/microservice-common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/orders";
import { TicketDoc } from "../../models/ticket";
import { OrderCancelledPublisher } from "../publishers/orderCancelled";
import { QGROUPNAME } from "./groupName";

export class OrderExpiredListener extends NATSListener<OrderExpiredEvent> {
  readonly subject = Subjects.OrderExpired;
  group = QGROUPNAME;
  async onMessage(data: OrderExpiredEvent["data"], msg: Message) {
    try {
      // Get the order
      const order = await Order.findById(data.id).populate("ticket");
      if (!order) {
        // msg.ack();
        throw new ErrorResponse(400, "Order Not Found");
      }

      if (order.status === OrderStatus.Completed) {
        return msg.ack();
      }

      // Update status
      order.set({
        status: OrderStatus.Cancelled,
      });
      await order.save();

      // Publish event cancelled
      const ticketRef = order.ticket as TicketDoc;
      new OrderCancelledPublisher(this.client).publish({
        id: order.id,
        ticket: { id: ticketRef.ticketId },
        version: order.version,
      });
      msg.ack();
    } catch (error) {
      console.log(error);
    }
  }
}
