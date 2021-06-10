import {
  NASTPublisher,
  Subjects,
  TicketUpdateEvent,
} from "@aldabil/microservice-common";

export class TicketUpdatedPublisher extends NASTPublisher<TicketUpdateEvent> {
  readonly subject = Subjects.TicketUpdate;
}
