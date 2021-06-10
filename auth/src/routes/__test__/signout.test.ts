import request from "supertest";
import { app } from "../../app";

const createUser = async (email: string) => {
  const res = await request(app)
    .post("/api/user/signup")
    .send({ email: email, password: "111111" })
    .expect(201);

  expect(res.body.success).toBe(true);
  expect(res.body.data.id).toBeDefined();
  expect(res.body.data.email).toBeDefined();
  expect(res.body.data.token).toBeDefined();
  expect(res.get("Set-Cookie")).toBeDefined();
};

it("Clear cookie when sign out", async () => {
  await createUser("a@a.com");
  const res = await request(app)
    .post("/api/user/signin")
    .send({ email: "a@a.com", password: "111111" })
    .expect(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.id).toBeDefined();
  expect(res.body.data.email).toBeDefined();
  expect(res.body.data.token).toBeDefined();
  expect(res.get("Set-Cookie")).toBeDefined();

  const res2 = await request(app).post("/api/user/signout").expect(200);
  const cookie = res2.get("Set-Cookie")[0];
  expect(cookie).toEqual(
    "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
  expect(res2.body.data).toBeNull();
});
