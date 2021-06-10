import { Document, Model, model, Schema } from "mongoose";
import { OrderStatus } from "@aldabil/microservice-common";
import { Ticket, TicketDoc } from "./ticket";

export { OrderStatus };

// The fields to create order
interface IOrder {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: Schema.Types.ObjectId | TicketDoc;
  version?: number;
}
// Single Document properties
export interface OrderDoc extends Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: Schema.Types.ObjectId | TicketDoc;
  version: number;
}

// Model fields/props and methods
interface OrderModel extends Model<OrderDoc> {
  add(order: IOrder): OrderDoc;
  findCurrentVersion(event: { id: number; version: number }): Promise<OrderDoc>;
}

const OrderSchema = new Schema<OrderDoc, OrderModel>(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: { type: Schema.Types.Date, required: true },
    ticket: { type: Schema.Types.ObjectId, require: true, ref: "Ticket" },
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

OrderSchema.set("versionKey", "version");

OrderSchema.statics.add = function (order: IOrder) {
  return new Order(order);
};

OrderSchema.pre("save", function (done) {
  this.version++;
  done();
});
OrderSchema.statics.findCurrentVersion = function (event: {
  id: string;
  version: number;
}) {
  return this.findOne({
    id: event.id,
    version: event.version - 1,
  });
};

const Order = model<OrderDoc, OrderModel>("Order", OrderSchema);

export { Order };
