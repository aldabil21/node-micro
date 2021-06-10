import request from "supertest";
import { app } from "../../app";
import { jestSignin, createTicket } from "../../test/helpers";
import { natsClient } from "../../nats";
import { Subjects } from "@aldabil/microservice-common";

it("Has POST route to create ticket", async () => {
  const res = await request(app).post("/api/ticket").send({});
  expect(res.status).not.toEqual(404);
});
it("Only accessable if authenticated", async () => {
  return request(app).post("/api/ticket").send({}).expect(401);
});
it("Can access with auth cookie", async () => {
  const cookie = jestSignin();
  const res = await request(app)
    .post("/api/ticket")
    .send({})
    .set("Cookie", cookie);
  expect(res.status).not.toEqual(401);
});
it("Validation error with invalid input", async () => {
  const cookie = jestSignin();
  const res = await request(app)
    .post("/api/ticket")
    .send({
      title: "",
      price: "0",
    })
    .set("Cookie", cookie);
  expect(res.status).toEqual(422);
  const requireds = ["title", "price"];
  for (const key of requireds) {
    expect(res.body.fields[key]).toBeDefined();
  }
});

it("Creates ticket with valid input", async () => {
  let tickets = await request(app).get("/api/ticket");
  expect(tickets.body.data.length).toEqual(0);
  const ticket1 = await createTicket("Tick1");
  expect(ticket1.title).toEqual("Tick1");
  const ticket2 = await createTicket("Tick2");
  expect(ticket2.title).toEqual("Tick2");
  tickets = await request(app).get("/api/ticket");
  expect(tickets.body.data.length).toEqual(2);
});

it("Should publish TicketCreate event", async () => {
  const ticket = await createTicket("Ticket 1");
  expect(natsClient.client.publish).toHaveBeenCalledWith(
    Subjects.TicketCreated,
    expect.any(String),
    expect.any(Function)
  );
});
