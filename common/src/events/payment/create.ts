import { Subjects } from "../subjects";

export interface PaymentCreatedEvent {
  subject: Subjects.PaymentCreated;
  data: {
    id: string;
    order_id: string;
    charge_id: string;
  };
}
