"use client";
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const result = await dispatch(loginUser({ email, password }));
    
    if (loginUser.fulfilled.match(result)) {
      const user = result.payload.user;
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      console.error("Admin Login failed:", result.payload || result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4a2c2a] blur-[150px] rounded-full opacity-30"></div>
      
      <div className="max-w-md w-full bg-zinc-800/80 backdrop-blur-md p-10 shadow-2xl border border-zinc-700/50 rounded-lg relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#4a2c2a] rounded-full flex items-center justify-center shadow-lg border-2 border-zinc-700">
            <Shield className="text-white w-8 h-8" />
          </div>
        </div>
        <h2 className="text-3xl font-serif text-white text-center mb-2">Welcome Admin</h2>
        <p className="text-center text-[11px] text-zinc-400 uppercase tracking-widest mb-8">
          Secure Systems Access
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] text-zinc-300 font-bold uppercase tracking-tight opacity-80">Admin Email</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tilebazaar.co.uk"
              className="w-full mt-1 p-3 bg-zinc-900/50 text-white border border-zinc-700 rounded focus:border-[#4a2c2a] focus:ring-1 focus:ring-[#4a2c2a] outline-none transition-all text-sm"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] text-zinc-300 font-bold uppercase tracking-tight opacity-80">Admin Password</label>
            </div>
            <div className="relative">
              <input 
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-zinc-900/50 text-white border border-zinc-700 rounded focus:border-[#4a2c2a] focus:ring-1 focus:ring-[#4a2c2a] outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 p-4 border border-red-500/50 rounded mb-6 flex flex-col items-center">
              <p className="text-red-400 text-[11px] font-bold uppercase text-center">
                {error}
              </p>
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#4a2c2a] text-white py-4 rounded text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#5a3a38] transition-colors shadow-lg disabled:opacity-50 mt-4"
          >
            {loading ? 'Authenticating...' : 'Access Systems'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-700/50 text-center">
          <Link href="/" className="text-[10px] text-zinc-400 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
