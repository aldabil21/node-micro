import request from "supertest";
import { app } from "../../app";

it("Returns a 201 status on Signup", async () => {
  return global.jestSignup();
});

it("Should return 422 with invalid data", async () => {
  return request(app)
    .post("/api/user/signup")
    .send({ email: "a.com", password: "1111" })
    .expect(422)
    .then((res) => {
      const error = JSON.parse(res.text);
      expect(error.success).toEqual(false);
      expect(error.fields.email).toBeDefined();
      expect(error.fields.password).toBeDefined();
    });
});

it("Should not register same email", async () => {
  await global.jestSignup("a@a.com");
  return request(app)
    .post("/api/user/signup")
    .send({ email: "a@a.com", password: "111111" })
    .expect(422)
    .then((res) => {
      const error = JSON.parse(res.text);
      expect(error.success).toEqual(false);
    });
});
