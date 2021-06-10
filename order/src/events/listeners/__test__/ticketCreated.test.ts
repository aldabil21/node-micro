import { TicketCreatedEvent } from "@aldabil/microservice-common";
import { natsClient } from "../../../nats";
import { TicketCreatedListener } from "../ticketCreated";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setListener = ({
  id = 1,
  title = "Ticket test",
  price = 11,
  user_id = new mongoose.Types.ObjectId().toString(),
}: {
  id?: number;
  title?: string;
  price?: number;
  user_id?: string;
}) => {
  const listenser = new TicketCreatedListener(natsClient.client);

  const data: TicketCreatedEvent["data"] = {
    id,
    title,
    price,
    user_id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    listenser,
    data,
    msg,
  };
};

it("Save ticket in event listener", async () => {
  // Mock listener
  const { listenser, data, msg } = setListener({ id: 555 });
  await listenser.onMessage(data, msg);

  //Check db
  const ticket = await Ticket.findOne({ ticketId: "555" });

  expect(ticket?.price).toEqual(data.price);
  expect(ticket?.title).toEqual(data.title);
});

it("Trigger ack() when saved success", async () => {
  // Mock listener
  const { listenser, data, msg } = setListener({ id: 555 });
  await listenser.onMessage(data, msg);

  //Check db
  await Ticket.findOne({ ticketId: "555" });
  expect(msg.ack).toHaveBeenCalledTimes(1);
});
