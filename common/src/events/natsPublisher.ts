import { Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface EVENT {
  subject: Subjects;
  data: any;
}
export abstract class NASTPublisher<T extends EVENT> {
  protected client: Stan;
  abstract subject: T["subject"];

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T["data"]) {
    return new Promise<Error | string>((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err, guid) => {
        if (err) {
          return reject(err);
        }
        console.log(`EVENT PUBLISHED: ${this.subject}`);
        resolve(guid);
      });
    });
  }
}
