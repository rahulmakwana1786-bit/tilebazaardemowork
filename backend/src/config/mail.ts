import nodemailer from "nodemailer";

const transporterInstance = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const transporter = {
  sendMail: async (options: {
    from?: string;
    to?: string | string[];
    subject: string;
    html: string;
    bcc?: string | string[];
  }) => {
    try {
      const result = await transporterInstance.sendMail({
        from: options.from || process.env.MAIL_USER,
        to: options.to,
        bcc: options.bcc,
        subject: options.subject,
        html: options.html,
      });

      console.log("✅ Email sent successfully via Gmail SMTP");
      return result;
    } catch (err) {
      console.error("❌ Gmail SMTP Error:", err);
      throw err;
    }
  },
};

export const sendOTPEmail = async (
  toEmail: string,
  fullName: string,
  otpCode: string,
  type: "login" | "register"
) => {
  const subject =
    type === "login"
      ? "Your TileBazaar Login Code"
      : "Verify Your TileBazaar Account";

  const heading =
    type === "login"
      ? `Hello, ${fullName}!`
      : `Welcome to TileBazaar, ${fullName}!`;

  const html = `
    <div style="font-family:sans-serif;padding:20px;border:1px solid #ddd;">
      <h2>${heading}</h2>
      <p>Your one-time code is: <strong>${otpCode}</strong></p>
      <p>This code will expire in 5 minutes.</p>
    </div>
  `;

  return transporter.sendMail({
    to: toEmail,
    subject,
    html,
  });
};