import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest";

declare global {
  namespace NodeJS {
    interface Global {
      jestSignin(email?: string, password?: string): Promise<string[]>;
      jestSignup(email?: string, password?: string): Promise<string[]>;
    }
  }
}

let mongo: any;

beforeAll(async () => {
  process.env.JWT_SECRET = "secret";

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
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
  email: string = "test@test.com",
  password: string = "111111"
) => {
  const res = await request(app)
    .post("/api/user/signin")
    .send({ email, password })
    .expect(200);

  expect(res.body.success).toBe(true);
  expect(res.body.data.id).toBeDefined();
  expect(res.body.data.email).toEqual(email);
  expect(res.body.data.token).toBeDefined();
  const cookie = res.get("Set-Cookie");
  expect(res.get("Set-Cookie")).toBeDefined();
  return cookie;
};
global.jestSignup = async (
  email: string = "test@test.com",
  password: string = "111111"
) => {
  const res = await request(app)
    .post("/api/user/signup")
    .send({ email, password })
    .expect(201);

  expect(res.body.success).toBe(true);
  expect(res.body.data.id).toBeDefined();
  expect(res.body.data.email).toEqual(email);
  expect(res.body.data.token).toBeDefined();
  const cookie = res.get("Set-Cookie");
  expect(res.get("Set-Cookie")).toBeDefined();
  return cookie;
};
