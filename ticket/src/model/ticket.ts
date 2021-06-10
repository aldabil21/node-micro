import {
  AuthData,
  ErrorResponse,
  OrderCreatedEvent,
} from "@aldabil/microservice-common";
import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../db/pool";
import { TicketCreatedPublisher } from "../events/publishers/ticketCreated";
import { TicketUpdatedPublisher } from "../events/publishers/ticketUpdated";
import { natsClient } from "../nats";

export interface Ticket {
  id: string | number;
  title: string;
  price: number;
  user_id: string;
  version: number;
  order_id?: string;
  created_at: string;
  modified_at?: string;
}
interface TicketDoc extends Ticket, RowDataPacket {}

type TicketBody = Partial<Ticket>;

export const getTickets = async (): Promise<Ticket[]> => {
  let sql = `
  SELECT id, title, price, user_id, version, order_id, created_at
  FROM ticket
  `;
  const [query, _] = await db.query<TicketDoc[]>(sql);

  return query;
};
export const getTicketById = async (id: number | string): Promise<Ticket> => {
  let sql = `
  SELECT id, title, price, user_id, version, order_id, created_at
  FROM ticket
  WHERE id = '${id}'
  `;
  const [query, _] = await db.query<TicketDoc[]>(sql);

  const ticket = query[0];
  return ticket;
};
export const createTicket = async (
  body: TicketBody,
  user: AuthData
): Promise<Ticket> => {
  const version = 0;
  const [query, _q] = await db.query<ResultSetHeader>(
    `INSERT INTO ticket SET ?`,
    {
      ...body,
      version,
      user_id: user.id,
    }
  );

  const insertId = query.insertId;
  const newTicket = {
    id: insertId,
    ...body,
    user_id: user.id,
    version,
    created_at: new Date().toString(),
  } as Ticket;

  const publish = await new TicketCreatedPublisher(natsClient.client).publish(
    newTicket
  );

  return newTicket;
};

export const editTicket = async (
  id: number,
  body: TicketBody,
  user: AuthData
): Promise<Ticket> => {
  const ticket = await getTicketById(id);

  if (!ticket) {
    throw new ErrorResponse(404, "Not found...");
  } else if (ticket.order_id) {
    throw new ErrorResponse(
      403,
      "Ticket uneditable, currently reserved for purchase"
    );
  } else if (ticket.user_id !== user.id) {
    throw new ErrorResponse(401, "Unauthorized to edit");
  }

  const modified_at = new Date();
  const version = ticket.version + 1;
  const [query, _q] = await db.query<ResultSetHeader>(
    `UPDATE ticket SET ? WHERE id = '${id}' AND user_id = '${user.id}'`,
    {
      ...body,
      version,
      modified_at,
    }
  );

  const edited: Ticket = {
    ...ticket,
    ...body,
    price: +parseFloat(`${body.price}`).toFixed(2),
    version,
    modified_at: modified_at.toISOString(),
  };

  const publish = await new TicketUpdatedPublisher(natsClient.client).publish(
    edited
  );

  return edited;
};

export const patchTicket = async (
  id: string | number,
  body: Partial<Ticket>
) => {
  const ticket = await getTicketById(id);
  if (!ticket) {
    throw new Error("Ticket not found");
  }
  const modified_at = new Date();
  const version = ticket.version + 1;
  const [query, _q] = await db.query<RowDataPacket[]>(
    `UPDATE ticket SET ? WHERE id = '${id}'`,
    {
      ...body,
      version,
      modified_at,
    }
  );
  const edited: Ticket = {
    ...ticket,
    ...body,
    version,
    modified_at: modified_at.toISOString(),
  };
  await new TicketUpdatedPublisher(natsClient.client).publish(edited);

  return edited;
};
