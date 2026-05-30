const fs = require('fs');
let code = fs.readFileSync('frontend/app/checkout/page.tsx', 'utf-8');

// 1. Remove clientSecret state
code = code.replace(/const \[clientSecret\, setClientSecret\] = useState\<string \| null\>\(null\)\;/g, '');

// 2. Replace useEffect with createStripeIntent
const useEffectRegex = /useEffect\(\(\) => \{\s*if \(paymentMethod === \"stripe\" \&\& isFormValid\) \{\s*api\.post\(\"\/api\/payments\/create-payment-intent\"[\s\S]*?\}\, \[paymentMethod, isFormValid, grandTotal, discount\?\.code\]\)\;/;

const createStripeIntentString = `  const createStripeIntent = async () => {
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
  };`;

code = code.replace(useEffectRegex, createStripeIntentString);

// 3. Replace the render block
const renderBlockRegex = /\) : clientSecret \? \([\s\S]*?\<\/Elements\>\s*\<\/div\>\s*\) : \([\s\S]*?Payment\.\.\.\<\/span\>\<\/div\>\s*\)\}/;

const newRenderBlock = `) : (
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
                      )}`;

code = code.replace(renderBlockRegex, newRenderBlock);

fs.writeFileSync('frontend/app/checkout/page.tsx', code);
console.log('done');
