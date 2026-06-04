import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * A general purpose sendMail utility to maintain backward compatibility
 * with older code that used nodemailer's transporter.sendMail.
 */
export const transporter = {
  sendMail: async (options: { from?: string, to?: string | string[], subject: string, html: string, bcc?: string | string[] }) => {
    try {
      // If a custom domain isn't verified in Resend, you must use onboarding@resend.dev
      const from = process.env.RESEND_FROM_EMAIL || 'TileBazaar <onboarding@resend.dev>';
      
      const payload: any = {
        from,
        subject: options.subject,
        html: options.html,
      };

      if (options.to) {
        payload.to = Array.isArray(options.to) ? options.to : [options.to];
      } else {
        // Resend requires at least a 'to' or 'bcc'. If only bcc is provided, we might need a dummy 'to', but we'll try passing just bcc.
        // Actually, Resend documentation says 'to' is required. Let's provide a default if missing.
        payload.to = ['onboarding@resend.dev'];
      }

      if (options.bcc) {
        payload.bcc = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
      }
      
      const response = await resend.emails.send(payload);

      if (response.error) {
        console.error("Resend API Error:", response.error);
        throw new Error(`Resend Error: ${response.error.message}`);
      }

      console.log("✅ Email sent successfully via Resend!");
      return response.data;
    } catch (err: any) {
      console.error("❌ Transporter Error:", err);
      throw err;
    }
  }
};

/**
 * A reusable utility specifically for sending OTP emails.
 */
export const sendOTPEmail = async (toEmail: string, fullName: string, otpCode: string, type: 'login' | 'register') => {
  const subject = type === 'login' ? 'Your TileBazaar Login Code' : 'Verify Your TileBazaar Account';
  const heading = type === 'login' ? `Hello, ${fullName}!` : `Welcome to TileBazaar, ${fullName}!`;
  
  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h2>${heading}</h2>
      <p>Your one-time code is: <strong>${otpCode}</strong></p>
      <p>This code will expire in 5 minutes.</p>
    </div>
  `;

  return transporter.sendMail({
    to: toEmail,
    subject,
    html
  });
};