// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// export const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true, // Use SSL
//   pool:true,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
//   tls: {
//     servername: "smtp.gmail.com", // Explicitly set servername for SNI
//     rejectUnauthorized: false,
//   },
//   // Increase timeouts significantly for cloud-to-cloud latency
//   connectionTimeout: 30000, // 30 seconds
//   greetingTimeout: 30000,
//   socketTimeout: 30000,
// });

// // Verify the connection
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('❌ Gmail Connection Error:', error);
//   } else {
//     console.log('📧 Gmail is ready to send reset links');
//   }
// });


// import nodemailer from 'nodemailer';

// // Configuration for Port 465 (SSL)
// const sslConfig = {
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   pool: true,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
//   tls: {
//     servername: "smtp.gmail.com",
//     rejectUnauthorized: false,
//   },
//   connectionTimeout: 15000, 
// };

// // Configuration for Port 587 (TLS)
// const tlsConfig = {
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false, // Must be false for 587
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
//   tls: {
//     ciphers: 'SSLv3',
//     rejectUnauthorized: false,
//   },
//   connectionTimeout: 15000,
// };

// export const transporter = nodemailer.createTransport(sslConfig);

// // Improved Verification with Fallback
// export const verifyConnection = async () => {
//   try {
//     console.log("Attempting Gmail Connection (Port 465)...");
//     await transporter.verify();
//     console.log('✅ Gmail ready on Port 465');
//   } catch (err) {
//     console.warn('⚠️ Port 465 timed out, switching to Port 587...');
//     const fallbackTransporter = nodemailer.createTransport(tlsConfig);
//     try {
//       await fallbackTransporter.verify();
//       // Replace the exported transporter with the working one
//       Object.assign(transporter, fallbackTransporter);
//       console.log('✅ Gmail ready on Port 587');
//     } catch (fallbackErr) {
//       console.error('❌ All Gmail ports are being blocked by the network.');
//     }
//   }
// };

// verifyConnection();

import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.MAIL_USER, // Your gmail address
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
});