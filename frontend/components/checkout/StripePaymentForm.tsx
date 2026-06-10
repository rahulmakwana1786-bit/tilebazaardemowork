import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { useAppDispatch } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  onSuccess: () => void;
  onCancel: () => void;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export default function StripePaymentForm({ clientSecret, orderId, onSuccess, onCancel, email, firstName, lastName, phone }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        setErrorMsg(error.message || "An error occurred with Stripe.");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Capture on backend
        await api.post("/api/payments/capture-stripe", {
          orderId,
          paymentIntentId: paymentIntent.id,
          email,
          firstName,
          lastName,
          phone
        });
        
        dispatch(clearCart());
        setIsProcessing(false);
        onSuccess();
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to capture payment");
    }
  };

  const CARD_OPTIONS = {
    iconStyle: 'solid' as const,
    style: {
      base: {
        iconColor: '#4a2c2a',
        color: '#000',
        fontWeight: 500,
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': {
          color: '#fce883',
        },
        '::placeholder': {
          color: '#87bbfd',
        },
      },
      invalid: {
        iconColor: '#ffc7ee',
        color: '#ffc7ee',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-200 p-4 bg-white shadow-sm">
        <CardElement options={CARD_OPTIONS} />
      </div>
      
      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3 text-[11px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 border border-gray-300 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-[2] bg-[#4a2c2a] text-white py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#3a1c1a] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Pay Securely"
          )}
        </button>
      </div>
    </form>
  );
}
