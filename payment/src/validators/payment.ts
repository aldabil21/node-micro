import { body } from "express-validator";

export const paymentValidator = [
  body("order_id", "Order ID not included").notEmpty(),
  body("pi", "Stripe PI not included").trim().notEmpty(),
];
