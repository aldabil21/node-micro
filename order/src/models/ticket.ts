import { Document, Model, model, Schema } from "mongoose";
import { Order, OrderStatus } from "./orders";

// The fields to create ticket
interface ITicket {
  ticketId: string;
  title: string;
  price: number;
  version?: number;
}
// Single Document properties
export interface TicketDoc extends Document {
  ticketId: string;
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

// Model fields/props and methods
export interface TicketModel extends Model<TicketDoc> {
  add(ticket: ITicket): TicketDoc;
  findCurrentVersion(event: {
    id: string | number;
    version: number;
  }): Promise<TicketDoc>;
}

const TicketSchema = new Schema<TicketDoc>(
  {
    ticketId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

TicketSchema.set("versionKey", "version");
TicketSchema.statics.add = function (ticket: ITicket) {
  return new Ticket(ticket);
};
TicketSchema.statics.findCurrentVersion = function (event: {
  id: string | number;
  version: number;
}) {
  return this.findOne({
    ticketId: event.id,
    version: event.version - 1,
  });
};
TicketSchema.methods.isReserved = async function () {
  const hasOrder = await Order.findOne({
    ticket: this.id,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitPayment,
        OrderStatus.Completed,
      ],
    },
  });
  return !!hasOrder;
};

const Ticket = model<TicketDoc, TicketModel>("Ticket", TicketSchema);

export { Ticket };
