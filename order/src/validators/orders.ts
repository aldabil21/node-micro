import { checkSchema } from "express-validator";

export const orderSchema = checkSchema({
  ticketId: {
    in: ["body"],
    notEmpty: true,
    errorMessage: "Ticket ID is missing",
  },
});
