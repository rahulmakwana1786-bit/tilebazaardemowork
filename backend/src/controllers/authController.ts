import crypto from 'crypto';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { User } from '../models/userModel.js';
import { transporter } from '../config/mail.js';
import { logAdminAction, updateAdminStatus } from '../utils/adminLogger.js';
import { otpStore } from './otpController.js';

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
      return res.status(400).json({
        message: 'Please provide email, password, and full name'
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    const registrationData = {
      email,
      password: hashedPassword,
      full_name,
      phone_number,
      address_line1,
      city,
      postcode,
      country: 'United Kingdom'
    };

    otpStore.set(email, { 
      code: otpCode, 
      expires, 
      type: 'register', 
      registrationData 
    });

    // Send OTP Email
    transporter.sendMail({
      from: `"TileBazaar Security" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Verify Your TileBazaar Account',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2>Welcome to TileBazaar, ${full_name}!</h2>
          <p>Your account verification code is: <strong>${otpCode}</strong></p>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `
    }).catch(mailError => console.error("Failed to send verification email:", mailError));

    res.status(200).json({
      status: 'OTP_REQUIRED',
      email: email,
      message: 'Verification code sent to your email address'
    });

  } catch (err: any) {
    res.status(500).json({
      message: err.message || 'Registration failed'
    });
  }
};

// 2. LOGIN USER
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 1. Check if it's one of the 5 admin emails from .env
    const adminEmails = [
      process.env.ADMIN_EMAIL_1 || 'jane@tilebazaar.co.uk',
      process.env.ADMIN_EMAIL_2 || 'admin2@tilebazaar.co.uk',
      process.env.ADMIN_EMAIL_3 || 'admin3@tilebazaar.co.uk',
      process.env.ADMIN_EMAIL_4 || 'admin4@tilebazaar.co.uk',
      process.env.ADMIN_EMAIL_5 || 'admin5@tilebazaar.co.uk',
    ];
    const adminPasswords = [
      process.env.ADMIN_PASSWORD_1 || 'securepassword',
      process.env.ADMIN_PASSWORD_2 || 'securepassword2',
      process.env.ADMIN_PASSWORD_3 || 'securepassword3',
      process.env.ADMIN_PASSWORD_4 || 'securepassword4',
      process.env.ADMIN_PASSWORD_5 || 'securepassword5',
    ];
    const adminNames = [
      'Jane Smith',
      'David Thompson',
      'Admin 3',
      'Admin 4',
      'Jane Smith'
    ];

    const adminIndex = adminEmails.findIndex(e => e.toLowerCase() === email.toLowerCase());
    if (adminIndex !== -1) {
      // Check password
      if (password !== adminPasswords[adminIndex]) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate admin token
      const adminId = `admin-${adminIndex + 1}`;
      const token = jwt.sign(
        { id: adminId, role: 'admin', email: adminEmails[adminIndex], full_name: adminNames[adminIndex] },
        process.env.JWT_SECRET || 'tile_secret_key',
        { expiresIn: '7d' }
      );

      const adminUser = {
        id: adminId,
        email: adminEmails[adminIndex],
        full_name: adminNames[adminIndex],
        role: 'admin'
      };

      // Cancel any pending logout if they manually log back in immediately
      if (pendingLogouts.has(adminEmails[adminIndex])) {
        clearTimeout(pendingLogouts.get(adminEmails[adminIndex])!);
        pendingLogouts.delete(adminEmails[adminIndex]);
      }

      // LOG the admin login action and update admin status
      await logAdminAction(adminEmails[adminIndex], adminNames[adminIndex], 'LOGIN', 'Admin logged in successfully', '/admin');
      await updateAdminStatus(adminEmails[adminIndex], true);

      return res.status(200).json({
        token,
        user: adminUser
      });
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

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(user.email, { code: otpCode, expires, type: 'login' });

    // Send OTP Email
    transporter.sendMail({
      from: `"TileBazaar Security" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: 'Your TileBazaar Login Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2>Hello, ${user.full_name}!</h2>
          <p>Your one-time login code is: <strong>${otpCode}</strong></p>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `
    }).catch(mailError => console.error("Failed to send OTP email:", mailError));

    res.status(200).json({
      status: 'OTP_REQUIRED',
      email: user.email,
      message: 'OTP sent to your email address'
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Global map to track pending logouts to prevent refresh from showing as logout
export const pendingLogouts = new Map<string, NodeJS.Timeout>();

// 2.5 LOGOUT USER (Tracking)
export const logout = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (email) {
      const adminEmails = [
        process.env.ADMIN_EMAIL_1 || 'jane@tilebazaar.co.uk',
        process.env.ADMIN_EMAIL_2 || 'admin2@tilebazaar.co.uk',
        process.env.ADMIN_EMAIL_3 || 'admin3@tilebazaar.co.uk',
        process.env.ADMIN_EMAIL_4 || 'admin4@tilebazaar.co.uk',
        process.env.ADMIN_EMAIL_5 || 'admin5@tilebazaar.co.uk',
      ];
      const adminNames = [
        'Jane Smith',
        'David Thompson',
        'Admin 3',
        'Admin 4',
        'Jane Smith'
      ];
      const adminIndex = adminEmails.findIndex(e => e.toLowerCase() === email.toLowerCase());
      if (adminIndex !== -1) {
        const adminEmail = adminEmails[adminIndex];
        
        // Clear any existing timeout for this admin
        if (pendingLogouts.has(adminEmail)) {
          clearTimeout(pendingLogouts.get(adminEmail)!);
        }

        // Schedule the actual logout for 5 seconds from now
        // This gives the page refresh enough time to reconnect and cancel the logout!
        const timeout = setTimeout(async () => {
          await logAdminAction(adminEmails[adminIndex], adminNames[adminIndex], 'LOGOUT', 'Logged out of the system', '/admin');
          await updateAdminStatus(adminEmails[adminIndex], false);
          pendingLogouts.delete(adminEmail);
        }, 5000);

        pendingLogouts.set(adminEmail, timeout);
      }
    }
    res.status(200).json({ message: 'Logged out successfully' });
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
    const userFromToken = (req as any).user;

    // 1. Handle Admin Users explicitly
    if (userFromToken.role === 'admin') {
      // Cancel any pending logout from a page reload!
      if (pendingLogouts.has(userFromToken.email)) {
        clearTimeout(pendingLogouts.get(userFromToken.email)!);
        pendingLogouts.delete(userFromToken.email);
      }

      // Since they are requesting profile (e.g. on page reload), ensure they are marked Active
      await updateAdminStatus(userFromToken.email, true);

      return res.status(200).json({
        message: 'Profile fetched successfully',
        user: {
          id: userFromToken.id,
          email: userFromToken.email,
          full_name: userFromToken.full_name,
          role: 'admin'
        }
      });
    }

    // 2. Handle Customer Users
    const userId = userFromToken.id;

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