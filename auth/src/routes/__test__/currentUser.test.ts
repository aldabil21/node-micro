import request from "supertest";
import { app } from "../../app";

it("Can get current user data after sign in", async () => {
  await global.jestSignup("email@email.com");
  const cookie = await global.jestSignin("email@email.com");
  const res = await request(app)
    .get("/api/user")
    .set("Cookie", cookie)
    .expect(200);
  expect(res.body.data.id).toBeDefined();
  expect(res.body.data.email).toEqual("email@email.com");
  expect(res.body.data.token).toBeDefined();
});

it("No current user without cookie", async () => {
  const res = await request(app).get("/api/user").expect(200);
  expect(res.body.data).toBeNull();
});
