"use client";
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setStatus('loading');
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password });
      alert("Password reset successful! Redirecting to login...");
      router.push('/login');
    } catch (err: unknown) {
      setStatus('error');
      const axiosError = err as AxiosError<{ message: string }>;
      setErrorMsg(axiosError.response?.data?.message || 'Token expired');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 shadow-sm border border-gray-100">
        <h2 className="text-3xl font-serif text-[#4a2c2a] text-center mb-8">Set New Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] text-[#4a2c2a] font-bold uppercase tracking-tight opacity-60">New Password</label>
            <div className='relative'>
            <input 
            id='password' name='password'
              type={showPassword ? "text" : "password"} required minLength={6}
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 text-[#4a2c2a] border-b border-gray-200 focus:border-[#4a2c2a] outline-none text-sm"
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
          
          <div>
            <label className="text-[10px] text-[#4a2c2a] font-bold uppercase tracking-tight opacity-60">Confirm Password</label>
            <div className='relative'>
            <input 
            name='password'
              type={showPassword ? "text" : "password"} required
              value={confirmPassword}
              placeholder="••••••••"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 p-3 text-[#4a2c2a] border-b border-gray-200 focus:border-[#4a2c2a] outline-none text-sm"
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

          {(status === 'error' || errorMsg) && (
            <p className="text-red-500 text-[10px] font-bold uppercase">{errorMsg}</p>
          )}

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full bg-[#4a2c2a] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-50"
          >
            {status === 'loading' ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}