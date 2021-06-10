import { Request, Response, NextFunction } from "express";
import { ErrorResponse, AuthData } from "@aldabil/microservice-common";
import * as Tickets from "../model/ticket";

export const getTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const { user } = req.user;

    const tickets = await Tickets.getTickets();
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
};
export const getTicketById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const ticket = await Tickets.getTicketById(id);

    if (!ticket) {
      throw new ErrorResponse(404, "Ticket Not Found...");
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};
export const addTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: AuthData = req.user!; //Must exist
    ErrorResponse.validateRequest(req);

    const ticket = await Tickets.createTicket(req.body, user);

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const editTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: AuthData = req.user!; //Must exist
    const id: number = +req.params.id;
    ErrorResponse.validateRequest(req);

    const ticket = await Tickets.editTicket(id, req.body, user);

    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};
