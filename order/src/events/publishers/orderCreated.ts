import {
  NASTPublisher,
  Subjects,
  OrderCreatedEvent,
} from "@aldabil/microservice-common";

export class OrderCreatedPublisher extends NASTPublisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
