import { OrderStatus, Subjects } from "@aldabil/microservice-common";
import request from "supertest";
import { app } from "../../../app";
import { natsClient } from "../../../nats";
import { createOrder, createTicket } from "./create.test";

it("Can cancel order", async () => {
  const id1 = "123";
  await createTicket(id1);
  const order1 = await createOrder({ ticketId: id1, email: "a@a.com" });

  const cookie = await global.jestSignin("a@a.com");
  const res = await request(app)
    .delete("/api/order/" + order1.body.data.id)
    .set("Cookie", cookie)
    .expect(200);
  expect(res.body.data.status).toEqual(OrderStatus.Cancelled);
});

it("Cannot cancel other's order", async () => {
  const id1 = "123";
  await createTicket(id1);
  const order1 = await createOrder({ ticketId: id1, email: "a@a.com" });

  const cookie = await global.jestSignin("b@b.com");
  const res = await request(app)
    .delete("/api/order/" + order1.body.data.id)
    .set("Cookie", cookie)
    .expect(401);
});

it("Should publish OrderCancelled event", async () => {
  const id1 = "123";
  await createTicket(id1);
  const order1 = await createOrder({ ticketId: id1, email: "a@a.com" });

  const cookie = await global.jestSignin("a@a.com");
  const res = await request(app)
    .delete("/api/order/" + order1.body.data.id)
    .set("Cookie", cookie)
    .expect(200);
  expect(res.body.data.status).toEqual(OrderStatus.Cancelled);

  expect(natsClient.client.publish).toHaveBeenCalledWith(
    Subjects.OrderCancelled,
    expect.any(String),
    expect.any(Function)
  );
});
