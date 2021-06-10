import express from "express";
import {
  getOrders,
  getOrder,
  createOrder,
  deleteOrder,
} from "../controller/orders";
import { currentUser, isAuth } from "@aldabil/microservice-common";
import { orderSchema } from "../validators/orders";
const router = express.Router();

router.use(currentUser, isAuth);

// @ Method  GET
// @ ACCESS  PROTECTED
// @ DESC    Get user orders
router.get("/", getOrders);
// @ Method  GET
// @ ACCESS  PROTECTED
// @ DESC    Get user order by ID
router.get("/:orderId", getOrder);
// @ Method  POST
// @ ACCESS  PROTECTED
// @ DESC    Create order
router.post("/", orderSchema, createOrder);
// @ Method  DELETE
// @ ACCESS  PROTECTED
// @ DESC    Create order
router.delete("/:orderId", deleteOrder);

export { router as routes };
