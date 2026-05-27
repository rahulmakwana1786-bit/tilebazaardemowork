"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { ChevronLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/lib/axios";
import { validateUKPostcode, formatUKPostcode, isUKCountry } from "@/lib/deliveryValidation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const getProductImagePath = (product: any) => {
  if (!product || !product.image) return "/placeholder-tile.jpg";
  if (product.image.startsWith("http")) return product.image;
  if (product.image.startsWith("/tiles/")) return product.image;
  
  const category = (product.category || "").toLowerCase();
  const size = (product.size || "").toLowerCase();
  const imgName = product.image.toUpperCase();
  
  if (category === "accessories" || imgName.includes("TRIM") || imgName.includes("SPACER") || imgName.includes("WEDGE") || imgName.includes("MATTING") || imgName.includes("LEVEL") || imgName.includes("ADHESIVE") || imgName.includes("GLUE")) {
    if (imgName.includes("TRIM")) {
      return `/tiles/accessories/trim/${product.image}`;
    }
    if (imgName.includes("SPACER") || imgName.includes("WEDGE")) {
      return `/tiles/accessories/spacer/${product.image}`;
    }
    if (imgName.includes("MATTING") || imgName.includes("LEVEL")) {
      return `/tiles/accessories/matting/${product.image}`;
    }
    if (imgName.includes("ADHESIVE") || imgName.includes("GLUE")) {
      return `/tiles/accessories/adhesive/${product.image}`;
    }
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
  // New Arrivals & Outdoor tiles are priced at £18
  if (name.includes('AURL GRIGIO') || name.includes('PAVE') || name.includes('SALT CONCRETO') || name.includes('SALTED CONCRETO') || name.includes('OUTDOOR')) return 18;
  // All other regular tiles are £15
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

  // Validation Error State
  const [errors, setErrors] = useState({
    address: "",
    postcode: "",
    country: "",
  });

  // Ref to hold created local order ID securely across async PayPal callbacks
  const [createdLocalOrderId, setCreatedLocalOrderId] = useState<string | null>(null);
  const localOrderIdRef = useRef<string | null>(null);

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

  const totalPrice = cartItems.reduce((acc, item) => {
    return acc + getProductPrice(item.product) * item.quantity;
  }, 0);

  // Real-time Validation Checker
  const validateField = (name: string, value: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (name === "address") {
        next.address = value.trim() ? "" : "Address is required";
      } else if (name === "postcode") {
        next.postcode = validateUKPostcode(value) ? "" : "Wrong postcode";
      } else if (name === "country") {
        next.country = isUKCountry(value) ? "" : "Logistics available only in UK";
      }
      return next;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "postcode") {
      updatedValue = value.toUpperCase();
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: updatedValue };
      return next;
    });

    validateField(name, updatedValue);
  };

  // Auto-formatting postcode on blur
  const handlePostcodeBlur = () => {
    const formatted = formatUKPostcode(formData.postcode);
    setFormData((prev) => ({ ...prev, postcode: formatted }));
    
    setErrors((prev) => ({
      ...prev,
      postcode: validateUKPostcode(formatted) ? "" : "Wrong postcode",
    }));
  };

  // Determine if full form is valid
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

  if (!isMounted) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#faf9f8] pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        <div className="bg-white p-12 max-w-xl w-full text-center shadow-2xl border border-gray-100">
          <CheckCircle2 className="w-20 h-20 text-[#4a2c2a] mx-auto mb-8" strokeWidth={1.5} />
          <h1 className="text-4xl font-serif text-[#4a2c2a] mb-4">Payment Confirmed</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Thank you for your purchase. Your payment was securely processed via PayPal, and your order is now being processed. You will receive an email confirmation shortly.
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
      <div className="max-w-[1200px] mx-auto px-4 md:px-10">
        
        {/* Header */}
        <div className="mb-12">
          <Link href="/products" className="inline-flex items-center text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#4a2c2a] transition-colors mb-6">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Gallery
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif text-[#4a2c2a]">Secure Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column: Form */}
          <div className="w-full lg:w-3/5">
            <div className="space-y-10">
              
              {/* Contact Information */}
              <div>
                <h2 className="text-[13px] font-black uppercase tracking-widest text-[#4a2c2a] mb-6 pb-2 border-b border-gray-100">
                  1. Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-[#4a2c2a] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">First Name *</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-[#4a2c2a] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Last Name *</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-[#4a2c2a] transition-colors" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Phone Number *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-[#4a2c2a] transition-colors" />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-[13px] font-black uppercase tracking-widest text-[#4a2c2a] mb-6 pb-2 border-b border-gray-100">
                  2. Logistics Address (UK Only)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Street Address *</label>
                    <input 
                      required 
                      type="text" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                      className={`w-full border px-4 py-3 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-[#4a2c2a] transition-colors ${errors.address ? 'border-red-500' : 'border-gray-200'}`}                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">{errors.address}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">City *</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-[#4a2c2a] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Postcode *</label>
                    <input 
                      required 
                      type="text" 
                      name="postcode" 
                      value={formData.postcode} 
                      onChange={handleInputChange}
                      onBlur={handlePostcodeBlur}
                      placeholder="e.g. SW1A 1AA"
                      className={`w-full border px-4 py-3 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-[#4a2c2a] transition-colors uppercase ${errors.postcode ? 'border-red-500' : 'border-gray-200'}`}                    />
                    {errors.postcode && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">{errors.postcode}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Country *</label>
                    <select 
                      name="country" 
                      value={formData.country} 
                      onChange={handleInputChange} 
                      className={`w-full border bg-white px-4 py-3 text-sm text-black focus:outline-none focus:border-[#4a2c2a] transition-colors ${errors.country ? 'border-red-500' : 'border-gray-200'}`}                    >
                      <option value="United Kingdom">United Kingdom (UK)</option>
                      <option value="United States">United States (US)</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Ireland">Ireland</option>
                    </select>
                    {errors.country && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">{errors.country}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-[13px] font-black uppercase tracking-widest text-[#4a2c2a] mb-6 pb-2 border-b border-gray-100">
                  3. Secure Payment
                </h2>
                <div className="border border-gray-200 bg-[#faf9f8] p-5 mb-4 flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full border-[4px] border-[#4a2c2a] bg-white flex-shrink-0"></div>
                  <span className="text-sm font-bold text-[#4a2c2a]">PayPal Checkout / Visa Card</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  We support payments securely via PayPal. You can complete your transaction with a PayPal account or pay directly with your Visa/debit card through the PayPal portal.
                </p>
              </div>

            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-2/5">
            <div className="bg-[#faf9f8] p-8 border border-gray-100 sticky top-32">
              <h2 className="text-[13px] font-black uppercase tracking-widest text-[#4a2c2a] mb-8">
                Order Summary
              </h2>

              {cartItems.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 italic mb-6">Your cart is currently empty.</p>
                  <Link href="/products" className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a] border-b border-[#4a2c2a] pb-1 hover:text-black hover:border-black transition-colors">
                    Return to Gallery
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {cartItems.map((item) => {
                      const product = item.product;
                      if (!product) return null;
                      return (
                        <div key={item.id} className="flex gap-4">
                          <div className="relative w-20 h-20 bg-white border border-gray-100 flex-shrink-0">
                            <Image 
                              src={getProductImagePath(product)} 
                              alt={product.name} 
                              fill 
                              className="object-cover"
                            />
                            <div className="absolute -top-2 -right-2 bg-[#4a2c2a] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex flex-col justify-center">
                            <h4 className="text-[11px] font-bold uppercase text-[#4a2c2a] leading-tight mb-1">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              £{getProductPrice(product).toFixed(2)} /m²
                            </p>
                          </div>
                          <div className="ml-auto flex items-center">
                            <p className="text-[12px] font-bold text-[#4a2c2a]">
                              £{(getProductPrice(product) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-200 pt-6 space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-bold text-[#4a2c2a]">£{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Logistics</span>
                      <span className="text-gray-500">£15.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">VAT (20% UK standard)</span>
                      <span className="text-gray-500">£{(totalPrice * 0.20).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-[#4a2c2a] pt-6 mb-8">
                    <div className="flex justify-between items-end">
                      <span className="text-[13px] font-black uppercase tracking-widest text-[#4a2c2a]">Total</span>
                      <span className="text-2xl font-serif text-[#4a2c2a]">£{(totalPrice * 1.20 + 15).toFixed(2)}</span>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 mb-6 text-xs font-bold uppercase tracking-wider text-center rounded-sm flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Payment Button Container */}
                  <div className="mt-6">
                    {isProcessing ? (
                      <div className="w-full py-5 border border-gray-200 bg-gray-50 text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em] flex justify-center items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#4a2c2a]" />
                        <span>Processing Payment...</span>
                      </div>
                    ) : !isFormValid ? (
                      <button
                        disabled
                        className="w-full bg-[#4a2c2a] text-white py-5 text-[11px] font-bold uppercase tracking-[0.2em] opacity-40 cursor-not-allowed flex justify-center items-center gap-2"
                      >
                        Enter Address to Pay
                      </button>
                    ) : (
                      <div className="animate-in fade-in duration-300">
                        <PayPalScriptProvider
                          options={{
                            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
                            currency: "GBP",
                            intent: "capture"
                          }}
                        >
                          <PayPalButtons
                            style={{
                              layout: "vertical",
                              color: "gold",
                              shape: "rect",
                              label: "checkout",
                              tagline: false
                            }}
                            createOrder={async () => {
                              setIsProcessing(true);
                              setErrorMsg(null);
                              try {
                                const response = await api.post("/api/payments/create-order", {
                                  address_line1: formData.address,
                                  city: formData.city,
                                  postcode: formData.postcode,
                                  country: formData.country,
                                });
                                setCreatedLocalOrderId(response.data.orderId);
                                localOrderIdRef.current = response.data.orderId;
                                return response.data.paypalOrderId;
                              } catch (err: any) {
                                setIsProcessing(false);
                                const msg = err.response?.data?.message || err.message || "Failed to initiate payment";
                                setErrorMsg(msg);
                                throw new Error(msg);
                              }
                            }}
                            onApprove={async (data) => {
                              try {
                                const orderId = localOrderIdRef.current || createdLocalOrderId;
                                await api.post("/api/payments/capture-order", {
                                  orderId: orderId,
                                  paypalOrderId: data.orderID,
                                });
                                dispatch(clearCart());
                                setIsSuccess(true);
                                setIsProcessing(false);
                              } catch (err: any) {
                                setIsProcessing(false);
                                const msg = err.response?.data?.message || err.message || "Failed to capture payment";
                                setErrorMsg(msg);
                              }
                            }}
                            onError={(err) => {
                              setIsProcessing(false);
                              console.error("PayPal Script Error:", err);
                              setErrorMsg("An error occurred during PayPal checkout. Please check details or try again.");
                            }}
                            onCancel={() => {
                              setIsProcessing(false);
                            }}
                          />
                        </PayPalScriptProvider>
                      </div>
                    )}
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
