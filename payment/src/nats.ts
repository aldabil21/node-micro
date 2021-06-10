import nats, { Stan } from "node-nats-streaming";
import { randomBytes } from "crypto";

class Nats {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error("NATS is not connected");
    }
    return this._client;
  }

  connect(clusterId: string, url: string, clientId?: string): Promise<Stan> {
    const clientID = clientId || randomBytes(4).toString("hex");
    this._client = nats.connect(clusterId, clientID, { url });
    return new Promise((resolve, reject) => {
      this.client.on("connect", () => {
        console.log("NATS CONNECTED: ", clusterId, clientID, url);
        resolve(this.client);
      });
      this.client.on("error", (err) => {
        reject(err);
      });
    });
  }

  close() {
    this.client.close();
  }
}

export const natsClient = new Nats();
