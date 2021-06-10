import { Subjects } from "../subjects";

export interface TicketUpdateEvent {
  subject: Subjects.TicketUpdate;
  data: {
    id: number | string;
    title: string;
    price: number;
    user_id: string;
    version: number;
    order_id?: string;
  };
}
