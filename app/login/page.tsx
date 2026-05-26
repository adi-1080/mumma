'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import Button from '@/components/ui/Button';
import AppLogo from '@/components/ui/AppLogo';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        // First check if user exists to give better error messages
        const userCheckResponse = await fetch('/api/auth/user-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const userExists = await userCheckResponse.json();
        
        if (!userExists.exists) {
          setError('Email not registered. No account found with this email. Try signing up!');
          setLoading(false);
          return;
        }
        
        const res = await authClient.signIn.email({
          email,
          password
        });
        if (res.error) {
          // Handle different types of authentication errors
          const errorMessage = res.error.message?.toLowerCase() || '';
          
          if (errorMessage.includes('not verified') || errorMessage.includes('verify') || errorMessage.includes('verification')) {
            setError('Please verify your email first. Mumma is sending a verification code...');
            
            // Auto-trigger a new verification OTP code for this user!
            try {
              await authClient.emailOtp.sendVerificationOtp({
                email: email.trim().toLowerCase(),
                type: 'email-verification'
              });
            } catch (otpErr) {
              console.error("Failed to auto-send OTP on login block:", otpErr);
            }

            setTimeout(() => {
              window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
            }, 2000);
          } else if (errorMessage.includes('invalid') || errorMessage.includes('credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (errorMessage.includes('database') || errorMessage.includes('connection')) {
            setError('Database connection error. Please try again in a moment.');
          } else {
            setError(res.error.message || 'Login failed. Please try again.');
          }
        } else {
          window.location.href = '/cook';
        }
      } else {
        const res = await authClient.signUp.email({
          email,
          password,
          name: name || email.split('@')[0]
        });
        if (res.error) {
          // Handle different types of sign-up errors
          const errorMessage = res.error.message?.toLowerCase() || '';
          
          if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || errorMessage.includes('user already exists')) {
            setError('Email already registered. An account with this email already exists. Try logging in!');
          } else if (errorMessage.includes('password') || errorMessage.includes('weak')) {
            setError('Password is too weak. Please choose a stronger password.');
          } else if (errorMessage.includes('email') || errorMessage.includes('invalid')) {
            setError('Please enter a valid email address.');
          } else if (errorMessage.includes('database') || errorMessage.includes('connection')) {
            setError('Database connection error. Please try again in a moment.');
          } else {
            setError(res.error.message || 'Sign up failed. Please try again.');
          }
        } else {
          setSuccessMessage("Account created successfully! Mumma sent a 6-digit verification code to your email. Redirecting to verification page...");
          setTimeout(() => {
            window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
          }, 2500);
        }
      }
    } catch (err: any) {
      // Handle unexpected errors including database connection issues
      const errorMessage = err?.message?.toLowerCase() || '';
      
      if (errorMessage.includes('database') || errorMessage.includes('connection') || errorMessage.includes('prisma')) {
        setError('Unable to connect to database. Please check your connection and try again.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(err?.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container flex justify-center items-center min-h-[75vh] fade-up px-4">
      <div className="bg-white border-[2.5px] border-dark rounded-[24px] p-8 max-w-sm w-full shadow-custom text-center">
        <div className="w-[80px] h-[80px] rounded-full mx-auto mb-4 bounce-slow border-[3px] border-dark overflow-hidden bg-white shadow-custom-small"><AppLogo className="w-full h-full object-cover" /></div>
        <h2 className="font-lilita text-3xl text-dark mb-2">
          {isLogin ? 'Welcome Back!' : "Join Mumma's Kitchen!"}
        </h2>
        <p className="text-sm font-bold text-dark/50 mb-6">
          {isLogin ? 'Log in to view your saved recipes.' : 'Create an account to start cooking!'}
        </p>

        {error && (
          <div className="bg-red-50 border-[2px] border-red-500 text-red-600 rounded-[12px] p-2.5 mb-4 text-xs font-extrabold text-left">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green/30 border-[2px] border-green text-dark rounded-[12px] p-2.5 mb-4 text-xs font-extrabold text-left">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-6 text-left">
          {!isLogin && (
            <div>
              <label className="text-xs font-extrabold text-dark tracking-wider mb-1 block uppercase">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-[2.5px] border-dark rounded-[12px] p-2.5 font-nunito text-sm font-bold bg-white outline-none focus:border-pink transition-colors"
                placeholder="Riya S."
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="text-xs font-extrabold text-dark tracking-wider mb-1 block uppercase">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-[2.5px] border-dark rounded-[12px] p-2.5 font-nunito text-sm font-bold bg-white outline-none focus:border-pink transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-extrabold text-dark tracking-wider mb-1 block uppercase">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-[2.5px] border-dark rounded-[12px] p-2.5 pr-10 font-nunito text-sm font-bold bg-white outline-none focus:border-pink transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4.5 h-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-2.956-2.956l-2.64-2.64m-1.406-1.406a3 3 0 11-4.243-4.243m4.243 4.243L9.878 9.878" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4.5 h-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {isLogin && (
            <div className="text-right -mt-2">
              <Link href="/forgot-password" className="text-xs font-bold text-dark/60 hover:text-pink transition-colors">
                Forgot password?
              </Link>
            </div>
          )}
          <Button fullWidth type="submit" isLoading={loading} className="mt-1">
            {isLogin ? 'Log In' : 'Sign Up'}
          </Button>
        </form>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 border-b-2 border-dark/15"></div>
          <span className="text-xs font-black text-dark/30 uppercase tracking-widest leading-none">or</span>
          <div className="flex-1 border-b-2 border-dark/15"></div>
        </div>

        <Button 
          variant="secondary" 
          fullWidth 
          isLoading={googleLoading}
          onClick={async () => {
            setGoogleLoading(true);
            try {
              await authClient.signIn.social({ provider: 'google' });
            } catch (err) {
              setGoogleLoading(false);
            }
          }}
          className="mb-5 flex justify-center items-center gap-2"
        >
          {!googleLoading && (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="mr-1">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue
        </Button>

        <button 
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-xs font-extrabold text-dark/60 hover:text-dark transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
