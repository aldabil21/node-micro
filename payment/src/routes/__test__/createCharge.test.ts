import { Order, OrderStatus } from "../../models/order";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

it("Throws validation error", async () => {
  const { cookie, userId } = await global.jestSignin();

  // Mock create order
  const order = Order.add({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    total: 105,
    userId: userId,
    version: 0,
  });
  await order.save();

  // Post charge
  const fields = { order_id: "", token: "" };
  const res = await request(app)
    .post("/api/payment")
    .set("Cookie", cookie)
    .send(fields)
    .expect(422);

  for (const key in fields) {
    expect(res.body.fields[key]).not.toBeNull();
  }
});

it("Cannot charge cancelled order", async () => {
  const { cookie, userId } = await global.jestSignin();

  // Mock create order
  const order = Order.add({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
    total: 105,
    userId: userId,
    version: 0,
  });
  await order.save();

  // Post charge
  const fields = { order_id: order.id, token: "sometoken" };
  const res = await request(app)
    .post("/api/payment")
    .set("Cookie", cookie)
    .send(fields)
    .expect(410);
});

it("Cannot charge other users orders", async () => {
  const { cookie } = await global.jestSignin();

  // Mock create order
  const order = Order.add({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    total: 105,
    userId: "someuser",
    version: 0,
  });
  await order.save();

  // Post charge
  const fields = { order_id: order.id, token: "sometoken" };
  const res = await request(app)
    .post("/api/payment")
    .set("Cookie", cookie)
    .send(fields)
    .expect(404);
});

jest.mock("../../stripe.ts");
it("Charges successfully with stripe token", async () => {
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
  expect(stripe.charges.create).toHaveBeenCalled();
  const data = stripe.charges.create as jest.Mock;
  const args = data.mock.calls[0][0];

  expect(args.amount).toEqual(order.total * 100);
  expect(args.source).toEqual("tok_ae");
});

it("Saves charge_id from stripe", async () => {
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

  const payment = await Payment.findOne({ order_id: order.id });

  expect(payment).not.toBeNull();
  expect(payment?.charge_id).toEqual("some_charge_id");
});
