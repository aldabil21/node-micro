import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from "@aldabil/microservice-common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsClient } from "../../../nats";
import { OrderCancelledListener } from "../OrderCancelled";

const setup = async () => {
  // Create any order
  const orderId = mongoose.Types.ObjectId().toHexString();
  const order = await Order.add({
    id: orderId,
    status: OrderStatus.Created,
    total: 909,
    userId: "someuserid",
    version: 0,
  });
  await order.save();

  const listener = new OrderCancelledListener(natsClient.client);

  // Mock data
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    ticket: { id: "1" },
    version: 1,
  };

  // Mock msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("Should receive order cancelled event and update local order", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const savedOrder = await Order.findById(data.id);

  expect(savedOrder?.id).toEqual(data.id);
  expect(savedOrder?.status).toEqual(OrderStatus.Cancelled);
  expect(msg.ack).toHaveBeenCalled();
});
