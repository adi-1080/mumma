'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MomAnimation from '@/components/ui/MomAnimation';
import Cheese2D from '@/components/ui/Cheese2D';
import AppLogo from '@/components/ui/AppLogo';

const fallbackPosts = [
  {
    id: "mock-1",
    sessionId: "mock-session-1",
    user: { name: "Arjun M." },
    result: { recipeName: "Dal Tadka", score: 8, foodPhotoUrl: "" }
  },
  {
    id: "mock-2",
    sessionId: "mock-session-2",
    user: { name: "Sneha K." },
    result: { recipeName: "Aloo Paratha", score: 10, foodPhotoUrl: "" }
  },
  {
    id: "mock-3",
    sessionId: "mock-session-3",
    user: { name: "Dev P." },
    result: { recipeName: "Maggi Masala", score: 7, foodPhotoUrl: "" }
  },
  {
    id: "mock-4",
    sessionId: "mock-session-4",
    user: { name: "Sneha K." },
    result: { recipeName: "Paneer Bhurji", score: 9, foodPhotoUrl: "" }
  }
];

const policies = {
  tos: {
    title: "Terms of Service",
    content: (
      <div className="space-y-4 text-xs leading-relaxed text-dark/80 font-nunito">
        <p className="font-bold text-dark">Last Updated: May 28, 2026</p>
        <p>Welcome to Mumma's Kitchen. By registering for or using our interactive cooking web application, you agree to comply with and be bound by the following terms. Please read them carefully.</p>
        
        <h4 className="font-lilita text-sm text-dark mt-3">1. Acceptance of Terms</h4>
        <p>By creating an account, upgrading to a Pro membership, or using our real-time interactive cooking voice assistance services, you accept these terms in full. If you do not agree to any part of these terms, please do not use the application.</p>

        <h4 className="font-lilita text-sm text-dark mt-3">2. User Quotas & Subscription Services</h4>
        <p>Premium ("Pro") users pay a monthly fee to unlock increased resource limits for the voice chat assistant. Quotas are refreshed on each billing cycle. You agree to use these services responsibly and not to bypass or exploit the character allocation systems.</p>

        <h4 className="font-lilita text-sm text-dark mt-3">3. Code of Conduct</h4>
        <p>You agree to treat our virtual assistant with respect. Any misuse of our voice and chat endpoints (including injection of harmful prompts, abusive queries, or attempts to disrupt our integrations) will result in immediate termination of account access without refund.</p>

        <h4 className="font-lilita text-sm text-dark mt-3">4. Disclaimer of Culinary Liability</h4>
        <p>Mumma's Kitchen utilizes advanced automated models to simulate home cooking advice. All guidelines, temperatures, safety alerts, and substitutions should be cross-checked by the user. We are not responsible for kitchen accidents, cuts, burns, food poisoning, or poorly seasoned dishes.</p>
      </div>
    )
  },
  privacy: {
    title: "Privacy Policy",
    content: (
      <div className="space-y-4 text-xs leading-relaxed text-dark/80 font-nunito">
        <p className="font-bold text-dark">Last Updated: May 28, 2026</p>
        <p>We care deeply about your privacy! Here is a simple, transparent explanation of how we collect and protect your data.</p>

        <h4 className="font-lilita text-sm text-dark mt-3">1. Data We Collect</h4>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Identity Data:</strong> Your name, email, and authentication details via secure credentials.</li>
          <li><strong>Culinary Data:</strong> Details of sessions started, steps completed, and recipes searched.</li>
          <li><strong>Chat Data:</strong> Transcripts of text and spoken statements you communicate during a session.</li>
          <li><strong>Media Data:</strong> Images of final dishes and selfie posters you voluntarily upload.</li>
        </ul>

        <h4 className="font-lilita text-sm text-dark mt-3">2. How We Use Your Data</h4>
        <p>Your inputs are sent securely to our authorized processing partners to generate conversational replies and natural synthesized speech. We never sell your personal information or shared culinary photos.</p>

        <h4 className="font-lilita text-sm text-dark mt-3">3. Data Security & Deletion</h4>
        <p>Your passwords and credentials are cryptographically protected and secured. You can request complete deletion of your account and historical cooking logs by contacting our support team.</p>
      </div>
    )
  },
  refund: {
    title: "Refund & Cancellation Policy",
    content: (
      <div className="space-y-4 text-xs leading-relaxed text-dark/80 font-nunito">
        <p className="font-bold text-dark">Effective Date: May 28, 2026</p>
        
        <h4 className="font-lilita text-sm text-dark mt-3">1. The Customer Guarantee</h4>
        <p>We want you to love cooking with us! If you subscribe to our Pro tier and find that our interactive assistance is not helpful, we offer a <strong>14-day 100% money-back guarantee</strong>. Simply email mummaskitchen5500@gmail.com with your invoice number.</p>

        <h4 className="font-lilita text-sm text-dark mt-3">2. Cancellation of Subscriptions</h4>
        <p>You can cancel your subscription at any time directly through your Billing Dashboard. Upon cancellation, your Pro features (such as enhanced voice limits) will remain fully active until your current billing period ends.</p>

        <h4 className="font-lilita text-sm text-dark mt-3">3. Process Time</h4>
        <p>Refunds are processed immediately upon approval and typically reflect back in your original payment method within 5-7 business days.</p>
      </div>
    )
  },
  cookie: {
    title: "Cookie Policy",
    content: (
      <div className="space-y-4 text-xs leading-relaxed text-dark/80 font-nunito">
        <p className="font-bold text-dark">Effective Date: May 28, 2026</p>

        <h4 className="font-lilita text-sm text-dark mt-3">1. What Cookies Do We Use?</h4>
        <p>Mumma's Kitchen only uses essential, functional cookies to keep you safely logged in as you move between different recipe steps. These cookies are securely managed by our session infrastructure.</p>

        <h4 className="font-lilita text-sm text-dark mt-3">2. Third-Party Tracking Cookies</h4>
        <p>We do not use invasive tracking cookies, pixel trackers, or advertising target networks. Your web habits remain strictly your own.</p>

        <h4 className="font-lilita text-sm text-dark mt-3">3. Managing Cookies</h4>
        <p>You can block cookies through your browser settings, but please note that doing so will sign you out and prevent you from running active cooking sessions or viewing your recipes.</p>
      </div>
    )
  },
  ai: {
    title: "AI & Synthesized Voice Declaration",
    content: (
      <div className="space-y-4 text-xs leading-relaxed text-dark/80 font-nunito">
        <p className="font-bold text-dark">Effective Date: May 28, 2026</p>
        <p>Mumma's Kitchen is an interactive experience powered by advanced artificial intelligence (AI) and automated speech synthesis. In the interest of full transparency and compliance, please note the following:</p>

        <h4 className="font-lilita text-sm text-dark mt-3">1. AI Intelligence Core</h4>
        <p>All verbal and written advice is synthetically generated by advanced conversational language models. It is designed to emulate the character of a helpful, witty, traditional Indian mother. No real human mothers are chatting with you.</p>

        <h4 className="font-lilita text-sm text-dark mt-3">2. Audio & Speech Synthesis</h4>
        <p>Voice generation is dynamically processed using highly advanced secure natural text-to-speech translation technologies. Audio resources are served on-demand.</p>

        <h4 className="font-lilita text-sm text-dark mt-3">3. Safety Precautions</h4>
        <p>AI models can occasionally offer imperfect cooking guidelines. Always ensure cooking gas is turned off when finished, verify ingredient safety/allergens, and exercise precaution with sharp tools.</p>
      </div>
    )
  }
};

export default function LandingPage() {
  const [activePolicy, setActivePolicy] = useState<keyof typeof policies | null>(null);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);

  // Authentication Status check via Better Auth
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session;

  // Feedback states
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('suggestion');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    async function fetchCommunityPosts() {
      try {
        const response = await fetch('/api/community?page=1&limit=10');
        if (response.ok) {
          const data = await response.json();
          if (data.posts && data.posts.length > 0) {
            setCommunityPosts(data.posts);
          }
        }
      } catch (error) {
        console.error('Failed to fetch community posts for landing page:', error);
      }
    }
    fetchCommunityPosts();
  }, []);

  const activePosts = communityPosts.length > 0 ? communityPosts : fallbackPosts;
  
  // Duplicate the array to ensure a continuous, gap-less infinite scrolling marquee
  const marqueePosts = [...activePosts, ...activePosts, ...activePosts, ...activePosts];

  // Feedback Submission handler
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setFeedbackLoading(true);
    setFeedbackStatus(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: feedbackMessage,
          rating: feedbackRating,
          category: feedbackCategory,
        }),
      });

      if (res.ok) {
        setFeedbackStatus('success');
        setFeedbackMessage('');
        setFeedbackRating(5);
        setFeedbackCategory('suggestion');
      } else {
        setFeedbackStatus('error');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setFeedbackStatus('error');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="main-container fade-up container-mobile">
      {/* Hero Section */}
      <div className="bg-yellow border-[2.5px] border-dark rounded-[28px] p-6 mb-3 relative overflow-hidden shadow-custom card-mobile">
        <span className="spin-slow absolute right-24 top-4 text-xl"><span className="emoji-sparkle"></span></span>
        <div className="text-xs font-extrabold bg-dark text-yellow rounded-[20px] px-3.5 py-1.5 inline-flex items-center justify-center gap-1.5 mb-3.5 tracking-wider">
          <div className="w-4 h-4 rounded-[4px] overflow-hidden bg-white"><AppLogo className="w-full h-full object-cover" /></div> <span className="text-aai font-extrabold text-yellow">AI</span> IS HERE TO HELP YOU COOK
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-lilita text-4xl text-dark mb-2.5 leading-tight tracking-tight heading-responsive">
              Cook with<br />
              <span className="text-pink">Mumma <span className="emoji-heart"></span></span>
            </h1>
            <p className="text-sm font-bold text-dark/60 mb-5 text-responsive">
              Step-by-step. Ask anything. Never get stuck.
            </p>
            <Link href="/cook" className="btn-primary btn-mobile inline-block w-fit">
              Start Cooking →
            </Link>
          </div>
          <div className="hidden md:block mt-6 md:mt-0">
            <Cheese2D />
          </div>
          {/* Mobile Cheese - smaller version */}
          <div className="md:hidden mt-4 flex justify-center">
            <div className="w-[120px] h-[120px]">
              <Cheese2D />
            </div>
          </div>
        </div>
      </div>

      {/* Mom's Message */}
      <div className="flex gap-3 mb-3 gap-responsive">
        <div className="w-11 h-11 rounded-full border-[2.5px] border-dark flex items-center justify-center shadow-custom-small flex-shrink-0 overflow-hidden bg-white">
          <AppLogo className="w-full h-full object-cover" />
        </div>
        <div className="bg-yellow border-[2.5px] border-dark rounded-[14px] rounded-tl-[4px] p-3.5 text-sm font-bold text-dark leading-relaxed flex-1 shadow-custom">
          Hey beta! Mumma's here to help you cook <br />
          <span className="text-xs opacity-65">Tell me what you have — I'll figure out perfect dish!</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 grid-responsive">
        <Card className="bg-blue card-mobile">
          <div className="text-2xl mb-2"><span className="emoji-plate emoji-mobile"></span></div>
          <h3 className="font-lilita text-xl text-dark mb-1 text-responsive">Step-by-step</h3>
          <p className="text-xs font-bold text-dark/55">
            Every dish as simple cards. No confusion ever.
          </p>
        </Card>
        <Card className="bg-green card-mobile">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="font-lilita text-xl text-dark mb-1 text-responsive">Ask Mumma</h3>
          <p className="text-xs font-bold text-dark/55">
            Got a doubt? Ask mumma at any step!
          </p>
        </Card>
      </div>

      {/* Score & Share */}
      <Card className="bg-orange flex items-center gap-4 mb-4 card-mobile">
        <div className="text-4xl"><span className="emoji-trophy emoji-mobile"></span></div>
        <div>
          <h3 className="font-lilita text-xl text-dark mb-1">Score & Share</h3>
          <p className="text-xs font-bold text-dark/55">
            Upload your dish, get a mumma score, share with the world!
          </p>
        </div>
      </Card>

      {/* Real Data Community Preview with Auto Scroll Marquee */}
      <div className="mb-8 overflow-hidden w-full relative">
        <div className="text-xs font-extrabold text-dark/45 tracking-wider uppercase mb-3">
          what others cooked <span className="emoji-sparkle"></span>
        </div>
        
        <div className="w-full overflow-hidden flex select-none relative mask-gradient">
          <div className="animate-marquee animate-marquee-hover-pause flex gap-4 pr-4">
            {marqueePosts.map((post, index) => {
              const hasPhoto = !!post.result.foodPhotoUrl;
              const isMock = post.id.startsWith('mock-');
              const linkUrl = isMock ? '/community' : `/recipes/${post.sessionId}`;

              return (
                <Link 
                  key={`${post.id}-${index}`} 
                  href={linkUrl}
                  className="flex-shrink-0 w-44 bg-white border-[2.5px] border-dark rounded-[18px] overflow-hidden shadow-custom hover:-translate-y-0.5 active:scale-95 transition-all block cursor-pointer"
                >
                  {/* Photo or Fallback */}
                  <div className={`h-[105px] w-full border-b-2 border-dark relative flex items-center justify-center overflow-hidden ${
                    hasPhoto ? 'bg-gray-100' : 'bg-yellow'
                  }`}>
                    {hasPhoto ? (
                      <img 
                        src={post.result.foodPhotoUrl} 
                        alt={post.result.recipeName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[36px]">🍽️</span>
                    )}
                    {/* Score Badge */}
                    <div className="absolute top-2 right-2 bg-pink border-2 border-dark rounded-[10px] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-custom-small">
                      {post.result.score}/10
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="p-3 text-left">
                    <div className="font-lilita text-xs text-dark truncate mb-0.5">{post.result.recipeName}</div>
                    <div className="text-[9px] font-extrabold text-dark/45 truncate">
                      by {post.user?.name || 'Anonymous Chef'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Feedback Form Section */}
      <Card className="bg-[#EBF5FF] border-[2.5px] border-dark rounded-[24px] p-6 mb-8 card-mobile shadow-custom text-left relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-blue/15 flex items-center justify-center">
          <span className="text-3xl rotate-12">💬</span>
        </div>
        
        <h3 className="font-lilita text-2xl text-dark mb-1">Help Mumma Improve!</h3>
        <p className="text-xs font-bold text-dark/60 mb-5 max-w-md">
          Tell us about bugs, suggest features, or just tell us how much you loved cooking today! Your feedback helps us build the best assistant.
        </p>

        {isLoggedIn ? (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-dark/60 mb-1.5">Category</label>
                <select 
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="w-full bg-white border-2 border-dark rounded-[12px] px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue"
                >
                  <option value="suggestion">💡 Suggestion / Idea</option>
                  <option value="bug">🐛 Report a Bug</option>
                  <option value="compliment">💖 Compliment / Love</option>
                  <option value="other">❓ Other</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-dark/60 mb-1.5">How would you rate us?</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`w-8 h-8 rounded-full border-2 border-dark flex items-center justify-center font-lilita text-xs transition-all active:scale-90 ${
                        feedbackRating === star 
                          ? 'bg-yellow text-dark shadow-custom-small translate-y-[-2px]' 
                          : 'bg-white text-dark/40'
                      }`}
                    >
                      {star}⭐
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-dark/60 mb-1.5">Your Message</label>
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="What can we do better beta? Share your thoughts..."
                rows={3}
                required
                className="w-full bg-white border-2 border-dark rounded-[14px] p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue placeholder-dark/30 leading-relaxed"
              />
            </div>

            {feedbackStatus === 'success' && (
              <div className="p-3 bg-green/20 border-2 border-dark rounded-[12px] text-xs font-bold text-dark">
                Acha! Thank you beta! Mumma has received your valuable feedback. 💖
              </div>
            )}

            {feedbackStatus === 'error' && (
              <div className="p-3 bg-pink/20 border-2 border-dark rounded-[12px] text-xs font-bold text-dark">
                Oh no! Failed to submit. Please try again.
              </div>
            )}

            <Button
              type="submit"
              disabled={feedbackLoading}
              className="!py-2.5 !px-6 !text-xs !shadow-custom-small"
            >
              {feedbackLoading ? 'Sending...' : 'Submit Feedback →'}
            </Button>
          </form>
        ) : (
          <div className="bg-white border-2 border-dark border-dashed rounded-[16px] p-5 text-center flex flex-col items-center justify-center gap-3">
            <span className="text-2xl">🔒</span>
            <p className="text-xs font-extrabold text-dark/60">
              Only signed-in betas can share feedback. Please login first to help us grow!
            </p>
            <Link href="/login" className="btn-primary !py-2 !px-5 !text-xs !shadow-custom-small inline-block">
              Log In to Share Feedback
            </Link>
          </div>
        )}
      </Card>

      {/* SaaS Premium Footer */}
      <footer className="mt-16 border-t-[2.5px] border-dark pt-10 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
          {/* Logo & Brand Details */}
          <div>
            <div className="flex items-center gap-2 font-lilita text-dark text-xl mb-3">
              <div className="w-9 h-9 rounded-[10px] overflow-hidden flex-shrink-0 shadow-custom-small bg-white border-2 border-dark">
                <AppLogo className="w-full h-full object-cover" />
              </div>
              <span className="mt-0.5">Mumma's Kitchen</span>
            </div>
            <p className="text-xs font-bold text-dark/60 leading-relaxed max-w-xs mb-4">
              Traditional Indian recipes, guided step-by-step by your warm, funny, AI-powered Mom. No burnt food, no stress, only pure taste beta!
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-dark text-yellow border border-dark rounded-full px-2.5 py-0.5 font-extrabold uppercase tracking-wide">
                100% Secure Checkout
              </span>
            </div>
          </div>

          {/* Links Section */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <h4 className="font-lilita text-sm text-dark mb-3 uppercase tracking-wide">Explore</h4>
              <ul className="space-y-2 text-xs font-extrabold">
                <li><Link href="/cook" className="text-dark/70 hover:text-pink transition-colors">Start Cooking</Link></li>
                <li><Link href="/community" className="text-dark/70 hover:text-pink transition-colors">Community Feed</Link></li>
                <li><Link href="/pricing" className="text-dark/70 hover:text-pink transition-colors">Premium Pricing</Link></li>
                <li><Link href="/recipes" className="text-dark/70 hover:text-pink transition-colors">My Recipes</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-lilita text-sm text-dark mb-3 uppercase tracking-wide">Legal Policies</h4>
              <ul className="space-y-2 text-xs font-extrabold">
                <li><button onClick={() => setActivePolicy('tos')} className="text-dark/70 hover:text-pink transition-colors cursor-pointer text-left font-extrabold bg-transparent border-none p-0">Terms of Service</button></li>
                <li><button onClick={() => setActivePolicy('privacy')} className="text-dark/70 hover:text-pink transition-colors cursor-pointer text-left font-extrabold bg-transparent border-none p-0">Privacy Policy</button></li>
                <li><button onClick={() => setActivePolicy('refund')} className="text-dark/70 hover:text-pink transition-colors cursor-pointer text-left font-extrabold bg-transparent border-none p-0">Refund Policy</button></li>
                <li><button onClick={() => setActivePolicy('cookie')} className="text-dark/70 hover:text-pink transition-colors cursor-pointer text-left font-extrabold bg-transparent border-none p-0">Cookie Policy</button></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-lilita text-sm text-dark mb-3 uppercase tracking-wide">Compliance</h4>
              <ul className="space-y-2 text-xs font-extrabold">
                <li>
                  <button onClick={() => setActivePolicy('ai')} className="text-dark/70 hover:text-pink transition-colors cursor-pointer text-left font-extrabold bg-transparent border-none p-0 flex items-center gap-1.5">
                    <span className="text-[9px] bg-dark text-yellow px-1.5 py-0.5 rounded-full font-extrabold uppercase">AI</span>
                    AI Declaration
                  </button>
                </li>
                <li>
                  <a href="mailto:mummaskitchen5500@gmail.com" className="text-dark/70 hover:text-pink transition-colors block">
                    Customer Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-dark/10 pt-6 text-[10px] font-bold text-dark/45">
          <div className="flex items-center gap-1">
            <span>© 2026 Mumma's Kitchen. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1 text-center sm:text-right">
            <span>Guiding chefs with love, spices, and synthetic scoldings.</span>
          </div>
        </div>
      </footer>

      {/* Interactive Policy Modal */}
      {activePolicy && (
        <div className="fixed inset-0 bg-dark/60 z-[99999] flex flex-col justify-end sm:justify-center p-4 fade-up">
          <div className="bg-cream border-[3px] border-dark rounded-[24px] max-h-[85vh] flex flex-col overflow-hidden max-w-lg mx-auto w-full shadow-custom">
            <div className="p-4.5 border-b-[3px] border-dark flex justify-between items-center bg-yellow">
              <div className="flex items-center gap-2">
                <h2 className="font-lilita text-xl text-dark mt-0.5">{policies[activePolicy].title}</h2>
              </div>
              <button 
                onClick={() => setActivePolicy(null)} 
                className="w-8 h-8 flex items-center justify-center border-2 border-dark rounded-full bg-pink text-white font-bold cursor-pointer hover:bg-[#D94A84] transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 bg-cream">
              {policies[activePolicy].content}
            </div>

            <div className="p-4.5 border-t-[3px] border-dark bg-yellow/20 flex justify-end">
              <Button 
                onClick={() => setActivePolicy(null)}
                className="!py-2 !px-5 !text-xs !shadow-custom-small"
              >
                Acha Mumma, Understood!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mom Animation Section */}
      <MomAnimation enabled={true} />
    </div>
  );
}