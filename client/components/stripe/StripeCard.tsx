import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

const StripeCard = ({ amount, client_secret, onConfirm }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    setLoading(true);
    try {
      // Use your card Element with other Stripe.js APIs
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: "Some Customer",
            },
          },
        }
      );

      if (error) {
        console.log("[error]", error);
        setError(error);
      } else {
        console.log("[PaymentMethod]", paymentIntent);
        await onConfirm(paymentIntent);
      }
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error?.message && (
        <div className="alert alert-danger my-2" role="alert">
          {error.message}
        </div>
      )}
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
          hidePostalCode: true,
        }}
        className="p-2 bg-light shadow"
      />
      <button
        type="submit"
        className="btn btn-block btn-primary shadow"
        disabled={!stripe || loading}
        style={{ borderRadius: "0 0 3px 3px" }}
      >
        {loading && (
          <span
            className="spinner-border spinner-border-sm mx-2"
            role="status"
            aria-hidden="true"
          ></span>
        )}
        Pay ${amount}
      </button>
    </form>
  );
};

export default StripeCard;
