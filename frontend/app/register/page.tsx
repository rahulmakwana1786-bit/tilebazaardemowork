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
    password: '',
    country_code: '+44',
    phone_number: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const { loading, error } = useAppSelector(
    (state) => state.auth
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    const result = await dispatch(
      registerUser({
        ...formData,
        phone_number: `${formData.country_code}${formData.phone_number}`
      })
    );

    // SUCCESS
    if (registerUser.fulfilled.match(result)) {
      const data = result.payload;
      // Save JWT token
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }

      // Redirect user
      if (data?.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }

    } else {
      console.error('Registration failed:', result.payload || result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="max-w-md w-full bg-white p-10 shadow-sm border border-gray-100">

        <header className="text-center mb-10">
          <h2 className="text-3xl font-serif text-[#4a2c2a] mb-2">
            Create Account
          </h2>

          <p className="text-[11px] uppercase tracking-widest opacity-50">
            Join the TileBazaar community
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Full Name */}
          <div>
            <label
              htmlFor="full_name"
              className="text-[10px] text-[#4a2c2a] font-bold uppercase tracking-tight opacity-60"
            >
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

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-[10px] text-[#4a2c2a] font-bold uppercase tracking-tight opacity-60"
            >
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

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phone_number"
              className="text-[10px] text-[#4a2c2a] font-bold uppercase tracking-tight opacity-60"
            >
              Mobile Number
            </label>
            <div className="flex gap-2 mt-1">
              <select
                name="country_code"
                value={formData.country_code}
                onChange={handleChange as any}
                className="w-1/3 p-3 text-[#4a2c2a] border-b border-gray-200 focus:border-[#4a2c2a] outline-none text-sm transition-colors bg-transparent"
              >
                <option value="+44">🇬🇧 +44</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+91">🇮🇳 +91</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+81">🇯🇵 +81</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+33">🇫🇷 +33</option>
              </select>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                required
                placeholder="7700 900077"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-2/3 p-3 text-[#4a2c2a] border-b border-gray-200 focus:border-[#4a2c2a] outline-none text-sm transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="text-[10px] text-[#4a2c2a] font-bold uppercase tracking-tight opacity-60"
            >
              Password
            </label>

            <div className="relative">

              <input
                id="password"
                name="password"
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
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4a2c2a] transition-colors p-1"
              >
                {showPassword
                  ? <IoEyeOffOutline size={18} />
                  : <IoEyeOutline size={18} />
                }
              </button>

            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 p-3 border-l-2 border-red-500">
              <p className="text-red-600 text-[10px] font-bold uppercase leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a2c2a] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Processing...'
              : 'Register'
            }
          </button>

        </form>

        <footer className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}

            <Link
              href="/login"
              className="text-[#4a2c2a] font-bold hover:underline"
            >
              Login
            </Link>

          </p>
        </footer>

      </div>
    </div>
  );
}