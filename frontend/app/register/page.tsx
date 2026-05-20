"use client";
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    password: '' 
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 shadow-sm border border-gray-100">
        <header className="text-center mb-10">
          <h2 className="text-3xl font-serif text-[#4a2c2a] mb-2">Create Account</h2>
          <p className="text-[11px] uppercase tracking-widest opacity-50">
            Join the TileBazaar community
          </p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Field */}
          <div>
            <label htmlFor="full_name" className="text-[10px] text-[#4a2c2a] font-bold uppercase tracking-tight opacity-60">
              Full Name
            </label>
            <input 
              id="full_name"
              name="full_name"
              type="text" 
              required
              placeholder="John Doe"
              value={formData.full_name} 
              onChange={handleChange}
              className="w-full mt-1 p-3 text-[#4a2c2a] border-b border-gray-200 focus:border-[#4a2c2a] outline-none text-sm transition-colors"
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="text-[10px] text-[#4a2c2a] font-bold uppercase tracking-tight opacity-60">
              Email Address
            </label>
            <input 
              id="email"
              name="email"
              type="email" 
              required
              placeholder="john@example.com"
              autoComplete="email"
              value={formData.email} 
              onChange={handleChange}
              className="w-full mt-1 p-3 text-[#4a2c2a] border-b border-gray-200 focus:border-[#4a2c2a] outline-none text-sm transition-colors"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="text-[10px] text-[#4a2c2a] font-bold uppercase tracking-tight opacity-60">
              Password
            </label>
            <div className="relative">
              <input 
                id="password"
                name="password"
                // Type toggles between text and password
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••"
                autoComplete="new-password"
                value={formData.password} 
                onChange={handleChange}
                className="w-full mt-1 p-3 pr-10 text-[#4a2c2a] border-b border-gray-200 focus:border-[#4a2c2a] outline-none text-sm transition-colors"
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 p-3 border-l-2 border-red-500">
              <p className="text-red-600 text-[10px] font-bold uppercase leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#4a2c2a] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4a2c2a] font-bold hover:underline">
              Login
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}