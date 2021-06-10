import { Request, Response, NextFunction } from "express";
import { ErrorResponse, OrderStatus } from "@aldabil/microservice-common";
import { natsClient } from "../nats";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publisher/paymentCreated";
import { stripe } from "../stripe";

export const getStripeIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req;
    const { order_id } = req.query;
    const order = await Order.findOne({ _id: order_id, userId: user!.id });

    if (order?.status !== OrderStatus.Created) {
      throw new ErrorResponse(400, "Order has expired or not exist...");
    }

    // Stripe charge
    console.log(Math.round(+order?.total * 100));
    const intent = await stripe.paymentIntents.create(
      {
        amount: Math.round(+order?.total * 100),
        currency: "usd",
        description: `Order ID: ${order?.id}`,
      },
      { idempotencyKey: order_id as string }
    );

    res.status(201).json({ success: true, data: intent.client_secret });
  } catch (error) {
    next(error);
  }
};

export const createCharge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    ErrorResponse.validateRequest(req);

    const { user } = req;
    const { order_id, pi } = req.body;
    const order = await Order.findOne({ _id: order_id, userId: user!.id });

    if (!order) {
      throw new ErrorResponse(404, "Order not found...");
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new ErrorResponse(410, "Order already been cancelled...");
    }

    // Stripe charge
    const stripePayment = await stripe.paymentIntents.retrieve(pi);

    if (!stripePayment.charges?.data?.length) {
      throw new ErrorResponse(402, "No payment found... Try to refresh.");
    }

    const payment = Payment.add({
      order_id: order.id,
      charge_id: stripePayment.charges.data[0].id,
    });
    await payment.save();

    new PaymentCreatedPublisher(natsClient.client).publish({
      id: payment.id,
      order_id: payment.order_id,
      charge_id: payment.charge_id,
    });

    res.status(201).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
