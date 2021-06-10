import React, { useMemo, useState, useEffect } from "react";
import {
  useStripe,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import {
  StripePaymentRequestButtonElementOptions,
  PaymentRequest,
} from "@stripe/stripe-js";

const useOptions = (paymentRequest) => {
  const options: StripePaymentRequestButtonElementOptions = useMemo(
    () => ({
      paymentRequest,
      style: {
        paymentRequestButton: {
          theme: "dark",
          height: "48px",
          type: "buy",
        },
      },
    }),
    [paymentRequest]
  );

  return options;
};

const usePaymentRequest = ({ options, onPaymentMethod }) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (stripe && paymentRequest === null) {
      const pr: PaymentRequest = stripe.paymentRequest(options);
      setPaymentRequest(pr);
    }
  }, [stripe, options, paymentRequest]);

  useEffect(() => {
    let subscribed = true;
    if (paymentRequest) {
      paymentRequest.canMakePayment().then((res) => {
        if (res && subscribed) {
          setCanMakePayment(true);
        }
      });
    }

    return () => {
      subscribed = false;
    };
  }, [paymentRequest]);

  useEffect(() => {
    if (paymentRequest) {
      paymentRequest.on("paymentmethod", onPaymentMethod);
    }
    return () => {
      if (paymentRequest) {
        paymentRequest.off("paymentmethod", onPaymentMethod);
      }
    };
  }, [paymentRequest, onPaymentMethod]);

  return canMakePayment ? paymentRequest : null;
};

const CardButton = ({
  amount,
  label = "Total",
  currency = "usd",
  country = "US",
  client_secret,
  onConfirm,
}) => {
  const paymentRequest = usePaymentRequest({
    options: {
      country,
      currency,
      total: {
        label,
        amount: Math.round(amount * 100),
      },
    },
    onPaymentMethod: ({ complete, paymentMethod, ...data }) => {
      console.log("[PaymentMethod]", paymentMethod);
      console.log("[Customer Data]", data);
      complete("success");
      onConfirm(paymentMethod, data);
    },
  });
  const options = useOptions(paymentRequest);

  if (!paymentRequest) {
    return null;
  }

  return <PaymentRequestButtonElement options={options} className="shadow" />;
};
export default CardButton;
