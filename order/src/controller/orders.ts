import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "@aldabil/microservice-common";
import { Order, OrderStatus } from "../models/orders";
import { Ticket, TicketDoc } from "../models/ticket";
import { natsClient } from "../nats";
import { OrderCreatedPublisher } from "../events/publishers/orderCreated";
import { OrderCancelledPublisher } from "../events/publishers/orderCancelled";

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req;
    const orders = await Order.find({ userId: user!.id }).populate("ticket");

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};
export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { user } = req;
    const order = await Order.findOne({
      _id: orderId,
      userId: user!.id,
    }).populate("ticket");

    if (!order) {
      throw new ErrorResponse(404, "Order not found...");
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    ErrorResponse.validateRequest(req);
    const { user } = req;
    const { ticketId } = req.body;

    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      throw new ErrorResponse(404, "Ticket not found");
    }
    // Check if reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new ErrorResponse(
        400,
        "Ticket currently reserved. Try again later"
      );
    }
    // Calculate expiration from now
    const after15Min = new Date();
    after15Min.setSeconds(after15Min.getSeconds() + 1 * 60);

    const order = Order.add({
      userId: user!.id,
      ticket: ticket.id,
      expiresAt: after15Min,
      status: OrderStatus.Created,
    });

    await order.save();
    order.ticket = ticket;

    // Emit orderCreated event
    new OrderCreatedPublisher(natsClient.client).publish({
      id: order.id,
      user_id: user!.id,
      expiresAt: order.expiresAt.toISOString(),
      status: order.status,
      version: order.version,
      ticket: {
        id: ticket.ticketId,
        price: ticket.price,
      },
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { user } = req;
    const order = await Order.findById(orderId).populate("ticket");

    if (!order) {
      throw new ErrorResponse(404, "Order not found...");
    }

    if (order.userId !== user?.id) {
      throw new ErrorResponse(401, "Unauthorized");
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish cancelled event
    const ticket = order.ticket as TicketDoc;
    new OrderCancelledPublisher(natsClient.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: ticket.ticketId,
      },
    });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
