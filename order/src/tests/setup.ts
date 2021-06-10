import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { JWT } from "@aldabil/microservice-common";

declare global {
  namespace NodeJS {
    interface Global {
      jestSignin(email?: string, password?: string): Promise<string[]>;
      jestSignup(email?: string, password?: string): Promise<string[]>;
    }
  }
}

jest.mock("../nats.ts");

let mongo: any;
beforeAll(async () => {
  process.env.JWT_SECRET = "secret";
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (const collec of collections) {
    await collec.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.jestSignin = async (
  email: string = "email@email.com",
  password: string = "111111"
) => {
  const payload = {
    id: `ababababababababba_${email}`,
    email,
    password,
  };
  const { token } = JWT.sign(payload, 900);

  // Build token cookie {token: string}
  const obj = { token };
  const base64 = Buffer.from(JSON.stringify(obj)).toString("base64");

  return [`token=${base64}`];
};
