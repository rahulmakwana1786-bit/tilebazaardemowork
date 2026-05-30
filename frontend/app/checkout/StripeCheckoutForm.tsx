"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import api from "@/lib/axios";

interface StripeCheckoutFormProps {
  onSuccess: (orderId: string) => void;
  orderId: string;
}

export default function StripeCheckoutForm({
  onSuccess,
  orderId,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order_id=${orderId}`,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message || "An error occurred during payment.");
      setIsProcessing(false);
      return;
    }

    // Payment successful without redirect
    try {
      // Maybe confirm the order status with the backend
      await api.post("/api/payments/confirm-stripe-payment", { orderId });
    } catch (e) {
      console.error(e);
    }
    dispatch(clearCart());
    onSuccess(orderId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
      <button
        disabled={!stripe || isProcessing}
        type="submit"
        className="w-full bg-[#4a2c2a] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </button>
    </form>
  );
}
