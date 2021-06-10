import express from "express";
import { currentUser, isAuth } from "@aldabil/microservice-common";
import { paymentValidator } from "../validators/payment";
import { createCharge, getStripeIntent } from "../controller/payment";
const router = express.Router();

router.use(currentUser, isAuth);

router.get("/", getStripeIntent);

router.post("/", paymentValidator, createCharge);

export { router as paymentRoutes };
