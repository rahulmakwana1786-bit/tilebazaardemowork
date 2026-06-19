import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import crypto from 'crypto';

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
      // User does NOT exist - automatically register them
      const { name: full_name } = payload;
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const registrationData = {
        email,
        password: randomPassword,
        full_name: full_name || 'Google User',
        country: 'United Kingdom', // Default
      };

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([registrationData])
        .select()
        .single();

      if (insertError || !newUser) {
        console.error('Error inserting user during Google login auto-registration:', insertError);
        return res.status(500).json({ message: 'Failed to create user account' });
      }
      user = newUser;
    } 
    // Generate custom JWT
    const jwtToken = jwt.sign(
      { id: user.id, role: user.role || 'customer' },
      process.env.JWT_SECRET || 'tile_secret_key',
      { expiresIn: '7d' }
    );

    const userResponse = { ...user };
    delete userResponse.password;

    res.status(200).json({
      message: 'Login successful',
      token: jwtToken,
      user: userResponse
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

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({
        message: 'Please enter a valid mobile number'
      });
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

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([registrationData])
      .select()
      .single();

    if (insertError || !newUser) {
      console.error('Error inserting user:', insertError);
      return res.status(500).json({ message: 'Failed to create user account' });
    }

    // Generate custom JWT for the new user
    const jwtToken = jwt.sign(
      { id: newUser.id, role: newUser.role || 'customer' },
      process.env.JWT_SECRET || 'tile_secret_key',
      { expiresIn: '7d' }
    );

    const userResponse = { ...newUser };
    delete userResponse.password;

    res.status(201).json({
      message: 'Registration successful',
      token: jwtToken,
      user: userResponse
    });
  } catch (err: any) {
    console.error('Google register error:', err);
    res.status(500).json({ message: 'Failed to register with Google' });
  }
};
