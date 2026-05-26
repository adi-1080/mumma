'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import AppLogo from '@/components/ui/AppLogo';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authClient.emailOtp.requestPasswordReset({
        email: email.trim().toLowerCase()
      });

      if (res.error) {
        setError(res.error.message || 'Failed to send reset code. Please try again.');
      } else {
        router.push(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}&sent=true`);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-[12px] mx-auto mb-4 overflow-hidden border-2 border-dark shadow-custom-small bg-white">
            <AppLogo className="w-full h-full object-cover" />
          </div>
          <h1 className="font-lilita text-3xl text-dark mb-2">Forgot Password?</h1>
          <p className="text-sm font-bold text-dark/60">
            No worries beta, Mumma will help you reset it!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-primary">
          <p className="text-sm text-dark/70 mb-4">
            Enter your email address and Mumma will send you a 6-digit code to reset your password.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-bold text-dark mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full p-3 border-2 border-dark rounded-[10px] focus:outline-none focus:ring-2 focus:ring-pink"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full mb-4">
            {loading ? 'Sending...' : 'Send Reset Code'}
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-sm font-bold text-dark/60 hover:text-dark">
              Remember your password? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
