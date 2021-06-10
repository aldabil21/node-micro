import { OrderCreatedEvent, OrderStatus } from "@aldabil/microservice-common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsClient } from "../../../nats";
import { OrderCreatedListener } from "../OrderCreated";

const setup = async () => {
  const listener = new OrderCreatedListener(natsClient.client);

  // Mock data
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    ticket: { id: "1", price: 99 },
    expiresAt: new Date().toISOString(),
    user_id: "someuser",
    status: OrderStatus.Created,
    version: 0,
  };

  // Mock msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("Should receive order created event and save it", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const savedOrder = await Order.findById(data.id);

  expect(savedOrder?.id).toEqual(data.id);
  expect(msg.ack).toHaveBeenCalled();
});
