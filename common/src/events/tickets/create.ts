import { Subjects } from "../subjects";

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: number | string;
    title: string;
    price: number;
    user_id: string;
  };
}
