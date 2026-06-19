"use client";
import React, { useState, Suspense } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, googleLoginUser } from '@/store/slices/authSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { GoogleLogin } from '@react-oauth/google';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

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
        router.push(redirect);
      }
    } else {
      console.error("Login failed:", (result as any).payload || (result as any).error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const result = await dispatch(googleLoginUser(credentialResponse.credential));
      if (googleLoginUser.fulfilled.match(result)) {
        const user = result.payload.user;
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push(redirect);
        }
      } else {
        const errorMsg = result.payload as string;
        if (errorMsg && errorMsg.includes('Please register first')) {
          router.push('/register');
        } else {
          console.error("Google login failed:", (result as any).payload || (result as any).error);
        }
      }
    }
  };

  const handleContinueWithoutLogin = () => {
    localStorage.setItem("tb_continue_without_login", "true");
    router.push(redirect);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-6 sm:p-10 shadow-sm border border-gray-100">
        <h2 className="text-3xl font-serif text-[#4a2c2a] text-center mb-2">Welcome Back</h2>
        <p className="text-center text-[11px] text-[#4a2c2a] uppercase tracking-widest opacity-50 mb-8">
          Sign in to your account
        </p>
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

              {error && (
                <div className="bg-red-50 p-4 border-l-2 border-red-500 mb-6 flex flex-col items-center">
                  <p className="text-red-600 text-[11px] font-bold uppercase text-center">
                    {error}
                  </p>
                </div>
              )}

              <button 
                type="submit" disabled={loading}
                className="w-full bg-[#4a2c2a] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between">
              <span className="border-b w-1/5 lg:w-1/4"></span>
              <span className="text-xs text-center text-gray-500 uppercase tracking-widest">Or continue with</span>
              <span className="border-b w-1/5 lg:w-1/4"></span>
            </div>
            
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    console.log('Google Login Failed');
                  }}
                />
              </div>


              <button
                type="button"
                onClick={handleContinueWithoutLogin}
                className="w-full py-3.5 border border-[#4a2c2a] text-[#4a2c2a] hover:bg-[#4a2c2a] hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center bg-transparent active:scale-[0.98]"
              >
                Continue Without Login
              </button>
            </div>
            
            <p className="mt-8 text-center text-xs text-gray-500">
              Don&apos;t have an account? <Link href="/register" className="text-[#4a2c2a] font-bold hover:underline">Register Now</Link>
            </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-sm text-[#4a2c2a] uppercase tracking-widest animate-pulse">Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}