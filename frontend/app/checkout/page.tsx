"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { ChevronLeft, Loader2, CheckCircle2, AlertCircle, CreditCard, Ticket } from "lucide-react";
import api from "@/lib/axios";
import { validateUKPostcode, formatUKPostcode, isUKCountry } from "@/lib/deliveryValidation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from "@/components/checkout/StripePaymentForm";

// Initialize Stripe outside component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_123');

const getProductImagePath = (product: any) => {
  if (!product || !product.image) return "/placeholder-tile.jpg";
  if (product.image.startsWith("http")) return product.image;
  if (product.image.startsWith("/tiles/")) return product.image;
  
  const category = (product.category || "").toLowerCase();
  const size = (product.size || "").toLowerCase();
  const imgName = product.image.toUpperCase();
  
  if (category === "accessories" || imgName.includes("TRIM") || imgName.includes("SPACER") || imgName.includes("WEDGE") || imgName.includes("MATTING") || imgName.includes("LEVEL") || imgName.includes("ADHESIVE") || imgName.includes("GLUE")) {
    if (imgName.includes("TRIM")) return `/tiles/accessories/trim/${product.image}`;
    if (imgName.includes("SPACER") || imgName.includes("WEDGE")) return `/tiles/accessories/spacer/${product.image}`;
    if (imgName.includes("MATTING") || imgName.includes("LEVEL")) return `/tiles/accessories/matting/${product.image}`;
    if (imgName.includes("ADHESIVE") || imgName.includes("GLUE")) return `/tiles/accessories/adhesive/${product.image}`;
    return `/tiles/accessories/${product.image}`;
  }
  
  return `/tiles/${size}/${product.image}`;
};

const getFrontendPrice = (product: any): number => {
  const name = ((product?.name || '') + ' ' + (product?.slug || '') + ' ' + (product?.image || '')).toUpperCase();
  if (name.includes('TRIM')) return 8;
  if (name.includes('SPACER') || name.includes('WEDGE')) return 6;
  if (name.includes('ADHESIVE') || name.includes('GLUE')) return 12;
  if (name.includes('MATTING')) return 6;
  if (name.includes('AURL GRIGIO') || name.includes('PAVE') || name.includes('SALT CONCRETO') || name.includes('SALTED CONCRETO') || name.includes('OUTDOOR')) return 18;
  return 15;
};

const getProductPrice = (product: any) => {
  if (!product) return 0;
  const backendPrice = Number(product.price) || 0;
  const discountPrice = Number(product.discount_price) || 0;
  if (discountPrice > 0 && discountPrice < backendPrice) {
    return discountPrice;
  }
  return getFrontendPrice(product);
};

const checkIsAccessory = (product: any): boolean => {
  if (!product) return false;
  const name = (product?.name || "").toUpperCase();
  const category = (product?.category || "").toUpperCase();
  const image = (product?.image || "").toUpperCase();
  return category === "ACCESSORIES" || 
         name.includes("TRIM") || name.includes("SPACER") || name.includes("WEDGE") || name.includes("MATTING") || name.includes("LEVEL") || name.includes("ADHESIVE") || name.includes("GLUE") ||
         image.includes("TRIM") || image.includes("SPACER") || image.includes("WEDGE") || image.includes("MATTING") || image.includes("LEVEL") || image.includes("ADHESIVE") || image.includes("GLUE") ||
         image.includes("/ACCESSORIES/");
};

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { token, user } = useAppSelector((state) => state.auth);

  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postcode: "",
    phone: "",
    country: "United Kingdom",
  });

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [createdLocalOrderId, setCreatedLocalOrderId] = useState<string | null>(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, value: number, type: 'fixed'|'percentage'} | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Validation Error State
  const [errors, setErrors] = useState({
    address: "",
    postcode: "",
    country: "",
  });

  const [logistics, setLogistics] = useState(15.00);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState('Mainland UK');

  const totalWeight = cartItems.reduce((acc, item) => {
    const product = item.product;
    const isAcc = checkIsAccessory(product);
    if (isAcc) return acc;
    return acc + (item.quantity * 29);
  }, 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !token) {
      router.push("/login?redirect=/checkout");
    }
  }, [token, isMounted, router]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.full_name?.split(" ")[0] || "",
        lastName: user.full_name?.split(" ").slice(1).join(" ") || "",
        phone: user.phone_number || "",
        address: user.address_line1 || "",
        city: user.city || "",
        postcode: user.postcode || "",
        country: user.country || "United Kingdom",
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchDeliveryRate = async () => {
      if (!formData.postcode) return;
      setIsCalculatingDelivery(true);
      try {
        const res = await api.get(`/api/delivery/rate?postcode=${formData.postcode}&weight=${totalWeight}`);
        setLogistics(res.data.price);
        setDeliveryZone(res.data.zone);
      } catch (err) {
        console.error("Error fetching delivery rate:", err);
      } finally {
        setIsCalculatingDelivery(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      if (validateUKPostcode(formData.postcode)) {
         fetchDeliveryRate();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [formData.postcode, totalWeight]);

  const subtotalPrice = cartItems.reduce((acc, item) => {
    const isAcc = checkIsAccessory(item.product);
    const multiplier = isAcc ? 1 : 1.44;
    return acc + getProductPrice(item.product) * item.quantity * multiplier;
  }, 0);

  const discountAmount = appliedCoupon 
    ? (appliedCoupon.type === 'percentage' ? subtotalPrice * (appliedCoupon.value / 100) : appliedCoupon.value)
    : 0;

  const vatEstimate = Math.max(0, (subtotalPrice - discountAmount) * 0.20);
  const finalTotal = Math.max(0, subtotalPrice - discountAmount) + logistics + vatEstimate;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await api.post("/api/coupons/validate", { code: couponCode });
      setAppliedCoupon(res.data.coupon);
      setCouponCode("");
    } catch (err: any) {
      setCouponError(err.response?.data?.message || "Invalid coupon");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const validateField = (name: string, value: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (name === "address") next.address = value.trim() ? "" : "Address is required";
      else if (name === "postcode") next.postcode = validateUKPostcode(value) ? "" : "Wrong postcode";
      else if (name === "country") next.country = isUKCountry(value) ? "" : "Logistics available only in UK";
      return next;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedValue = value;
    if (name === "postcode") updatedValue = value.toUpperCase();
    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
    validateField(name, updatedValue);
  };

  const handlePostcodeBlur = () => {
    const formatted = formatUKPostcode(formData.postcode);
    setFormData((prev) => ({ ...prev, postcode: formatted }));
    setErrors((prev) => ({ ...prev, postcode: validateUKPostcode(formatted) ? "" : "Wrong postcode" }));
  };

  const isFormValid = 
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.address.trim() !== "" &&
    formData.city.trim() !== "" &&
    formData.postcode.trim() !== "" &&
    formData.country.trim() !== "" &&
    errors.address === "" &&
    errors.postcode === "" &&
    errors.country === "";

  const initStripePayment = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const response = await api.post("/api/payments/create-stripe-intent", {
        address_line1: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        country: formData.country,
        couponCode: appliedCoupon?.code
      });
      setStripeClientSecret(response.data.clientSecret);
      setCreatedLocalOrderId(response.data.orderId);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isMounted) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#faf9f8] pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        <div className="bg-white p-12 max-w-xl w-full text-center shadow-2xl border border-gray-100">
          <CheckCircle2 className="w-20 h-20 text-[#4a2c2a] mx-auto mb-8" strokeWidth={1.5} />
          <h1 className="text-4xl font-serif text-[#4a2c2a] mb-4">Payment Confirmed</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Thank you for your purchase. Your payment was securely processed, and your order is now being processed. You will receive an email confirmation shortly.
          </p>
          <div className="bg-[#fbfbfb] p-6 mb-8 text-left border border-gray-50">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Order Reference</p>
            <p className="text-lg font-bold text-[#4a2c2a]">#TB-{createdLocalOrderId || Math.floor(Math.random() * 1000000)}</p>
          </div>
          <Link
            href="/products"
            className="inline-block bg-[#4a2c2a] text-white px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-[1300px] mx-auto px-4 md:px-10">
        
        {/* Header */}
        <div className="mb-12">
          <Link href="/products" className="inline-flex items-center text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#4a2c2a] transition-colors mb-6">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Gallery
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif text-[#4a2c2a]">Secure Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Form & Payment */}
          <div className="w-full lg:w-[55%]">
            <div className="space-y-10">
              
              {/* Contact Information */}
              <div>
                <h2 className="text-[16px] font-bold text-[#4a2c2a] mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="w-full border border-gray-200 px-4 py-3.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4a2c2a] transition-colors rounded-sm shadow-sm" />
                  </div>
                  <div>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className="w-full border border-gray-200 px-4 py-3.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4a2c2a] transition-colors rounded-sm shadow-sm" />
                  </div>
                  <div>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className="w-full border border-gray-200 px-4 py-3.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4a2c2a] transition-colors rounded-sm shadow-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number" className="w-full border border-gray-200 px-4 py-3.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4a2c2a] transition-colors rounded-sm shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-[16px] font-bold text-[#4a2c2a] mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <select 
                      name="country" 
                      value={formData.country} 
                      onChange={handleInputChange} 
                      className={`w-full border bg-white px-4 py-3.5 text-sm text-black focus:outline-none focus:border-[#4a2c2a] transition-colors rounded-sm shadow-sm ${errors.country ? 'border-red-500' : 'border-gray-200'}`}                    >
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                    {errors.country && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.country}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <input 
                      required 
                      type="text" 
                      name="address" 
                      placeholder="Address"
                      value={formData.address} 
                      onChange={handleInputChange} 
                      className={`w-full border px-4 py-3.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4a2c2a] transition-colors rounded-sm shadow-sm ${errors.address ? 'border-red-500' : 'border-gray-200'}`}                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.address}</p>}
                  </div>
                  <div>
                    <input required type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className="w-full border border-gray-200 px-4 py-3.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4a2c2a] transition-colors rounded-sm shadow-sm" />
                  </div>
                  <div>
                    <input 
                      required 
                      type="text" 
                      name="postcode" 
                      value={formData.postcode} 
                      onChange={handleInputChange}
                      onBlur={handlePostcodeBlur}
                      placeholder="Postcode"
                      className={`w-full border px-4 py-3.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4a2c2a] transition-colors rounded-sm shadow-sm uppercase ${errors.postcode ? 'border-red-500' : 'border-gray-200'}`}                    />
                    {errors.postcode && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.postcode}</p>}
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <h2 className="text-[16px] font-bold text-[#4a2c2a] mb-6">Billing Address</h2>
                <div className="border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                  <div 
                    onClick={() => setBillingSameAsShipping(true)}
                    className={`p-4 flex items-center gap-3 cursor-pointer border-b border-gray-200 ${billingSameAsShipping ? 'bg-blue-50/30' : 'bg-white'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${billingSameAsShipping ? 'border-[#4a2c2a]' : 'border-gray-300'}`}>
                      {billingSameAsShipping && <div className="w-2 h-2 rounded-full bg-[#4a2c2a]" />}
                    </div>
                    <span className="text-sm font-medium">Same as shipping address</span>
                  </div>
                  <div 
                    onClick={() => setBillingSameAsShipping(false)}
                    className={`p-4 flex items-center gap-3 cursor-pointer ${!billingSameAsShipping ? 'bg-blue-50/30' : 'bg-white'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!billingSameAsShipping ? 'border-[#4a2c2a]' : 'border-gray-300'}`}>
                      {!billingSameAsShipping && <div className="w-2 h-2 rounded-full bg-[#4a2c2a]" />}
                    </div>
                    <span className="text-sm font-medium">Use a different billing address</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-[16px] font-bold text-[#4a2c2a] mb-6">Payment</h2>
                <p className="text-xs text-gray-500 mb-4">All transactions are secure and encrypted.</p>
                
                <div className="border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                  
                  {/* Credit Card Option */}
                  <div 
                    onClick={() => { if (!stripeClientSecret) setPaymentMethod('card'); }}
                    className={`p-4 flex items-center justify-between cursor-pointer border-b border-gray-200 ${paymentMethod === 'card' ? 'bg-gray-50/80' : 'bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#4a2c2a]' : 'border-gray-300'}`}>
                        {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-[#4a2c2a]" />}
                      </div>
                      <span className="text-sm font-bold text-[#4a2c2a]">Credit/Debit Card</span>
                    </div>
                    <div className="flex gap-1">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="p-6 bg-gray-50/80 border-b border-gray-200">
                      {!isFormValid ? (
                        <div className="text-center py-6">
                          <p className="text-sm text-gray-500 mb-4">Please complete the required form fields above to proceed with payment.</p>
                        </div>
                      ) : stripeClientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                          <StripePaymentForm 
                            clientSecret={stripeClientSecret} 
                            orderId={createdLocalOrderId!} 
                            onSuccess={() => setIsSuccess(true)}
                            onCancel={() => setStripeClientSecret(null)}
                          />
                        </Elements>
                      ) : (
                        <button
                          onClick={initStripePayment}
                          disabled={isProcessing}
                          className="w-full bg-[#4a2c2a] text-white py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#3a1c1a] transition-colors flex justify-center items-center gap-2"
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Proceed to Secure Payment"}
                        </button>
                      )}
                      
                      {errorMsg && paymentMethod === 'card' && !stripeClientSecret && (
                        <div className="mt-4 bg-red-50 text-red-600 p-3 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> {errorMsg}
                        </div>
                      )}
                    </div>
                  )}

                  {/* PayPal Option */}
                  <div 
                    onClick={() => { if (!stripeClientSecret) setPaymentMethod('paypal'); }}
                    className={`p-4 flex items-center justify-between cursor-pointer ${paymentMethod === 'paypal' ? 'bg-gray-50/80 border-t border-gray-200' : 'bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'paypal' ? 'border-[#4a2c2a]' : 'border-gray-300'}`}>
                        {paymentMethod === 'paypal' && <div className="w-2 h-2 rounded-full bg-[#4a2c2a]" />}
                      </div>
                      <span className="text-sm font-bold text-[#4a2c2a]">PayPal</span>
                    </div>
                    <div className="font-bold text-[#003087] text-lg italic tracking-tighter">
                      Pay<span className="text-[#009cde]">Pal</span>
                    </div>
                  </div>

                  {paymentMethod === 'paypal' && (
                    <div className="p-6 bg-gray-50/80">
                      <p className="text-sm text-gray-500 mb-6 text-center">
                        After clicking "Pay with PayPal", you will be redirected to PayPal to complete your purchase securely.
                      </p>
                      
                      {!isFormValid ? (
                        <div className="w-full bg-gray-200 text-gray-400 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-center cursor-not-allowed">
                          Enter Shipping Info First
                        </div>
                      ) : (
                        <div className="animate-in fade-in duration-300 max-w-sm mx-auto">
                          <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", currency: "GBP" }}>
                            <PayPalButtons
                              style={{ layout: "vertical", color: "gold", shape: "rect" }}
                              createOrder={async () => {
                                setIsProcessing(true);
                                setErrorMsg(null);
                                try {
                                  const response = await api.post("/api/payments/create-order", {
                                    address_line1: formData.address,
                                    city: formData.city,
                                    postcode: formData.postcode,
                                    country: formData.country,
                                    couponCode: appliedCoupon?.code
                                  });
                                  setCreatedLocalOrderId(response.data.orderId);
                                  return response.data.paypalOrderId;
                                } catch (err: any) {
                                  setIsProcessing(false);
                                  throw new Error(err.response?.data?.message || err.message);
                                }
                              }}
                              onApprove={async (data) => {
                                try {
                                  await api.post("/api/payments/capture-order", {
                                    orderId: createdLocalOrderId,
                                    paypalOrderId: data.orderID,
                                  });
                                  dispatch(clearCart());
                                  setIsSuccess(true);
                                } catch (err: any) {
                                  setIsProcessing(false);
                                  setErrorMsg(err.response?.data?.message || err.message);
                                }
                              }}
                              onError={(err) => {
                                setIsProcessing(false);
                                setErrorMsg("An error occurred during PayPal checkout.");
                              }}
                              onCancel={() => setIsProcessing(false)}
                            />
                          </PayPalScriptProvider>
                        </div>
                      )}
                      {errorMsg && paymentMethod === 'paypal' && (
                        <div className="mt-4 bg-red-50 text-red-600 p-3 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> {errorMsg}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="w-full lg:w-[45%]">
            <div className="bg-[#faf9f8] p-6 sm:p-8 border border-gray-100 lg:sticky lg:top-32 shadow-sm rounded-sm">
              <h2 className="text-[16px] font-bold text-[#4a2c2a] mb-6">Order Summary</h2>

              {cartItems.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 italic mb-6">Your cart is currently empty.</p>
                  <Link href="/products" className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a] border-b border-[#4a2c2a] pb-1 hover:text-black hover:border-black transition-colors">
                    Return to Gallery
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-5 mb-8 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                    {cartItems.map((item) => {
                      const product = item.product;
                      if (!product) return null;
                      const isAcc = checkIsAccessory(product);
                      const coverage = isAcc ? item.quantity : item.quantity * 1.44;
                      const price = getProductPrice(product);

                      return (
                        <div key={item.id} className="flex gap-4 items-center">
                          <div className="relative w-16 h-16 bg-white border border-gray-200 flex-shrink-0 rounded-sm shadow-sm overflow-hidden">
                            <Image 
                              src={getProductImagePath(product)} 
                              alt={product.name} 
                              fill 
                              className="object-cover"
                            />
                            <div className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold opacity-90">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h4 className="text-[12px] font-bold text-[#4a2c2a] leading-tight mb-1">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              {isAcc ? `£${price.toFixed(2)} each` : `£${price.toFixed(2)} /m² • ${product.size} • ${coverage.toFixed(2)} SQM`}
                            </p>
                          </div>
                          <div className="font-bold text-[13px] text-[#4a2c2a]">
                            £{(price * coverage).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Discount Code */}
                  <div className="border-t border-gray-200 pt-6 pb-6">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Discount code or gift card"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          disabled={!!appliedCoupon || validatingCoupon}
                          className="w-full border border-gray-200 px-4 py-3.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4a2c2a] transition-colors rounded-sm shadow-sm uppercase disabled:bg-gray-50 disabled:text-gray-400"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || !!appliedCoupon || validatingCoupon}
                        className="bg-gray-200 text-gray-600 px-6 py-3 text-[11px] font-bold uppercase tracking-wider rounded-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs mt-2 font-semibold">{couponError}</p>}
                    {appliedCoupon && (
                      <div className="mt-3 flex items-center justify-between bg-green-50 text-green-700 px-4 py-2 rounded-sm border border-green-200">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Ticket className="w-4 h-4" /> {appliedCoupon.code} applied!
                        </div>
                        <button onClick={() => setAppliedCoupon(null)} className="text-xs underline hover:text-green-800">Remove</button>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-200 pt-6 space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-bold text-[#4a2c2a]">£{subtotalPrice.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Discount ({appliedCoupon.code})</span>
                        <span className="font-bold text-green-600">-£{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500">
                        Shipping <span className="text-[10px] uppercase bg-gray-100 px-1 py-0.5 rounded ml-1">{deliveryZone}</span>
                      </span>
                      <span className="text-gray-500 flex items-center gap-2">
                        {isCalculatingDelivery && <Loader2 className="w-3 h-3 animate-spin" />}
                        £{logistics.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">VAT (20%)</span>
                      <span className="text-gray-500">£{vatEstimate.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[16px] font-bold text-[#4a2c2a]">Total</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-400">GBP</span>
                        <span className="text-3xl font-serif text-[#4a2c2a]">£{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
