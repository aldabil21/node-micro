import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class NATSListener<T extends Event> {
  protected client: Stan;
  abstract subject: T["subject"];
  abstract group: string;
  abstract onMessage(data: T["data"], msg: Message): void;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.group);
  }

  parseMsg(msg: Message) {
    const payload = msg.getData();
    if (typeof payload === "string") {
      return JSON.parse(payload);
    }
    return JSON.parse(payload.toString("utf-8"));
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.group,
      this.subOptions()
    );
    subscription.on("message", (msg: Message) => {
      console.log("EVENT RECEIVED: ", msg.getSubject(), this.group);
      this.onMessage(this.parseMsg(msg), msg);
    });
  }
}
