import { TicketUpdateEvent } from "@aldabil/microservice-common";
import { natsClient } from "../../../nats";
import { TicketUpdatedListener } from "../ticketUpdated";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

export const createTicket = async (id: string) => {
  const ticket = Ticket.add({
    ticketId: id,
    title: `Ticket ${id}`,
    price: 100,
  });
  await ticket.save();
  return ticket;
};

const setListener = ({
  id = 1,
  title = "Ticket test",
  price = 11,
  user_id = new mongoose.Types.ObjectId().toString(),
  version = 0,
}: {
  id?: number;
  title?: string;
  price?: number;
  user_id?: string;
  version?: number;
}) => {
  const listenser = new TicketUpdatedListener(natsClient.client);

  const data: TicketUpdateEvent["data"] = {
    id,
    title,
    price,
    user_id,
    version,
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

it("Update ticket received in event listener", async () => {
  // Create the ticket
  const ticket = await createTicket("123");

  // Mock Update listener v1
  const { listenser, data, msg } = setListener({
    id: +ticket.ticketId,
    price: 55,
    version: 1,
  });
  await listenser.onMessage(data, msg);

  //Check db
  const updated = await Ticket.findOne({ ticketId: ticket.ticketId });
  expect(updated?.price).toEqual(55);
  expect(updated?.version).toEqual(1);
  expect(msg.ack).toHaveBeenCalledTimes(1);

  // Mock Update listener v2
  const {
    listenser: listenser2,
    data: data2,
    msg: msg2,
  } = setListener({
    id: +ticket.ticketId,
    price: 12.12,
    version: 2,
  });
  await listenser2.onMessage(data2, msg2);

  //Check db
  const updated2 = await Ticket.findOne({ ticketId: ticket.ticketId });
  expect(updated2?.price).toEqual(12.12);
  expect(updated2?.version).toEqual(2);
  expect(msg2.ack).toHaveBeenCalledTimes(1);
});

it("Should not ack() when update listener version out of sync", async () => {
  // Create the ticket
  const ticket = await createTicket("222");

  // Mock Update listener v2
  const { listenser, data, msg } = setListener({
    id: +ticket.ticketId,
    price: 55,
    version: 2,
  });
  await listenser.onMessage(data, msg);
  expect(msg.ack).not.toHaveBeenCalled();
});
