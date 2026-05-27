import dotenv from 'dotenv';

dotenv.config();

const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_MODE = 'sandbox'
} = process.env;

const base = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

/**
 * Generate an OAuth 2.0 Access Token from PayPal Client ID and Client Secret.
 */
export async function getAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in .env file.");
  }
  
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to generate PayPal access token: ${JSON.stringify(errorData)}`);
  }
  
  const data = await response.json() as { access_token: string };
  return data.access_token;
}

/**
 * Create a PayPal Order for a given amount.
 */
export async function createPaypalOrder(amount: number, currency: string = "GBP"): Promise<any> {
  const token = await getAccessToken();
  const response = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          }
        }
      ]
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create PayPal order: ${JSON.stringify(errorData)}`);
  }
  
  return response.json();
}

/**
 * Capture a PayPal Order by ID.
 */
export async function capturePaypalOrder(paypalOrderId: string): Promise<any> {
  const token = await getAccessToken();
  const response = await fetch(`${base}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to capture PayPal order ${paypalOrderId}: ${JSON.stringify(errorData)}`);
  }
  
  return response.json();
}
