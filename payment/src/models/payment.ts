import { Document, Model, model, Schema } from "mongoose";

// The fields to create payment
interface IPayment {
  order_id: string;
  charge_id: string;
  version?: number;
}
// Single Document properties
export interface PaymentDoc extends Document {
  order_id: string;
  charge_id: string;
  version: number;
}

// Model fields/props and methods
interface PaymentModel extends Model<PaymentDoc> {
  add(payment: IPayment): PaymentDoc;
}

const PaymentSchema = new Schema<PaymentDoc, PaymentModel>(
  {
    order_id: { type: String, required: true },
    charge_id: { type: String, required: true },
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

PaymentSchema.set("versionKey", "version");
PaymentSchema.pre("save", function (done) {
  this.version++;
  done();
});
PaymentSchema.statics.add = function (payment: IPayment) {
  return new Payment({
    order_id: payment.order_id,
    charge_id: payment.charge_id,
  });
};
PaymentSchema.statics.findCurrentVersion = function (event: {
  id: string;
  version: number;
}) {
  return this.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

const Payment = model<PaymentDoc, PaymentModel>("Payment", PaymentSchema);

export { Payment };
