import {
  NASTPublisher,
  Subjects,
  TicketCreatedEvent,
} from "@aldabil/microservice-common";

export class TicketCreatedPublisher extends NASTPublisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
