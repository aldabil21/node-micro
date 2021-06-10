import { OrderStatus } from "../../types/orderStatus";
import { Subjects } from "../subjects";

export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated;
  data: {
    id: string;
    status: OrderStatus;
    version: number;
    user_id: string;
    expiresAt: string;
    ticket: {
      id: string;
      price: number;
    };
  };
}
