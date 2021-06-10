import express from "express";
import { ErrorResponse, errorHandler } from "@aldabil/microservice-common";
import { routes } from "./routes/orders";
import cookie from "cookie-session";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookie({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
    name: "token",
  })
);

// Routes
app.use("/api/order", routes);
// Error
app.use("*", (r, rr, n) => {
  throw new ErrorResponse(404, "Not Found");
});
app.use(errorHandler);

export { app };
