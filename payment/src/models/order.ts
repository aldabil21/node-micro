import { Document, Model, model, Schema } from "mongoose";
import { OrderStatus } from "@aldabil/microservice-common";

export { OrderStatus };

// The fields to create order
interface IOrder {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  version: number;
}
// Single Document properties
export interface OrderDoc extends Document {
  userId: string;
  status: OrderStatus;
  total: number;
  version: number;
}

// Model fields/props and methods
interface OrderModel extends Model<OrderDoc> {
  add(order: IOrder): OrderDoc;
  findCurrentVersion(event: { id: string; version: number }): Promise<OrderDoc>;
}

const OrderSchema = new Schema<OrderDoc, OrderModel>(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.AwaitPayment,
    },
    total: { type: Schema.Types.Number, required: true },
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
OrderSchema.pre("save", function (done) {
  this.version++;
  done();
});
OrderSchema.statics.add = function (order: IOrder) {
  return new Order({
    _id: order.id,
    userId: order.userId,
    status: order.status,
    total: order.total,
    version: order.version,
  });
};
OrderSchema.statics.findCurrentVersion = function (event: {
  id: string;
  version: number;
}) {
  return this.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

const Order = model<OrderDoc, OrderModel>("Order", OrderSchema);

export { Order };
