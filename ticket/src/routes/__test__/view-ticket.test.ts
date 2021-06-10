import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../model/ticket";
import { createTicket } from "../../test/helpers";

it("Can get tickets", async () => {
  const tick1 = await createTicket();
  const tick2 = await createTicket();
  const res = await request(app).get("/api/ticket").expect(200);
  const tickets: Ticket[] = res.body.data;
  expect(tickets.length).toEqual(2);
});

it("Can get ticket by id", async () => {
  const title = "new ticket";
  const tick1 = await createTicket(title);
  const res = await request(app)
    .get("/api/ticket/" + tick1.id)
    .expect(200);
  const tickets: Ticket[] = res.body.data;
  expect(res.body.data.id).toEqual(tick1.id);
  expect(res.body.data.title).toEqual(title);
});

it("Throw 404 with wrong id", async () => {
  return request(app).get("/api/ticket/someid").expect(404);
});
