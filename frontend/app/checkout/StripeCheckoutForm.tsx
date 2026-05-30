"use client";

import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import api from "@/lib/axios";

interface StripeCheckoutFormProps {
  onSuccess: (orderId: string) => void;
  createIntent: () => Promise<{ clientSecret: string; orderId: string } | null>;
  isFormValid: boolean;
  formData: any;
}

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#111827",
      fontFamily: "system-ui, -apple-system, sans-serif",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
    },
  },
};

export default function StripeCheckoutForm({
  onSuccess,
  createIntent,
  isFormValid,
  formData,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [nameOnCard, setNameOnCard] = useState("");
  const [useShipping, setUseShipping] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError("Please fill out all address fields before paying.");
      return;
    }
    if (!nameOnCard.trim()) {
      setError("Please enter the name on the card.");
      return;
    }
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    // 1. Create intent
    const intentData = await createIntent();
    if (!intentData) {
      setIsProcessing(false);
      return; // Error already handled in parent
    }

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    // 2. Confirm payment
    const { error: submitError, paymentIntent } = await stripe.confirmCardPayment(
      intentData.clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: nameOnCard,
            email: formData.email,
            phone: formData.phone,
            address: useShipping ? {
              line1: formData.address,
              city: formData.city,
              postal_code: formData.postcode,
              country: "GB",
            } : undefined,
          },
        },
      }
    );

    if (submitError) {
      setError(submitError.message || "An error occurred during payment.");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      try {
        await api.post("/api/payments/confirm-stripe-payment", { orderId: intentData.orderId });
      } catch (e) {
        console.error(e);
      }
      dispatch(clearCart());
      onSuccess(intentData.orderId);
    } else {
      setError("Payment failed or requires further action.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
      
      {/* Logos */}
      <div className="flex items-center gap-3 mb-6">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Card Number *</label>
        <div className="w-full border border-gray-200 px-4 py-3.5 bg-white focus-within:border-[#4a2c2a] transition-colors">
          <CardNumberElement options={ELEMENT_OPTIONS} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Expiry Date *</label>
          <div className="w-full border border-gray-200 px-4 py-3.5 bg-white focus-within:border-[#4a2c2a] transition-colors">
            <CardExpiryElement options={ELEMENT_OPTIONS} />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">CVV *</label>
          <div className="w-full border border-gray-200 px-4 py-3.5 bg-white focus-within:border-[#4a2c2a] transition-colors">
            <CardCvcElement options={ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Name On Card *</label>
        <input 
          required 
          type="text" 
          value={nameOnCard}
          onChange={(e) => setNameOnCard(e.target.value)}
          className="w-full border border-gray-200 px-4 py-3.5 text-base text-gray-900 font-medium focus:outline-none focus:border-[#4a2c2a] transition-colors"
        />
      </div>

      <div className="pt-2 pb-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={useShipping} 
            onChange={(e) => setUseShipping(e.target.checked)}
            className="w-4 h-4 text-[#4a2c2a] border-gray-300 rounded focus:ring-[#4a2c2a]"
          />
          <span className="text-sm font-medium text-gray-700">Use shipping address as billing address</span>
        </label>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 text-xs font-bold uppercase tracking-wider text-center">{error}</div>}
      
      <button
        disabled={!stripe || isProcessing}
        type="submit"
        className="w-full bg-[#4a2c2a] text-white py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50 mt-4"
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
