import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
const stripePromise = loadStripe("pk_test_cVoufDUWucBryWVrQbHAaDqN006IP0ggZ9");

const StripeLoader = ({ children, locale }) => {
  return (
    <Elements stripe={stripePromise} options={{ locale }}>
      {children}
    </Elements>
  );
};

export default StripeLoader;
