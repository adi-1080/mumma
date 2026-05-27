'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import Button from '@/components/ui/Button';
import AppLogo from '@/components/ui/AppLogo';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    const sentParam = searchParams.get('sent');
    if (tokenParam) {
      setToken(tokenParam);
    }
    if (emailParam) {
      setEmail(emailParam);
    }
    if (sentParam === 'true') {
      setInfo('Reset code sent successfully! Please check your email inbox, beta.');
    }

    // Auto-verify if both are present in URL, taking them straight to step 2
    if (tokenParam && emailParam) {
      verifyOtpCode(tokenParam, emailParam);
    }
  }, [searchParams]);

  const verifyOtpCode = async (codeToVerify?: string, emailToVerify?: string) => {
    const currentCode = (codeToVerify || token).trim();
    const currentEmail = (emailToVerify || email).trim().toLowerCase();

    if (!currentEmail) {
      setError('Please enter your email address');
      return;
    }
    if (!currentCode) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authClient.emailOtp.checkVerificationOtp({
        email: currentEmail,
        otp: currentCode,
        type: 'forget-password'
      });

      if (res.error) {
        setError(res.error.message || 'Invalid or expired code. Please request a new one.');
      } else {
        setStep(2);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authClient.emailOtp.resetPassword({
        email: email.trim().toLowerCase(),
        otp: token.trim(),
        password: newPassword
      });

      if (res.error) {
        setError(res.error.message || 'Failed to reset password. Please try again.');
        setLoading(false);
      } else {
        // Automatically sign in the user now!
        const loginRes = await authClient.signIn.email({
          email: email.trim().toLowerCase(),
          password: newPassword,
        });

        if (loginRes.error) {
          // Fallback to login redirection if sign in fails
          setSuccess('Password reset successful! Redirecting you to login...');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setSuccess('Password reset successful! Logging you in automatically, beta.');
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
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
          <h1 className="font-lilita text-3xl text-dark mb-2">Reset Password</h1>
          <p className="text-sm font-bold text-dark/60">
            {step === 1 ? 'Verify your reset code, beta!' : 'Set a new password, beta!'}
          </p>
        </div>

        {success ? (
          <div className="card-primary text-center">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="font-lilita text-xl text-dark mb-2">Success!</h2>
            <p className="text-sm text-dark/70 mb-4">{success}</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        ) : step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); verifyOtpCode(); }} className="card-primary">
            {info && (
              <div className="bg-yellow/10 border-2 border-dark rounded-[10px] p-4 mb-4 text-center animate-fade-in">
                <p className="text-sm font-bold text-dark">{info}</p>
              </div>
            )}
            {!searchParams.get('email') && (
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
            )}

            <div className="mb-4">
              <label className="block text-sm font-bold text-dark mb-2">Reset Code (6-digit OTP)</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full p-3 border-2 border-dark rounded-[10px] focus:outline-none focus:ring-2 focus:ring-pink text-center text-2xl font-bold tracking-widest"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full mb-4">
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center">
              <Link href="/forgot-password" className="text-sm font-bold text-dark/60 hover:text-dark">
                Need a new code?
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="card-primary">
            <div className="bg-yellow/10 border-2 border-dark rounded-[10px] p-4 mb-4">
              <p className="text-sm font-bold text-dark">
                ✓ Code Verified for <span className="underline">{email}</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-dark mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full p-3 pr-10 border-2 border-dark rounded-[10px] focus:outline-none focus:ring-2 focus:ring-pink"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark transition-colors focus:outline-none"
                >
                  {showNewPassword ? (
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

            <div className="mb-4">
              <label className="block text-sm font-bold text-dark mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full p-3 pr-10 border-2 border-dark rounded-[10px] focus:outline-none focus:ring-2 focus:ring-pink"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? (
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

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full mb-4">
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>

            <div className="text-center">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-sm font-bold text-dark/60 hover:text-dark"
              >
                Change Code or Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="main-container flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-[12px] mx-auto mb-4 border-2 border-dark bg-white animate-pulse" />
          <p className="font-bold text-dark">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
