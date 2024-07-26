import React, { useContext } from "react";
import axios from "axios";
import { toast } from "sonner";
import { AuthContext } from "../App";

export default function PaymentForm({ amount, wishlistId, userId }) {
  const { BACKEND_URL } = useContext(AuthContext);
  const redirectToStripeCheckout = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/create-checkout-session`,
        {
          amount: amount * 100, // Convert to smallest currency unit, e.g., cents
          wishlistId,
          userId,
        }
      );
      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Error redirecting to Stripe Checkout");
    }
  };

  return (
    <div>
      <button onClick={redirectToStripeCheckout}>Proceed to Payment</button>
    </div>
  );
}
