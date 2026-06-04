const https = require("https");
require("dotenv").config();

function post(urlStr, headers, body) {
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

async function test() {
  try {
    const tokenBody = new URLSearchParams({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      refresh_token: process.env.OAUTH_REFRESH_TOKEN,
      grant_type: "refresh_token"
    }).toString();

    console.log("Fetching access token...");
    const tokenRes = await post("https://oauth2.googleapis.com/token", {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": tokenBody.length
    }, tokenBody);

    const tokenData = JSON.parse(tokenRes.data);
    if (!tokenData.access_token) throw new Error("No access token: " + tokenRes.data);
    
    console.log("Got access token, sending email...");
    
    const emailStr = "From: TileBazaar Security <" + process.env.MAIL_USER + ">\r\n" +
                     "To: " + process.env.MAIL_USER + "\r\n" +
                     "Subject: API Test\r\n" +
                     "Content-Type: text/html; charset=utf-8\r\n\r\n" +
                     "<h1>Test</h1>";
                     
    // Base64url encode the email string
    const raw = Buffer.from(emailStr).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const body = JSON.stringify({ raw });

    const emailRes = await post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      "Authorization": "Bearer " + tokenData.access_token,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body)
    }, body);
    
    console.log("Send result:", emailRes.status, emailRes.data);
  } catch (err) {
    console.error(err);
  }
}
test();
