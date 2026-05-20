import crypto from 'crypto';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { User } from '../models/userModel.js';
import { transporter } from '../config/mail.js';

// 1. REGISTER USER
export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      full_name,
      phone_number,
      address_line1,
      city,
      postcode
    } = req.body;

    // Basic validation
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Please provide email, password, and full name' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert into Supabase
    // Note: 'role' defaults to 'customer' via database schema
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          full_name,
          phone_number,
          address_line1,
          city,
          postcode,
          country: 'United Kingdom'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Remove password from response
    const userResponse: Partial<User> = { ...data };
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 2. LOGIN USER
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Fetch user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'tile_secret_key',
      { expiresIn: '7d' } // Longer duration for better UX
    );

    // Remove password from response
    const userResponse: Partial<User> = { ...user };
    delete userResponse.password;

    res.status(200).json({
      token,
      user: userResponse
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 3. DELETE USER (Admin Only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) return res.status(400).json({ message: error.message });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 4. FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (!user) return res.status(404).json({ message: "User not found" });

    // Create a random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to Supabase
    await supabase.from('users').update({
      reset_password_token: resetToken,
      reset_password_expires: tokenExpiry
    }).eq('id', user.id);

    // Send Email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const mailOptions = {
      from: `"TileBazaar Support" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your TileBazaar account password:</p>
      <a href="${resetUrl}" style="background: #000; color: #fff; padding: 10px 15px; text-decoration: none;">Reset Password</a>
    </div>
  `,
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: "Reset link sent to your email" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 5. RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find user with this token and ensure it hasn't expired
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_password_token', token)
      .gt('reset_password_expires', new Date().toISOString())
      .single();

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user and CLEAR the token fields
    await supabase.from('users').update({
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null
    }).eq('id', user.id);

    res.json({ message: "Password reset successful. You can now login." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 6. UPDATE USER PROFILE
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // From 'protect' middleware
    const {
      full_name,
      phone_number,
      address_line1,
      address_line2,
      city,
      postcode,
      country
    } = req.body;

    // We only update fields that are actually provided in the request
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name,
        phone_number,
        address_line1,
        address_line2,
        city,
        postcode,
        country
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Hide password before returning
    const userResponse = { ...data };
    delete userResponse.password;

    res.status(200).json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 7. GET USER PROFILE
export const getProfile = async (req: Request, res: Response) => {
  try {
    // Extract user ID from the 'protect' middleware
    const userId = (req as any).user.id;

    const { data, error } = await supabase
      .from('users')
      .select(`
        id, 
        full_name, 
        email, 
        role, 
        phone_number, 
        address_line1, 
        address_line2, 
        city, 
        postcode, 
        country,
        created_at
      `)
      .eq('id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile fetched successfully',
      user: data
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};