import {
  NASTPublisher,
  OrderExpiredEvent,
  Subjects,
} from "@aldabil/microservice-common";

export class OrderExpiredPublisher extends NASTPublisher<OrderExpiredEvent> {
  readonly subject = Subjects.OrderExpired;
}
