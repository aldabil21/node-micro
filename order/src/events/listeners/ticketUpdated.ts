import {
  NATSListener,
  TicketUpdateEvent,
  Subjects,
  ErrorResponse,
} from "@aldabil/microservice-common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { QGROUPNAME } from "./groupName";

export class TicketUpdatedListener extends NATSListener<TicketUpdateEvent> {
  readonly subject = Subjects.TicketUpdate;
  group = QGROUPNAME;
  async onMessage(data: TicketUpdateEvent["data"], msg: Message) {
    try {
      const { title, price, version, id } = data;
      const ticket = await Ticket.findCurrentVersion(data);

      if (!ticket) {
        throw new ErrorResponse(404, "Ticket not found");
      }
      ticket.set({
        title,
        price,
        version: version,
      });
      await ticket.save();
      msg.ack();
    } catch (error) {
      // console.log(error);
      // throw error;
    }
  }
}
