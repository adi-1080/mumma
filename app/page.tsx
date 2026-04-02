import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MomAnimation from '@/components/ui/MomAnimation';
import Cheese2D from '@/components/ui/Cheese2D';
import AppLogo from '@/components/ui/AppLogo';

const samplePosts = [
  { name: "Dal Tadka", emoji: "🥘", score: 8, user: "Arjun M.", bg: "bg-blue" },
  { name: "Aloo Paratha", emoji: "🫓", score: 10, user: "Sneha K.", bg: "bg-green" },
  { name: "Maggi Masala", emoji: "🍜", score: 7, user: "Dev P.", bg: "bg-orange" },
];

export default function LandingPage() {
  return (
    <div className="main-container fade-up container-mobile">
      {/* Hero Section */}
      <div className="bg-yellow border-[2.5px] border-dark rounded-[28px] p-6 mb-3 relative overflow-hidden shadow-custom card-mobile">
        <span className="spin-slow absolute right-24 top-4 text-xl"><span className="emoji-sparkle"></span></span>
        <div className="text-xs font-extrabold bg-dark text-yellow rounded-[20px] px-3.5 py-1.5 inline-flex items-center justify-center gap-1.5 mb-3.5 tracking-wider">
          <div className="w-4 h-4 rounded-[4px] overflow-hidden bg-white"><AppLogo className="w-full h-full object-cover" /></div> <span className="text-aai">AAI</span> IS HERE TO HELP YOU COOK
        </div>
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
        <div className="absolute -right-6 -bottom-8 rotate-12 z-0 opacity-90 scale-[0.7] transform-gpu">
          <Cheese2D />
        </div>
      </div>

      {/* Mom's Message */}
      <div className="flex gap-3 mb-3 gap-responsive">
        <div className="w-11 h-11 rounded-full border-[2.5px] border-dark flex items-center justify-center shadow-custom-small flex-shrink-0 overflow-hidden bg-white">
          <AppLogo className="w-full h-full object-cover" />
        </div>
        <div className="bg-yellow border-[2.5px] border-dark rounded-[14px] rounded-tl-[4px] p-3.5 text-sm font-bold text-dark leading-relaxed flex-1 shadow-custom">
          Hey beta! Mumma's here to help you cook <span className="emoji-cheese emoji-mobile"></span><br />
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

      {/* Community Preview */}
      <div className="mb-4">
        <div className="text-xs font-extrabold text-dark/45 tracking-wider uppercase mb-2.5">
          what others cooked <span className="emoji-sparkle"></span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {samplePosts.map((post, index) => (
            <div key={index} className="flex-shrink-0 w-31 bg-white border-[2.5px] border-dark rounded-[18px] overflow-hidden shadow-custom">
              <div className={`${post.bg} h-[62px] flex items-center justify-center text-[30px] border-b-2 border-dark`}
                dangerouslySetInnerHTML={{ __html: post.emoji }}
              />
              <div className="p-2.5">
                <div className="font-lilita text-xs text-dark mb-1.5">{post.name}</div>
                <span className="bg-yellow border-2 border-dark rounded-[20px] px-3 py-1 text-xs font-extrabold text-dark inline-block">
                  {post.score}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mom Animation Section */}
      <MomAnimation enabled={true} />
    </div>
  );
}