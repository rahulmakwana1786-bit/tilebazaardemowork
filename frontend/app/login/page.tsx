"use client";
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  // app/login/page.tsx
const [showPassword, setShowPassword] = useState(false);
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  const result = await dispatch(loginUser({ email, password }));
  
  if (loginUser.fulfilled.match(result)) {
    const user = result.payload.user; // Ensure your backend returns the user object here

    // 1. Log to verify role is actually coming through
    console.log("Login Success. Role:", user.role);

    // 2. Direct routing based on authority
    if (user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 shadow-sm border border-gray-100">
        <h2 className="text-3xl font-serif text-[#4a2c2a] text-center mb-2">Welcome Back</h2>
        <p className="text-center text-[11px] text-[#4a2c2a] uppercase tracking-widest opacity-50 mb-8">Sign in to your account</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] text-[#4a2c2a] font-bold uppercase tracking-tight opacity-60">Email Address</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full mt-1 p-3 text-[#4a2c2a] border-b border-gray-200 focus:border-[#4a2c2a] outline-none transition-colors text-sm"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-[#4a2c2a] font-bold uppercase tracking-tight opacity-60">Password</label>
              <Link href="/forgot-password" className="text-[10px] uppercase font-bold text-[#4a2c2a] hover:underline">Forgot?</Link>
            </div>
            <div className="relative">
            <input 
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
             required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 text-[#4a2c2a] border-b border-gray-200 focus:border-[#4a2c2a] outline-none transition-colors text-sm"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4a2c2a] transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-[11px] font-bold uppercase">{error}</p>}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#4a2c2a] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-xs text-gray-500">
          Don&apos;t have an account? <Link href="/register" className="text-[#4a2c2a] font-bold hover:underline">Register Now</Link>
        </p>
      </div>
    </div>
  );
}