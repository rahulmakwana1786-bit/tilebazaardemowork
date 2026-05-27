"use client";
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      setStatus('success');
      setMessage(response.data.message || 'Reset link sent to your email.');
    } catch (err: unknown) { // Change 'any' to 'unknown'
  setStatus('error');
  const axiosError = err as AxiosError<{ message: string }>;
  setMessage(axiosError.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 shadow-sm border border-gray-100">
        <header className="text-center mb-10">
          <h2 className="text-3xl font-serif text-[#4a2c2a] mb-2">Forgot Password</h2>
          <p className="text-[11px] text-[#4a2c2a] uppercase tracking-widest opacity-50">
            Enter your email to receive a reset link
          </p>
        </header>

        {status === 'success' ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-4 mb-6 text-sm rounded-sm">
              {message}
            </div>
            <Link href="/login" className="text-[#4a2c2a] font-bold text-xs uppercase tracking-widest hover:underline">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="text-[10px] text-[#4a2c2a] font-bold uppercase tracking-tight opacity-60">
                Email Address
              </label>
              <input 
                id="email"
                type="email" 
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-3 text-[#4a2c2a] border-b border-gray-200 focus:border-[#4a2c2a] outline-none text-sm transition-colors"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-[10px] font-bold uppercase">{message}</p>
            )}

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full bg-[#4a2c2a] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="text-center mt-4">
              <Link href="/login" className="text-xs text-gray-400 hover:text-[#4a2c2a] transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}