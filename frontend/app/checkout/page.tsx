"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart, fetchCart } from "@/store/slices/cartSlice";
import { ChevronLeft, Loader2, CheckCircle2, AlertCircle, CreditCard, Tag } from "lucide-react";
import api from "@/lib/axios";
import {
  validateUKPostcode,
  formatUKPostcode,
  isUKCountry,
} from "@/lib/deliveryValidation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckoutForm from "./StripeCheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

const getProductImagePath = (product: any) => {
  if (product?.name?.toUpperCase().includes('TRIM')) return '/images/accessories/trim/tile-trim.png';

  if (!product || !product.image) return "/placeholder-tile.jpg";
  if (product.image.startsWith("http")) return product.image;
  if (product.image.startsWith("/tiles/")) return product.image;

  const category = (product.category || "").toLowerCase();
  const size = (product.size || "").toLowerCase();
  const imgName = product.image.toUpperCase();

  if (
    category === "accessories" ||
    imgName.includes("TRIM") ||
    imgName.includes("SPACER") ||
    imgName.includes("WEDGE") ||
    imgName.includes("MATTING") ||
    imgName.includes("LEVEL") ||
    imgName.includes("ADHESIVE") ||
    imgName.includes("GLUE")
  ) {
    if (imgName.includes("TRIM")) return `/tiles/accessories/trim/${product.image}`;
    if (imgName.includes("SPACER") || imgName.includes("WEDGE")) return `/tiles/accessories/spacer/${product.image}`;
    if (imgName.includes("MATTING") || imgName.includes("LEVEL")) return `/tiles/accessories/matting/${product.image}`;
    if (imgName.includes("ADHESIVE") || imgName.includes("GLUE")) return `/tiles/accessories/adhesive/${product.image}`;
    return `/tiles/accessories/${product.image}`;
  }
  return `/tiles/${size}/${product.image}`;
};

const getFrontendPrice = (product: any): number => {
  const name = ((product?.name || "") + " " + (product?.slug || "") + " " + (product?.image || "")).toUpperCase();
  if (name.includes("TRIM")) return 8;
  if (name.includes("SPACER") || name.includes("WEDGE")) return 6;
  if (name.includes("ADHESIVE") || name.includes("GLUE")) return 12;
  if (name.includes("MATTING")) return 6;
  if (name.includes("AURL GRIGIO") || name.includes("PAVE") || name.includes("SALT CONCRETO") || name.includes("SALTED CONCRETO") || name.includes("OUTDOOR")) return 18;
  return 15;
};

const getProductPrice = (product: any) => {
  if (!product) return 0;
  const backendPrice = Number(product.price) || 0;
  const discountPrice = Number(product.discount_price) || 0;
  if (discountPrice > 0 && discountPrice < backendPrice) return discountPrice;
  return getFrontendPrice(product);
};

const getUnitString = (product: any) => {
  const upper = product?.name?.toUpperCase() || "";
  if (upper.includes("TRIM")) return "/ +vat/piece";
  if (upper.includes("DURA") || upper.includes("MATTING")) return "/ +vat/sqm";
  if (product?.category?.toUpperCase().includes("ACCESS") || product?.category?.toUpperCase().includes("ADHESIVE") || upper.includes("SPACER") || upper.includes("WEDGE") || upper.includes("LEVEL") || upper.includes("GLUE") || upper.includes("ADHESIVE") || upper.includes("VALIDUS") || upper.includes("POPULAR FRONT")) return "/ +vat/bag";
  return "/ m²";
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

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", address: "", city: "", postcode: "", phone: "", country: "United Kingdom",
  });
  const [errors, setErrors] = useState({ address: "", postcode: "", country: "" });

  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "stripe">("paypal");
  

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState<{ code: string; type: string; value: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const [createdLocalOrderId, setCreatedLocalOrderId] = useState<string | null>(null);
  const localOrderIdRef = useRef<string | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(15);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { if (isMounted && !token) router.push("/login?redirect=/checkout"); }, [token, isMounted, router]);
  useEffect(() => { if (token) dispatch(fetchCart()); }, [token, dispatch]);
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev, email: user.email || "", firstName: user.full_name?.split(" ")[0] || "",
        lastName: user.full_name?.split(" ").slice(1).join(" ") || "", phone: user.phone_number || "",
        address: user.address_line1 || "", city: user.city || "", postcode: user.postcode || "", country: user.country || "United Kingdom",
      }));
    }
  }, [user]);

  let totalSqm = 0, totalBoxes = 0, totalWeight = 0;
  cartItems.forEach((item) => {
    const isAccessory = (item.product as any)?.category?.toUpperCase().includes("ACCESS") || (item.product as any)?.category?.toUpperCase().includes("ADHESIVE");
    if (!isAccessory) {
      const boxes = item.boxes || item.quantity;
      const weight = item.weight || boxes * 29;
      const sqm = item.sqm || boxes * 1.44;
      totalBoxes += boxes; totalWeight += weight; totalSqm += sqm;
    }
  });

  const fullPallets = Math.floor(totalWeight / 1000);
  const remainder = totalWeight % 1000;
  let remainderType = "";
  if (remainder > 0) {
    if (remainder <= 25) remainderType = "PARCEL";
    else if (remainder <= 250) remainderType = "QUARTER";
    else if (remainder <= 500) remainderType = "HALF";
    else if (remainder <= 750) remainderType = "FULL LIGHT";
    else remainderType = "FULL";
  }
  const totalPalletsEstimate = totalWeight > 0 ? `${fullPallets} FULL${remainderType ? ` & 1 ${remainderType}` : ""}` : "None";

  const rawTotalPrice = cartItems.reduce((acc, item) => {
    const isAccessory = (item.product as any)?.category?.toUpperCase().includes("ACCESS") || (item.product as any)?.category?.toUpperCase().includes("ADHESIVE");
    const sqm = !isAccessory ? item.sqm || item.quantity * 1.44 : 0;
    return acc + getProductPrice(item.product) * (isAccessory ? item.quantity : sqm);
  }, 0);

  const discountAmount = discount ? (discount.type === "percentage" ? (rawTotalPrice * Number(discount.value)) / 100 : Number(discount.value)) : 0;
  const subtotalAfterDiscount = Math.max(0, rawTotalPrice - discountAmount);
  const vat = subtotalAfterDiscount * 0.2;
  const grandTotal = subtotalAfterDiscount + vat + deliveryCharge;

  const validateField = (name: string, value: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (name === "address") next.address = value.trim() ? "" : "Address is required";
      else if (name === "postcode") next.postcode = validateUKPostcode(value) ? "" : "Wrong postcode";
      else if (name === "country") next.country = isUKCountry(value) ? "" : "Logistics available only in UK";
      return next;
    });
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedValue = name === "postcode" ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
    validateField(name, updatedValue);
    if (name === "postcode") {
      const formatted = formatUKPostcode(updatedValue);
      if (validateUKPostcode(formatted)) {
        try {
          const response = await api.post("/api/delivery/calculate", { postcode: formatted, sqm: totalSqm, tileSize: "600x600" });
          if (response.data?.deliveryCharge !== undefined) setDeliveryCharge(response.data.deliveryCharge);
        } catch (err) {}
      }
    }
  };

  const handlePostcodeBlur = async () => {
    const formatted = formatUKPostcode(formData.postcode);
    setFormData((prev) => ({ ...prev, postcode: formatted }));
    const isValid = validateUKPostcode(formatted);
    setErrors((prev) => ({ ...prev, postcode: isValid ? "" : "Wrong postcode" }));
    if (isValid) {
      try {
        const response = await api.post("/api/delivery/calculate", { postcode: formatted, sqm: totalSqm, tileSize: "600x600" });
        if (response.data?.deliveryCharge !== undefined) setDeliveryCharge(response.data.deliveryCharge);
      } catch (err) {}
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      setCouponError(""); setCouponSuccess("");
      const res = await api.post("/api/coupons/validate", { code: couponCode });
      setDiscount({ ...res.data.coupon, value: Number(res.data.coupon.value) });
      setCouponSuccess("Coupon applied successfully!");
    } catch (e: any) {
      setCouponError(e.response?.data?.message || "Invalid coupon code");
      setDiscount(null);
    }
  };

  const isFormValid = formData.firstName.trim() !== "" && formData.lastName.trim() !== "" && formData.email.trim() !== "" && formData.phone.trim() !== "" && formData.address.trim() !== "" && formData.city.trim() !== "" && formData.postcode.trim() !== "" && formData.country.trim() !== "" && errors.address === "" && errors.postcode === "" && errors.country === "";

    const createStripeIntent = async () => {
    try {
      const res = await api.post("/api/payments/create-payment-intent", {
        amount: grandTotal,
        currency: "gbp",
        discountCode: discount?.code,
        address_line1: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        country: formData.country,
      });
      setCreatedLocalOrderId(res.data.orderId);
      localOrderIdRef.current = res.data.orderId;
      return res.data;
    } catch (err: any) {
      console.error("Stripe Intent Error:", err);
      setErrorMsg("Failed to initialize card payment");
      return null;
    }
  };

  if (!isMounted) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#faf9f8] pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        <div className="bg-white p-12 max-w-xl w-full text-center shadow-2xl border border-gray-100">
          <CheckCircle2 className="w-20 h-20 text-[#4a2c2a] mx-auto mb-8" strokeWidth={1.5} />
          <h1 className="text-4xl font-serif text-[#4a2c2a] mb-4">Payment Confirmed</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">Thank you for your purchase. Your payment was securely processed and your order is now being processed.</p>
          <div className="bg-[#fbfbfb] p-6 mb-8 text-left border border-gray-50">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Order Reference</p>
            <p className="text-lg font-bold text-[#4a2c2a]">#TB-{createdLocalOrderId || Math.floor(Math.random() * 1000000)}</p>
          </div>
          <Link href="/products" className="inline-block bg-[#4a2c2a] text-white px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-colors">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10">
        <div className="mb-12">
          <Link href="/products" className="inline-flex items-center text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#4a2c2a] transition-colors mb-6"><ChevronLeft className="w-4 h-4 mr-1" /> Back to Gallery</Link>
          <h1 className="text-4xl md:text-5xl font-serif text-[#4a2c2a]">Secure Checkout</h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="w-full lg:w-3/5">
            <div className="space-y-10">
              <div>
                <h2 className="text-[13px] font-black uppercase tracking-widest text-[#4a2c2a] mb-6 pb-2 border-b border-gray-100">1. Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address *</label><input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-200 px-4 py-3 text-base text-gray-900 font-medium focus:outline-none focus:border-[#4a2c2a]" /></div>
                  <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">First Name *</label><input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-gray-200 px-4 py-3 text-base text-gray-900 font-medium focus:outline-none focus:border-[#4a2c2a]" /></div>
                  <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Last Name *</label><input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-gray-200 px-4 py-3 text-base text-gray-900 font-medium focus:outline-none focus:border-[#4a2c2a]" /></div>
                  <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Phone Number *</label><input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-200 px-4 py-3 text-base text-gray-900 font-medium focus:outline-none focus:border-[#4a2c2a]" /></div>
                </div>
              </div>
              <div>
                <h2 className="text-[13px] font-black uppercase tracking-widest text-[#4a2c2a] mb-6 pb-2 border-b border-gray-100">2. Logistics Address (UK Only)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Street Address *</label><input required type="text" name="address" value={formData.address} onChange={handleInputChange} className={`w-full border px-4 py-3 text-base text-gray-900 font-medium focus:outline-none focus:border-[#4a2c2a] ${errors.address ? "border-red-500" : "border-gray-200"}`} />{errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}</div>
                  <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">City *</label><input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-gray-200 px-4 py-3 text-base text-gray-900 font-medium focus:outline-none focus:border-[#4a2c2a]" /></div>
                  <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Postcode *</label><input required type="text" name="postcode" value={formData.postcode} onChange={handleInputChange} onBlur={handlePostcodeBlur} placeholder="e.g. SW1A 1AA" className={`w-full border px-4 py-3 text-base text-gray-900 font-medium uppercase focus:outline-none focus:border-[#4a2c2a] ${errors.postcode ? "border-red-500" : "border-gray-200"}`} />{errors.postcode && <p className="text-red-500 text-xs mt-1">{errors.postcode}</p>}</div>
                  <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Country *</label><select name="country" value={formData.country} onChange={handleInputChange} className={`w-full border bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#4a2c2a] ${errors.country ? "border-red-500" : "border-gray-200"}`}><option value="United Kingdom">United Kingdom (UK)</option></select>{errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}</div>
                </div>
              </div>
              <div>
                <h2 className="text-[13px] font-black uppercase tracking-widest text-[#4a2c2a] mb-6 pb-2 border-b border-gray-100">3. Secure Payment</h2>
                <div className="flex flex-col gap-4 mb-6">
                  <label className={`border p-4 flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === "stripe" ? "border-[#4a2c2a] bg-[#faf9f8]" : "border-gray-200"}`}>
                    <input type="radio" name="paymentMethod" value="stripe" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} className="w-4 h-4 text-[#4a2c2a] focus:ring-[#4a2c2a]" />
                    <CreditCard className="w-6 h-6 text-[#4a2c2a]" />
                    <span className="text-sm font-bold text-[#4a2c2a]">Credit / Debit Card</span>
                  </label>
                  <label className={`border p-4 flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === "paypal" ? "border-[#4a2c2a] bg-[#faf9f8]" : "border-gray-200"}`}>
                    <input type="radio" name="paymentMethod" value="paypal" checked={paymentMethod === "paypal"} onChange={() => setPaymentMethod("paypal")} className="w-4 h-4 text-[#4a2c2a] focus:ring-[#4a2c2a]" />
                    <div className="flex font-bold italic text-blue-800 text-lg"><span className="text-blue-900">Pay</span><span className="text-blue-400">Pal</span></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-2/5">
            <div className="bg-[#faf9f8] p-8 border border-gray-100 sticky top-32">
              <h2 className="text-[13px] font-black uppercase tracking-widest text-[#4a2c2a] mb-8">Order Summary</h2>
              {cartItems.length === 0 ? (
                <div className="text-center py-10"><p className="text-gray-400 italic mb-6">Your cart is currently empty.</p><Link href="/products" className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a] border-b border-[#4a2c2a] pb-1">Return to Gallery</Link></div>
              ) : (
                <>
                  <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {cartItems.map((item) => {
                      const product = item.product;
                      if (!product) return null;
                      return (
                        <div key={item.id} className="flex gap-4">
                          <div className="relative w-20 h-20 bg-white border border-gray-100 flex-shrink-0">
                            <Image src={getProductImagePath(product)} alt={product.name} fill className="object-cover" />
                            <div className="absolute -top-2 -right-2 bg-[#4a2c2a] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{item.quantity}</div>
                          </div>
                          <div className="flex flex-col justify-center">
                            <h4 className="text-[11px] font-bold uppercase text-[#4a2c2a] leading-tight mb-1">{product.name}</h4>
                            <p className="text-[11px] text-gray-500">£{getProductPrice(product).toFixed(2)} {getUnitString(product)}</p>
                          </div>
                          <div className="ml-auto flex items-center"><p className="text-[12px] font-bold text-[#4a2c2a]">£{(getProductPrice(product) * item.quantity).toFixed(2)}</p></div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mb-8 border-t border-gray-200 pt-6">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Discount code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 text-base text-gray-900 font-medium focus:outline-none focus:border-[#4a2c2a]" />
                      </div>
                      <button onClick={handleApplyCoupon} className="bg-gray-200 text-gray-800 px-6 py-3 text-[11px] font-bold uppercase tracking-wider hover:bg-gray-300 transition-colors">Apply</button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                    {couponSuccess && <p className="text-green-600 text-xs mt-2">{couponSuccess}</p>}
                  </div>

                  <div className="border-t border-gray-200 pt-6 space-y-4 mb-8">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-bold text-[#4a2c2a]">£{rawTotalPrice.toFixed(2)}</span></div>
                    {discountAmount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-£{discountAmount.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Logistics</span><span className="text-gray-500">£{deliveryCharge.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">VAT (20%)</span><span className="text-gray-500">£{vat.toFixed(2)}</span></div>
                  </div>
                  <div className="border-t border-[#4a2c2a] pt-6 mb-8">
                    <div className="flex justify-between items-end"><span className="text-[13px] font-black uppercase tracking-widest text-[#4a2c2a]">Total</span><span className="text-2xl font-serif text-[#4a2c2a]">£{grandTotal.toFixed(2)}</span></div>
                  </div>
                  {errorMsg && <div className="bg-red-50 border border-red-100 text-red-600 p-4 mb-6 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{errorMsg}</span></div>}
                  <div className="mt-6">
                    {!isFormValid ? (
                      <button disabled className="w-full bg-[#4a2c2a] text-white py-5 text-[11px] font-bold uppercase tracking-[0.2em] opacity-40 cursor-not-allowed">Enter Address to Pay</button>
                    ) : paymentMethod === "paypal" ? (
                      <div className="animate-in fade-in duration-300">
                        <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", currency: "GBP", intent: "capture" }}>
                          <PayPalButtons style={{ layout: "vertical", color: "gold", shape: "rect", label: "checkout", tagline: false }} createOrder={async () => { setIsProcessing(true); setErrorMsg(null); try { const response = await api.post("/api/payments/create-order", { address_line1: formData.address, city: formData.city, postcode: formData.postcode, country: formData.country, discountCode: discount?.code }); setCreatedLocalOrderId(response.data.orderId); localOrderIdRef.current = response.data.orderId; return response.data.paypalOrderId; } catch (err: any) { setIsProcessing(false); setErrorMsg(err.response?.data?.message || "Failed to initiate payment"); throw err; } }} onApprove={async (data) => { try { const orderId = localOrderIdRef.current || createdLocalOrderId; await api.post("/api/payments/capture-order", { orderId: orderId, paypalOrderId: data.orderID }); dispatch(clearCart()); setIsSuccess(true); setIsProcessing(false); } catch (err: any) { setIsProcessing(false); setErrorMsg(err.response?.data?.message || "Failed to capture payment"); } }} onError={(err) => { setIsProcessing(false); setErrorMsg("An error occurred during PayPal checkout. Please check details or try again."); }} onCancel={() => setIsProcessing(false)} />
                        </PayPalScriptProvider>
                      </div>
                    ) : (
                        <div className="animate-in fade-in duration-300 bg-white p-4 border border-gray-200">
                          <Elements stripe={stripePromise}>
                            <StripeCheckoutForm 
                              onSuccess={() => setIsSuccess(true)} 
                              createIntent={createStripeIntent} 
                              isFormValid={isFormValid} 
                              formData={formData} 
                            />
                          </Elements>
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
