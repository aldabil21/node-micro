import request from "supertest";
import { app } from "../../../app";
import { createOrder, createTicket } from "./create.test";

it("Get orders is protected", async () => {
  const res = await request(app).get("/api/order").expect(401);
});
it("Can get orders", async () => {
  const cookie = await global.jestSignin("email@email.com");
  const res = await request(app)
    .get("/api/order")
    .set("Cookie", cookie)
    .expect(200);
  expect(res.body.data).toBeInstanceOf(Array);
});
it("Cannot get other user's orders", async () => {
  const id1 = "123";
  const id2 = "456";
  const id3 = "789";
  await createTicket(id1);
  await createTicket(id2);
  await createTicket(id3);
  const order1 = await createOrder({ ticketId: id1, email: "a@a.com" });
  const order2 = await createOrder({ ticketId: id2, email: "b@b.com" });
  const order3 = await createOrder({ ticketId: id3, email: "b@b.com" });

  const cookie = await global.jestSignin("b@b.com");
  const res = await request(app).get("/api/order").set("Cookie", cookie);

  expect(res.body.data.length).toEqual(2);
});
it("Can get order by ID", async () => {
  const id1 = "123";
  await createTicket(id1);
  const order1 = await createOrder({ ticketId: id1, email: "a@a.com" });

  const cookie = await global.jestSignin("a@a.com");
  const res = await request(app)
    .get("/api/order/" + order1.body.data.id)
    .set("Cookie", cookie)
    .expect(200);
  expect(res.body.data.id).toEqual(order1.body.data.id);
  expect(res.body.data.ticket.ticketId).toEqual(id1);
});
it("Cannot get other user's order by ID", async () => {
  const id1 = "123";
  await createTicket(id1);
  const order1 = await createOrder({ ticketId: id1, email: "a@a.com" });

  const cookie = await global.jestSignin("a@a.com");
  const res = await request(app)
    .get("/api/order/" + order1.body.data.id)
    .set("Cookie", cookie)
    .expect(200);
  expect(res.body.data.id).toEqual(order1.body.data.id);

  const cookie2 = await global.jestSignin("b@b.com");
  const res2 = await request(app)
    .get("/api/order/" + order1.body.data.id)
    .set("Cookie", cookie2)
    .expect(404);
});
