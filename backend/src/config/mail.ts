import https from 'https';

function post(urlStr: string, headers: any, body: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers
    };
    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/**
 * Custom Gmail API Transporter
 * Bypasses SMTP completely to avoid Railway/Cloud SMTP port blocking (465/587/25).
 * Uses the Gmail REST API directly over HTTPS (Port 443).
 */
export const transporter = {
  sendMail: async (options: { from?: string, to: string, subject: string, html: string }) => {
    try {
      // 1. Get Access Token
      const tokenBody = new URLSearchParams({
        client_id: process.env.OAUTH_CLIENT_ID || '',
        client_secret: process.env.OAUTH_CLIENT_SECRET || '',
        refresh_token: process.env.OAUTH_REFRESH_TOKEN || '',
        grant_type: "refresh_token"
      }).toString();

      const tokenRes = await post("https://oauth2.googleapis.com/token", {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": tokenBody.length
      }, tokenBody);

      const tokenData = JSON.parse(tokenRes.data);
      if (!tokenData.access_token) {
         console.error("Token error:", tokenRes.data);
         throw new Error("Failed to authenticate with Gmail API.");
      }
      
      // 2. Construct RFC822 Email
      const from = options.from || process.env.MAIL_USER;
      const to = options.to;
      const subject = options.subject;
      
      const emailStr = 
        `From: ${from}\r\n` +
        `To: ${to}\r\n` +
        `Subject: ${subject}\r\n` +
        `Content-Type: text/html; charset=utf-8\r\n\r\n` +
        options.html;
                       
      // 3. Base64url encode
      const raw = Buffer.from(emailStr).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const body = JSON.stringify({ raw });

      // 4. Send via REST API
      const emailRes = await post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        "Authorization": "Bearer " + tokenData.access_token,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }, body);
      
      if (emailRes.status !== 200) {
        throw new Error("Gmail API Error: " + emailRes.data);
      }
      
      console.log("✅ Email sent successfully via REST API!");
      return JSON.parse(emailRes.data);
    } catch (err: any) {
      console.error("❌ Transporter Error:", err);
      throw err; // Re-throw so the frontend receives a 500 error instead of failing silently
    }
  }
};