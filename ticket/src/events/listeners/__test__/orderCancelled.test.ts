import {
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@aldabil/microservice-common";
import { getTicketById, patchTicket } from "../../../model/ticket";
import { natsClient } from "../../../nats";
import { createTicket } from "../../../test/helpers";
import { OrderCancelledListener } from "../orderCancelled";

const setupOrderCancelledListener = async () => {
  // Create ticket
  const ticket = await createTicket("Ticket 1", "99.5");
  // Simulate created order
  const edited = await patchTicket(ticket.id, {
    order_id: "reserved_order_id",
  });

  // Then cancel it
  const listener = new OrderCancelledListener(natsClient.client);

  const data: OrderCancelledEvent["data"] = {
    id: edited.order_id || "",
    version: edited.version,
    ticket: {
      id: `${ticket.id}`,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg };
};

it("Should update/clear ticket from order_id when cancelling order", async () => {
  const { ticket, listener, data, msg } = await setupOrderCancelledListener();
  await listener.onMessage(data, msg);
  // Get ticket
  const savedTicket = await getTicketById(ticket.id);

  expect(savedTicket.order_id).toBeNull();
  expect(savedTicket.version).toEqual(2);
  expect(msg.ack).toHaveBeenCalled();
});
it("Should emit ticket update with cleared order_id after cancel order", async () => {
  const { listener, data, msg } = await setupOrderCancelledListener();
  await listener.onMessage(data, msg);

  expect(natsClient.client.publish).toBeCalledWith(
    Subjects.TicketUpdate,
    expect.any(String),
    expect.any(Function)
  );
});
