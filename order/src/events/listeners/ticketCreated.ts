import {
  NATSListener,
  TicketCreatedEvent,
  Subjects,
} from "@aldabil/microservice-common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { QGROUPNAME } from "./groupName";

export class TicketCreatedListener extends NATSListener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  group = QGROUPNAME;
  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    try {
      const ticket = Ticket.add({
        title: data.title,
        ticketId: `${data.id}`,
        price: data.price,
      });
      await ticket.save();
      msg.ack();
    } catch (error) {
      console.log(error);
    }
  }
}
