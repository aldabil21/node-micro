import { checkSchema } from "express-validator";

export const ticketSchema = checkSchema({
  title: {
    in: ["body"],
    isLength: {
      options: {
        min: 4,
        max: 20,
      },
    },
    errorMessage: "Between 4-20 letters",
  },
  price: {
    in: ["body"],
    isCurrency: {
      options: {
        require_decimal: false,
        digits_after_decimal: [1, 2],
      },
      errorMessage: "Not currency form",
    },
    custom: {
      options: (val) => +val > 0,
      errorMessage: "Greater than 0",
    },
  },
});
