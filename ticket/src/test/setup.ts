process.env.DB_USER = "root";
process.env.ROOT_PASSWORD = "";
process.env.DB_HOST = "localhost";
process.env.DB_NAME = "tickets";
process.env.JWT_SECRET = "ababababababbab";

import { db_clear, db_drop, db_seed } from "../db/seed";

jest.mock("../nats.ts");

beforeAll(async () => {
  await db_seed(false);
});

beforeEach(async () => {
  jest.clearAllMocks();
});
afterEach(async () => {
  // Turncate all tables
  await db_clear();
});

afterAll(async () => {
  await db_drop();
});
