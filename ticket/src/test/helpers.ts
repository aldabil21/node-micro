import { JWT } from "@aldabil/microservice-common";
import request from "supertest";
import { app } from "../app";
import { Ticket } from "../model/ticket";

export const jestSignin = (
  email: string = "test@test.com",
  password: string = "111111"
) => {
  // Build JWT {id, email}
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

// export const jestSignup = async (
//   email: string = "test@test.com",
//   password: string = "111111"
// ) => {
//   const res = await request(app)
//     .post("/api/user/signup")
//     .send({ email, password })
//     .expect(201);

//   expect(res.body.success).toBe(true);
//   expect(res.body.data.id).toBeDefined();
//   expect(res.body.data.email).toEqual(email);
//   expect(res.body.data.token).toBeDefined();
//   const cookie = res.get("Set-Cookie");
//   expect(res.get("Set-Cookie")).toBeDefined();
//   return cookie;
// };

export const createTicket = async (
  title: string = "Title",
  price: string = "20.00"
): Promise<Ticket> => {
  const cookie = jestSignin();
  const res = await request(app)
    .post("/api/ticket")
    .send({
      title,
      price,
    })
    .set("Cookie", cookie);
  expect(res.status).toEqual(201);
  const ticket: Ticket = res.body.data;
  expect(res.body.data).toMatchObject(ticket);
  expect(res.body.data.title).toEqual(title);
  expect(res.body.data.price).toEqual(price);

  return res.body.data;
};
