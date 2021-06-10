import { body } from "express-validator";

export const authVal = [
  body("email", "Invalid Email")
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail(),
  body("password", "Minimum 6 letters").trim().isLength({ min: 6 }),
];
