'use client';

import { useState, useEffect, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AppLogo from '@/components/ui/AppLogo';
import { authClient } from '@/lib/auth-client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UserPlan {
  plan: string;
  ttsCharacterLimit: number | null;
  ttsCharactersUsed: number | null;
}

const FREE_FEATURES = [
  { emoji: '🎙️', text: '10,000 Voice Characters' },
  { emoji: '📖', text: 'Basic Recipes' },
  { emoji: '👨‍👩‍👧', text: 'Community Access' },
  { emoji: '💬', text: 'Text Chat with Mumma' },
];

const PRO_FEATURES = [
  { emoji: '🎙️', text: '50,000 Voice Characters/mo' },
  { emoji: '⚡', text: 'Priority AI Mom Chat' },
  { emoji: '📖', text: 'Unlimited Recipes' },
  { emoji: '👨‍👩‍👧', text: 'Community Access' },
  { emoji: '💖', text: 'Support Mumma\'s Kitchen' },
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PricingPage() {
  const { data: session } = authClient.useSession();
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  // Fetch current plan
  useEffect(() => {
    if (!session?.user?.id) {
      setLoadingPlan(false);
      return;
    }

    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        // The profile may not return plan, so we also check from a dedicated endpoint
        // For now we'll fetch the plan from the user data
        setUserPlan({
          plan: data.user?.plan || 'FREE',
          ttsCharacterLimit: data.user?.ttsCharacterLimit ?? 10000,
          ttsCharactersUsed: data.user?.ttsCharactersUsed ?? 0,
        });
      })
      .catch(() => {
        setUserPlan({ plan: 'FREE', ttsCharacterLimit: 10000, ttsCharactersUsed: 0 });
      })
      .finally(() => setLoadingPlan(false));
  }, [session]);

  const isPro = userPlan?.plan === 'PRO';

  const handleUpgrade = useCallback(async () => {
    if (!session) {
      window.location.href = '/login';
      return;
    }

    setIsUpgrading(true);
    setError(null);

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load payment gateway. Please refresh and try again.');
      }

      // 2. Create order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create order');
      }

      const orderData = await orderRes.json();

      // 3. Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Mumma's Kitchen",
        description: 'Pro Plan — 50,000 Voice Characters/mo',
        order_id: orderData.orderId,
        prefill: {
          name: session.user?.name || '',
          email: session.user?.email || '',
        },
        theme: {
          color: '#FF4D80',
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Verify payment
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const data = await verifyRes.json().catch(() => ({}));
              throw new Error(data.error || 'Payment verification failed');
            }

            setSuccess(true);
            setUserPlan({
              plan: 'PRO',
              ttsCharacterLimit: 50000,
              ttsCharactersUsed: userPlan?.ttsCharactersUsed ?? 0,
            });

            // Refresh page after 2s to update session
            setTimeout(() => window.location.reload(), 2000);
          } catch (err: any) {
            setError(err.message || 'Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setIsUpgrading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsUpgrading(false);
    }
  }, [session, userPlan]);

  return (
    <div className="main-container fade-up container-mobile pb-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-xs font-extrabold bg-dark text-yellow rounded-[20px] px-3.5 py-1.5 inline-flex items-center justify-center gap-1.5 mb-3.5 tracking-wider">
          <div className="w-4 h-4 rounded-[4px] overflow-hidden bg-white">
            <AppLogo className="w-full h-full object-cover" />
          </div>
          PRICING
        </div>
        <h1 className="font-lilita text-4xl text-dark mb-2 heading-responsive">
          Cook with <span className="text-pink">Mumma</span>
        </h1>
        <p className="text-sm font-bold text-dark/60 max-w-md mx-auto">
          Start free, upgrade when you want Mumma to talk to you with her voice 🎙️
        </p>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="bg-green border-[2.5px] border-dark rounded-[18px] p-4 mb-5 text-center shadow-custom fade-up">
          <div className="text-3xl mb-2">🎉</div>
          <h3 className="font-lilita text-xl text-dark mb-1">Welcome to Pro!</h3>
          <p className="text-sm font-bold text-dark/60">
            You now have 50,000 voice characters. Mumma is so happy! 💖
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-pink/10 border-2 border-pink rounded-[14px] p-3 mb-5 text-center">
          <p className="text-sm font-bold text-dark">{error}</p>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Free Plan */}
        <Card className={`bg-green relative ${isPro ? 'opacity-70' : ''}`}>
          {!isPro && !loadingPlan && session && (
            <span className="absolute -top-3 left-4 bg-dark text-yellow text-xs font-extrabold px-3 py-1 rounded-full border-2 border-dark">
              Current Plan
            </span>
          )}
          <div className="pt-2">
            <h2 className="font-lilita text-2xl text-dark mb-1">Free</h2>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-lilita text-4xl text-dark">₹0</span>
              <span className="text-sm font-bold text-dark/50">/forever</span>
            </div>

            <div className="space-y-2.5 mb-5">
              {FREE_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-base">{f.emoji}</span>
                  <span className="text-sm font-bold text-dark">{f.text}</span>
                </div>
              ))}
            </div>

            <button
              disabled
              className="w-full bg-dark/10 text-dark/40 border-2 border-dark/20 rounded-[14px] py-3 font-lilita text-base cursor-default"
            >
              {isPro ? 'Free Tier' : 'Current Plan'}
            </button>
          </div>
        </Card>

        {/* Pro Plan */}
        <Card className={`bg-yellow relative ${isPro ? 'ring-4 ring-pink ring-offset-2' : ''}`}>
          {isPro && !loadingPlan && (
            <span className="absolute -top-3 left-4 bg-pink text-white text-xs font-extrabold px-3 py-1 rounded-full border-2 border-dark">
              ✨ Your Plan
            </span>
          )}
          {!isPro && (
            <span className="absolute -top-3 right-4 bg-pink text-white text-xs font-extrabold px-3 py-1 rounded-full border-2 border-dark">
              Popular ✨
            </span>
          )}
          <div className="pt-2">
            <h2 className="font-lilita text-2xl text-dark mb-1">Pro</h2>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-lilita text-4xl text-dark">₹199</span>
              <span className="text-sm font-bold text-dark/50">/month</span>
            </div>

            <div className="space-y-2.5 mb-5">
              {PRO_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-base">{f.emoji}</span>
                  <span className="text-sm font-bold text-dark">{f.text}</span>
                </div>
              ))}
            </div>

            {isPro ? (
              <button
                disabled
                className="w-full bg-dark text-yellow border-2 border-dark rounded-[14px] py-3 font-lilita text-base cursor-default"
              >
                ✅ Active
              </button>
            ) : (
              <Button
                fullWidth
                onClick={handleUpgrade}
                isLoading={isUpgrading}
                loadingText="Processing..."
                className="!rounded-[14px] !py-3 !text-base"
              >
                {session ? '✨ Upgrade to Pro' : '🔐 Sign in to Upgrade'}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Usage Stats (if logged in) */}
      {session && userPlan && !loadingPlan && (
        <Card className="bg-blue">
          <h3 className="font-lilita text-base text-dark mb-3">Your Voice Usage</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-dark/60">Characters used</span>
            <span className="text-xs font-extrabold text-dark">
              {(userPlan.ttsCharactersUsed ?? 0).toLocaleString()} / {(userPlan.ttsCharacterLimit ?? 10000).toLocaleString()}
            </span>
          </div>
          <div className="bg-dark/10 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-pink transition-all"
              style={{
                width: `${Math.min(
                  100,
                  ((userPlan.ttsCharactersUsed ?? 0) / (userPlan.ttsCharacterLimit ?? 10000)) * 100
                )}%`,
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
