import express from "express";
import {
  getTickets,
  getTicketById,
  editTicket,
  addTicket,
} from "../controller/ticket";
import { currentUser, isAuth } from "@aldabil/microservice-common";
import { ticketSchema } from "../validation/ticket";
const router = express.Router();

router.use(currentUser);

// @ Method  GET
// @ ACCESS  PUBLIC
// @ DESC    Get Tickets
router.get("/", getTickets);

// @ Method  GET
// @ ACCESS  PUBLIC
// @ DESC    Get Ticket by ID
router.get("/:id", getTicketById);

// @ Method  PUT
// @ ACCESS  PROTECTED
// @ DESC    Edit Ticket by ID
router.put("/:id", isAuth, ticketSchema, editTicket);

// @ Method  POST
// @ ACCESS  PROTECTED
// @ DESC    Add Ticket
router.post("/", isAuth, ticketSchema, addTicket);

export { router as routes };
