import {
  NASTPublisher,
  Subjects,
  OrderCancelledEvent,
} from "@aldabil/microservice-common";

export class OrderCancelledPublisher extends NASTPublisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
