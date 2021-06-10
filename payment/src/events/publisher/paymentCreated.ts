import {
  NASTPublisher,
  PaymentCreatedEvent,
  Subjects,
} from "@aldabil/microservice-common";

export class PaymentCreatedPublisher extends NASTPublisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
