'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import Button from '@/components/ui/Button';
import AppLogo from '@/components/ui/AppLogo';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const res = await authClient.signIn.email({
          email,
          password
        });
        if (res.error) {
          setError(res.error.message || 'Invalid credentials');
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
          setError(res.error.message || 'Sign up failed');
        } else {
          window.location.href = '/cook';
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
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
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-[2.5px] border-dark rounded-[12px] p-2.5 font-nunito text-sm font-bold bg-white outline-none focus:border-pink transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <Button fullWidth type="submit" disabled={loading} className="mt-1">
            {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
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
          onClick={async () => {
            await authClient.signIn.social({ provider: 'google' });
          }}
          className="mb-5 flex justify-center items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="mr-1">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
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
