import {
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
  TicketUpdateEvent,
} from "@aldabil/microservice-common";
import request from "supertest";
import { Message } from "node-nats-streaming";
import { editTicket, getTicketById } from "../../../model/ticket";
import { natsClient } from "../../../nats";
import { createTicket, jestSignin } from "../../../test/helpers";
import { OrderCreatedListener } from "../orderCreated";
import { app } from "../../../app";
import { TicketUpdatedPublisher } from "../../publishers/ticketUpdated";

const setupOrderCreateListener = async () => {
  // Create ticket
  const ticket = await createTicket("Ticket 1", "99.5");

  const listener = new OrderCreatedListener(natsClient.client);

  const data: OrderCreatedEvent["data"] = {
    id: "some_order_id",
    status: OrderStatus.Created,
    user_id: "some_user_id",
    expiresAt: new Date(Date.now() + 60 * 15 * 1000).toISOString(),
    version: 0,
    ticket: {
      id: `${ticket.id}`,
      price: ticket.price,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg };
};

it("Should update ticket with order_id when creating order", async () => {
  const { ticket, listener, data, msg } = await setupOrderCreateListener();
  await listener.onMessage(data, msg);
  // Get ticket
  const savedTicket = await getTicketById(ticket.id);

  expect(savedTicket.order_id).toEqual(data.id);
  expect(msg.ack).toHaveBeenCalled();
});

it("Does't let ticket owner to update ticket if it reserved", async () => {
  const { ticket, listener, data, msg } = await setupOrderCreateListener();
  await listener.onMessage(data, msg);

  // Try update ticket
  const cookie = jestSignin();
  const updatedTicket = await request(app)
    .put(`/api/ticket/${ticket.id}`)
    .send({ title: "editedTitel", price: 343 })
    .set("Cookie", cookie)
    .expect(403);
});

it("Publish ticket update event when orderCreated with order_id", async () => {
  const { data, listener, msg } = await setupOrderCreateListener();
  await listener.onMessage(data, msg);

  // Get ticket
  const savedTicket = await getTicketById(data.ticket.id);

  expect(natsClient.client.publish).toHaveBeenCalledWith(
    Subjects.TicketUpdate,
    expect.any(String),
    expect.any(Function)
  );
});
