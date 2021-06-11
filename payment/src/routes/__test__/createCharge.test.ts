import { Order, OrderStatus } from "../../models/order";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";
import { PaymentCreatedPublisher } from "../../events/publisher/paymentCreated";

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
  const fields = { order_id: "", pi: "" };
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
  const fields = { order_id: order.id, pi: "somepi" };
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
  const fields = { order_id: order.id, pi: "somepi" };
  const res = await request(app)
    .post("/api/payment")
    .set("Cookie", cookie)
    .send(fields)
    .expect(404);
});

jest.mock("../../stripe.ts");
it("Get stripe intent from server on checkout", async () => {
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

  // Get charge
  const pi = "some_payment_intent";
  const res = await request(app)
    .get(`/api/payment?order_id=${order.id}`)
    .set("Cookie", cookie)
    .expect(201);

  expect(stripe.paymentIntents.create).toHaveBeenCalled();

  const data = stripe.paymentIntents.create as jest.Mock;
  const args = data.mock.calls[0];
  expect(args[0].amount).toEqual(order.total * 100);
  expect(args[1].idempotencyKey).toEqual(order.id);

  const result = await data.mock.results[0].value;
  expect(result.data.intent).toEqual("client_secret");
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
  const pi = "some_payment_intent";
  const fields = { order_id: order.id, pi };
  const res = await request(app)
    .post("/api/payment")
    .set("Cookie", cookie)
    .send(fields)
    .expect(201);

  const payment = await Payment.findOne({ order_id: order.id });

  expect(payment).not.toBeNull();
  expect(payment?.charge_id).toEqual(pi);
});
