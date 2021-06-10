import { Subjects } from "@aldabil/microservice-common";
import request from "supertest";
import { app } from "../../app";
import { natsClient } from "../../nats";
import { jestSignin, createTicket } from "../../test/helpers";

it("Throw 401 for not signed in users", async () => {
  const ticket = await createTicket("ticket", "55.50");
  const editedTitel = "Edited title";
  const editedPrice = "99.99";
  return request(app)
    .put(`/api/ticket/${ticket.id}`)
    .send({ title: editedTitel, price: editedPrice })
    .expect(401);
});

it("Throw 404 if ticket not found", async () => {
  const ticket = await createTicket("ticket", "55.50");
  const editedTitel = "Edited title";
  const editedPrice = "99.99";
  return request(app)
    .put(`/api/ticket/somethingnotexist`)
    .send({ title: editedTitel, price: editedPrice })
    .set("Cookie", jestSignin())
    .expect(404);
});

it("Cannot edit other people ticket", async () => {
  const title = "ticket";
  const price = "55.50";
  const ticket = await createTicket(title, price);
  const editedTitel = "Edited title";
  const editedPrice = "99.99";
  await request(app)
    .put(`/api/ticket/${ticket.id}`)
    .send({ title: editedTitel, price: editedPrice })
    .set("Cookie", jestSignin("other@user.com"))
    .expect(401);

  const tick = await request(app).get(`/api/ticket/${ticket.id}`);
  expect(tick.body.data.title).toEqual(title);
  expect(tick.body.data.price).toEqual(price);
});

it("Validation error with invalid input", async () => {
  const ticket = await createTicket("ticket", "55.50");
  const res = await request(app)
    .put(`/api/ticket/${ticket.id}`)
    .send({ title: "a", price: "0" })
    .set("Cookie", jestSignin())
    .expect(422);
  const requireds = ["title", "price"];
  for (const key of requireds) {
    expect(res.body.fields[key]).toBeDefined();
  }
});

it("Can edit ticket", async () => {
  const cookie = jestSignin();
  const ticket = await createTicket("ticket", "55.50");
  const editedTitel = "Edited title";
  const editedPrice = "99.99";
  await request(app)
    .put(`/api/ticket/${ticket.id}`)
    .send({ title: editedTitel, price: editedPrice })
    .set("Cookie", cookie)
    .expect(200);

  const edited = await request(app).get(`/api/ticket/${ticket.id}`);
  expect(edited.body.data.title).toEqual(editedTitel);
  expect(edited.body.data.price).toEqual(editedPrice);
});

it("Should publish TicketUpdate event", async () => {
  const cookie = jestSignin();
  const ticket = await createTicket("ticket", "55.50");
  const editedTitel = "Edited title";
  const editedPrice = "99.99";
  await request(app)
    .put(`/api/ticket/${ticket.id}`)
    .send({ title: editedTitel, price: editedPrice })
    .set("Cookie", cookie)
    .expect(200);

  const edited = await request(app).get(`/api/ticket/${ticket.id}`);
  expect(edited.body.data.title).toEqual(editedTitel);
  expect(edited.body.data.price).toEqual(editedPrice);

  expect(natsClient.client.publish).toBeCalledTimes(2);
  expect(natsClient.client.publish).toHaveBeenCalledWith(
    Subjects.TicketUpdate,
    expect.any(String),
    expect.any(Function)
  );
});

it("Should update version number", async () => {
  const cookie = jestSignin();
  const ticket = await createTicket("ticket", "55.50");
  expect(ticket.version).toEqual(0);

  const editedTitel = "Edited title";
  const editedPrice = "99.99";
  await request(app)
    .put(`/api/ticket/${ticket.id}`)
    .send({ title: editedTitel, price: editedPrice })
    .set("Cookie", cookie)
    .expect(200);

  const edited = await request(app).get(`/api/ticket/${ticket.id}`);
  expect(edited.body.data.title).toEqual(editedTitel);
  expect(edited.body.data.price).toEqual(editedPrice);
  expect(edited.body.data.version).toEqual(1);

  const editedTitel2 = "Edited title";
  const editedPrice2 = "55.00";
  await request(app)
    .put(`/api/ticket/${ticket.id}`)
    .send({ title: editedTitel2, price: editedPrice2 })
    .set("Cookie", cookie)
    .expect(200);

  const edited2 = await request(app).get(`/api/ticket/${ticket.id}`);
  expect(edited2.body.data.title).toEqual(editedTitel2);
  expect(edited2.body.data.price).toEqual(editedPrice2);
  expect(edited2.body.data.version).toEqual(2);
});
