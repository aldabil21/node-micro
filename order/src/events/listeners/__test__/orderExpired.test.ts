import { Order, OrderStatus } from "../../../models/orders";
import { Ticket } from "../../../models/ticket";
import { natsClient } from "../../../nats";
import { OrderExpiredListener } from "../orderExpired";
import { Message } from "node-nats-streaming";
import {
  OrderCancelledEvent,
  OrderExpiredEvent,
  Subjects,
} from "@aldabil/microservice-common";

const setup = async () => {
  const listener = new OrderExpiredListener(natsClient.client);

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
  const data: OrderExpiredEvent["data"] = {
    id: order.id,
  };
  // Message mock
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, msg, ticket, data };
};

it("Should receive OrderExpired event from expiration service and update order staus", async () => {
  const { listener, msg, ticket, data } = await setup();
  await listener.onMessage({ id: data.id }, msg);

  const updatedOrder = await Order.findById(data.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
  expect(msg.ack).toHaveBeenCalled();
});

it("Should publish OrderCancelled event once order expired", async () => {
  const { listener, msg, ticket, data } = await setup();
  await listener.onMessage({ id: data.id }, msg);

  expect(natsClient.client.publish).toBeCalledWith(
    Subjects.OrderCancelled,
    expect.any(String),
    expect.any(Function)
  );
  // check OrderCancelled passed args
  const published = natsClient.client.publish as jest.Mock;
  const arg = JSON.parse(
    published.mock.calls[0][1]
  ) as OrderCancelledEvent["data"];

  expect(arg.id).toEqual(data.id);
  expect(arg.ticket.id).toEqual(ticket.ticketId);
});
