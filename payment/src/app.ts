import express from "express";
import { ErrorResponse, errorHandler } from "@aldabil/microservice-common";
import { paymentRoutes } from "./routes/payment";
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
app.use("/api/payment", paymentRoutes);
// Error
app.use("*", (r, rr, n) => {
  throw new ErrorResponse(404, "Not Found");
});
app.use(errorHandler);

export { app };
