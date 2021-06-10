import { Order, OrderStatus } from "../../../models/orders";
import { Ticket } from "../../../models/ticket";
import { natsClient } from "../../../nats";
import { OrderExpiredListener } from "../orderExpired";
import { Message } from "node-nats-streaming";
import {
  OrderCancelledEvent,
  OrderExpiredEvent,
  PaymentCreatedEvent,
  Subjects,
} from "@aldabil/microservice-common";
import { PaymentCreatedListener } from "../paymentCreated";

const setup = async () => {
  const listener = new PaymentCreatedListener(natsClient.client);

  // Create ticket
  const ticket = Ticket.add({
    title: "test Ticket",
    price: 99,
    ticketId: "1",
  });
  await ticket.save();

  // Create order
  const order = Order.add({
    ticket: ticket,
    status: OrderStatus.Created,
    userId: "someuser",
    expiresAt: new Date(),
  });
  await order.save();

  // Data should be received from expiration service
  const data: PaymentCreatedEvent["data"] = {
    id: "payment-id",
    order_id: order.id,
    charge_id: "some-charge-id",
  };
  // Message mock
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, msg, data };
};

it("Receive payment created event and update related order", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.order_id);

  expect(order?.status).toEqual(OrderStatus.Completed);
  expect(msg.ack).toHaveBeenCalled();
});
