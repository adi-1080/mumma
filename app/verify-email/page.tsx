'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import Button from '@/components/ui/Button';
import AppLogo from '@/components/ui/AppLogo';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');

  // Check if token is in URL (from email link)
  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setEmailInput(emailParam);
    }
    if (token) {
      verifyWithToken(token, emailParam || email);
    }
  }, [searchParams, email]);

  const verifyWithToken = async (token: string, emailParam?: string) => {
    setLoading(true);
    setError('');
    try {
      const emailToUse = (emailParam || email || searchParams.get('email') || '').trim().toLowerCase();
      if (!emailToUse) {
        setError('Email address is required for verification.');
        setLoading(false);
        return;
      }
      const res = await authClient.emailOtp.verifyEmail({
        email: emailToUse,
        otp: token.trim()
      });
      if (res.error) {
        setError(res.error.message || 'Verification failed. Please try again.');
      } else {
        setSuccess('Email verified successfully! Redirecting you to cook...');
        // Trigger the Welcome email now that verification has completed successfully!
        try {
          await fetch('/api/auth/send-welcome', { method: 'POST' });
        } catch (e) {
          console.error("Failed to send welcome email:", e);
        }
        setTimeout(() => router.push('/cook'), 2000);
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    await verifyWithToken(otp.trim());
  };

  const resendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setError('Please enter your email address');
      return;
    }
    setResendLoading(true);
    setError('');
    setResendSuccess('');
    try {
      const res = await authClient.emailOtp.sendVerificationOtp({
        email: emailInput.trim().toLowerCase(),
        type: 'email-verification'
      });
      if (res.error) {
        setError(res.error.message || 'Failed to resend verification email');
      } else {
        setResendSuccess('Verification email with a 6-digit code has been sent! Please check your inbox.');
        // Auto-clear notification after 6 seconds
        setTimeout(() => setResendSuccess(''), 6000);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="main-container flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-[12px] mx-auto mb-4 overflow-hidden border-2 border-dark shadow-custom-small bg-white">
            <AppLogo className="w-full h-full object-cover" />
          </div>
          <h1 className="font-lilita text-3xl text-dark mb-2">Verify Your Email</h1>
          <p className="text-sm font-bold text-dark/60">
            Mumma needs to confirm this email is really yours!
          </p>
        </div>

        {success ? (
          <div className="card-primary text-center">
            <div className="text-4xl mb-4">✓</div>
            <p className="font-bold text-dark mb-4">{success}</p>
            <Link href="/cook">
              <Button>Continue to Kitchen</Button>
            </Link>
          </div>
        ) : (
          <>
            {resendSuccess && (
              <div className="bg-green/30 border-2 border-green text-dark rounded-[14px] p-3 mb-4 text-sm font-bold text-center">
                {resendSuccess}
              </div>
            )}
            {/* Verify with OTP */}
            <form onSubmit={verifyWithOtp} className="card-primary mb-4">
              <h2 className="font-lilita text-xl text-dark mb-4">Enter Verification Code</h2>
              <p className="text-sm text-dark/70 mb-4">
                Mumma sent a 6-digit code to your email. Enter it below to verify your account!
              </p>
              
              {!searchParams.get('email') && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-dark mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailInput(e.target.value);
                    }}
                    placeholder="your@email.com"
                    className="w-full p-3 border-2 border-dark rounded-[10px] focus:outline-none focus:ring-2 focus:ring-pink"
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-bold text-dark mb-2">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full p-3 border-2 border-dark rounded-[10px] focus:outline-none focus:ring-2 focus:ring-pink text-center text-2xl font-bold tracking-widest"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>

            {/* Resend verification */}
            <form onSubmit={resendVerification} className="card-primary">
              <h3 className="font-bold text-dark mb-2">Didn&apos;t receive the email?</h3>
              <p className="text-sm text-dark/60 mb-4">
                Enter your email and Mumma will send the 6-digit verification code again!
              </p>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-3 border-2 border-dark rounded-[10px] mb-4 focus:outline-none focus:ring-2 focus:ring-pink"
                required
              />
              <Button type="submit" variant="secondary" disabled={resendLoading} className="w-full">
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </form>

            <div className="text-center mt-6">
              <Link href="/login" className="text-sm font-bold text-dark/60 hover:text-dark">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="main-container flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-[12px] mx-auto mb-4 border-2 border-dark bg-white animate-pulse" />
          <p className="font-bold text-dark">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
