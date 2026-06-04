import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { transporter, sendOTPEmail } from '../config/mail.js';
import crypto from 'crypto';
import { otpStore } from './otpController.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token payload' });
    }

    const { email } = payload;

    // Check if user exists
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      // User does NOT exist - block login
      return res.status(404).json({ message: 'No account found with this Google email. Please register first.' });
    } 
    
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(user.email, { code: otpCode, expires, type: 'login' });

    // Send OTP Email using Resend
    await sendOTPEmail(user.email, user.full_name, otpCode, 'login');

    res.status(200).json({
      status: 'OTP_REQUIRED',
      email: user.email,
      message: 'OTP sent to your email address'
    });
  } catch (err: any) {
    console.error('Google login error:', err);
    res.status(500).json({ message: 'Failed to authenticate with Google' });
  }
};


export const googleRegister = async (req: Request, res: Response) => {
  try {
    const { token, phone_number } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }
    
    if (!phone_number) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token payload' });
    }

    const { email, name: full_name } = payload;

    // Check if user exists
    let { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      // User DOES exist - block registration
      return res.status(400).json({ message: 'An account with this email already exists. Please login instead.' });
    } 

    // Create a new user with a random secure password
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const registrationData = {
      email,
      password: randomPassword,
      full_name: full_name || 'Google User',
      phone_number: phone_number,
      country: 'United Kingdom', // Default
    };

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email, { 
      code: otpCode, 
      expires, 
      type: 'register', 
      registrationData 
    });

    // Send OTP Email using Resend
    await sendOTPEmail(email, full_name || 'Google User', otpCode, 'register');

    res.status(200).json({
      status: 'OTP_REQUIRED',
      email: email,
      message: 'Verification code sent to your email address'
    });
  } catch (err: any) {
    console.error('Google register error:', err);
    res.status(500).json({ message: 'Failed to register with Google' });
  }
};
