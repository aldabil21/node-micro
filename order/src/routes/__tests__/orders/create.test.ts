import { Subjects } from "@aldabil/microservice-common";
import request, { Test } from "supertest";
import { app } from "../../../app";
import { OrderStatus } from "../../../models/orders";
import { Ticket } from "../../../models/ticket";
import { natsClient } from "../../../nats";

export const createOrder = async ({
  ticketId,
  email = "email@email.com",
}: {
  ticketId: string | number;
  email?: string;
}): Promise<Test> => {
  const cookie = await global.jestSignin(email);
  return request(app).post("/api/order").set("Cookie", cookie).send({
    ticketId,
  });
};
export const createTicket = async (id: string) => {
  const ticket = Ticket.add({
    ticketId: id,
    title: `Ticket ${id}`,
    price: 100,
  });
  await ticket.save();
  return ticket;
};
it("Create order route is protected", async () => {
  const res = await request(app).get("/api/order").expect(401);
});
it("Throw validation error", async () => {
  const body = { ticketId: "" };
  const cookie = await global.jestSignin();
  const res = await request(app)
    .post("/api/order")
    .set("Cookie", cookie)
    .send(body)
    .expect(422);

  for (const key in body) {
    expect(res.body.fields[key]).toBeDefined();
  }
});
it("Cannot create order with unfound ticket", async () => {
  const order = await createOrder({ ticketId: 123 });
  expect(order.status).toEqual(404);
});
it("Can create order", async () => {
  const ticketId = "123";
  await createTicket(ticketId);

  const { body } = await createOrder({ ticketId });

  expect(body.data.ticket.ticketId).toEqual(ticketId);
  expect(body.data.status).toEqual(OrderStatus.Created);
  const now = new Date();
  now.setSeconds(now.getSeconds() * 15 * 60);
  // Between 15 min
  expect(new Date(body.data.expiresAt) > new Date()).toBeTruthy();
  expect(new Date(body.data.expiresAt) < now).toBeTruthy();
});
it("Throw error if ticket reserved", async () => {
  const ticketId = "123";
  await createTicket(ticketId);

  const order1 = await createOrder({ ticketId, email: "a@a.com" });
  const order2 = await createOrder({ ticketId, email: "b@b.com" });

  expect(order2.status).toEqual(400);
});

it("Should publish OrderCreated event", async () => {
  const ticketId = "123";
  await createTicket(ticketId);

  const { body } = await createOrder({ ticketId });

  expect(body.data.ticket.ticketId).toEqual(ticketId);
  expect(body.data.status).toEqual(OrderStatus.Created);

  expect(natsClient.client.publish).toHaveBeenCalledWith(
    Subjects.OrderCreated,
    expect.any(String),
    expect.any(Function)
  );
});
