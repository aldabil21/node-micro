import { Order, OrderStatus } from "../../../models/order";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../../app";
import { natsClient } from "../../../nats";
import { Subjects } from "@aldabil/microservice-common";

jest.mock("../../../stripe.ts");

it("Publish payment created event", async () => {
  const { cookie, userId } = await global.jestSignin();

  // Mock create order
  const order = Order.add({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    total: 1,
    userId,
    version: 0,
  });
  await order.save();

  // Post charge
  const fields = { order_id: order.id, token: "tok_ae" };
  const res = await request(app)
    .post("/api/payment")
    .set("Cookie", cookie)
    .send(fields)
    .expect(201);

  expect(natsClient.client.publish).toBeCalledWith(
    Subjects.PaymentCreated,
    expect.any(String),
    expect.any(Function)
  );
});
