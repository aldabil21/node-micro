import request from "supertest";
import { app } from "../../app";

it("Wrong password error", async () => {
  await global.jestSignup("a@a.com");
  return request(app)
    .post("/api/user/signin")
    .send({ email: "a@a.com", password: "22222222" })
    .expect(422)
    .then((res) => {
      const error = JSON.parse(res.text);
      expect(error.success).toEqual(false);
    });
});

it("Can signin with correct credentials", async () => {
  await global.jestSignup("a@a.com");
  const res = await request(app)
    .post("/api/user/signin")
    .send({ email: "a@a.com", password: "111111" })
    .expect(200);

  expect(res.body.success).toBe(true);
  expect(res.body.data.id).toBeDefined();
  expect(res.body.data.email).toBeDefined();
  expect(res.body.data.token).toBeDefined();
  expect(res.get("Set-Cookie")).toBeDefined();
});
