'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AppLogo from '@/components/ui/AppLogo';

interface Step {
  id: string;
  stepNumber: number;
  title: string;
  instruction: string;
  isCompleted: boolean;
}

interface Session {
  id: string;
  recipeName: string;
  recipeDesc: string;
  totalSteps: number;
  status: string;
  steps: Step[];
}

interface Message {
  role: 'user' | 'mom';
  content: string;
}

export default function CookingSession() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isWaitingMom, setIsWaitingMom] = useState(false);
  const [foodPic, setFoodPic] = useState(false);
  const [selfie, setSelfie] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      const data = await response.json();
      setSession(data.session);
      
      // Find current step (first incomplete step)
      const firstIncompleteIndex = data.session.steps.findIndex((step: Step) => !step.isCompleted);
      setCurrentStep(firstIncompleteIndex === -1 ? data.session.steps.length - 1 : firstIncompleteIndex);
    } catch (error) {
      console.error('Error fetching session:', error);
      setError('Could not load cooking session');
    } finally {
      setLoading(false);
    }
  };

  const markStepDone = async () => {
    if (!session) return;
    
    const step = session.steps[currentStep];
    try {
      const response = await fetch(`/api/session/${sessionId}/step/${step.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark step as done');
      }

      // Update local state
      const updatedSteps = session.steps.map(s => 
        s.id === step.id ? { ...s, isCompleted: true } : s
      );
      setSession({ ...session, steps: updatedSteps });

      // Check if all steps are completed
      const allCompleted = updatedSteps.every(s => s.isCompleted);
      if (allCompleted || currentStep >= session.steps.length - 1) {
        // Move to upload screen
        setSession({ ...session, status: 'completed' });
      } else {
        // Move to next step
        setCurrentStep(currentStep + 1);
        setMessages([]);
        setChatOpen(false);
      }
    } catch (error) {
      console.error('Error marking step as done:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !session) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setIsWaitingMom(true);

    try {
      const response = await fetch(`/api/session/${sessionId}/step/${session.steps[currentStep].id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'mom', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'mom', content: 'Sorry beta, mumma had trouble understanding. Can you try again?' }]);
    } finally {
      setIsWaitingMom(false);
    }
  };

  const getScore = async () => {
    try {
      const formData = new FormData();
      // In a real implementation, you would add actual files here
      
      const response = await fetch(`/api/session/${sessionId}/result`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get score');
      }

      const data = await response.json();
      setScore(data.score);
    } catch (error) {
      console.error('Error getting score:', error);
      // Fallback to random score for demo
      setScore(Math.floor(Math.random() * 4) + 7);
    }
  };

  const resetApp = () => {
    router.push('/cook');
  };

  if (loading) {
    return (
      <div className="main-container flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-[80px] h-[80px] rounded-full mx-auto mb-4 bounce-slow border-[3px] border-dark overflow-hidden bg-white shadow-custom-small"><AppLogo className="w-full h-full object-cover" /></div>
          <h2 className="font-lilita text-2xl text-dark mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="main-container flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <h2 className="font-lilita text-2xl text-dark mb-4">Oops!</h2>
          <p className="text-sm font-bold text-dark/60 mb-4">{error || 'Session not found'}</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Show upload screen if all steps are completed
  if (session.status === 'completed' && score === null) {
    return (
      <div className="main-container fade-up">
        <div className="text-center py-2 pb-6">
          <div className="text-5xl mb-2.5"><span className="emoji-party"></span></div>
          <h1 className="font-lilita text-4xl text-dark mb-1.5">You did it, beta!</h1>
          <p className="text-sm font-bold text-dark/60">
            You just cooked {session.recipeName}! Mumma is so proud <span className="emoji-heart"></span>
          </p>
        </div>

        <div className="flex gap-3 mb-4.5">
          <div className="w-11 h-11 rounded-full border-[2.5px] border-dark flex items-center justify-center shadow-custom-small flex-shrink-0 overflow-hidden bg-white">
            <AppLogo className="w-full h-full object-cover" />
          </div>
          <div className="bg-yellow border-[2.5px] border-dark rounded-[14px] rounded-tl-[4px] p-3.5 text-sm font-bold text-dark leading-relaxed flex-1">
            Arre wah!! Upload a photo of what you made — and show mumma your happy face too! She'll give you a score <span className="emoji-trophy"></span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className={`text-center cursor-pointer transition-all ${foodPic ? 'bg-green border-solid' : 'border-dashed hover:bg-yellow'}`}
                onClick={() => setFoodPic(!foodPic)}>
            <div className="text-3xl mb-2">{foodPic ? '✅' : '<span className="emoji-camera"></span>'}</div>
            <h3 className="font-lilita text-sm text-dark mb-1">{foodPic ? 'Photo added!' : 'Food photo'}</h3>
            <p className="text-xs font-bold text-dark/45">
              {foodPic ? 'tap to remove' : 'optional — tap to add'}
            </p>
          </Card>
          <Card className={`text-center cursor-pointer transition-all ${selfie ? 'bg-green border-solid' : 'border-dashed hover:bg-yellow'}`}
                onClick={() => setSelfie(!selfie)}>
            <div className="text-3xl mb-2">{selfie ? '✅' : '<span className="emoji-selfie"></span>'}</div>
            <h3 className="font-lilita text-sm text-dark mb-1">{selfie ? 'Selfie added!' : 'Your selfie'}</h3>
            <p className="text-xs font-bold text-dark/45">
              {selfie ? 'tap to remove' : 'show your happy face!'}
            </p>
          </Card>
        </div>

        <Button fullWidth onClick={getScore} className="mb-2.5">
          <span className="emoji-trophy"></span> Get my score! →
        </Button>
        <div className="text-center">
          <button 
            onClick={getScore}
            className="bg-none border-none text-xs font-bold text-dark/40 cursor-pointer underline"
          >
            skip and get score anyway
          </button>
        </div>
      </div>
    );
  }

  // Show score screen
  if (score !== null) {
    const messages = {
      7: "Good effort beta! Mumma's already planning your next lesson 😄",
      8: "Arey wah! Quite good! Mumma is smiling so wide right now 🥰",
      9: "Beta!! THIS is amazing! Mumma is showing your photo to all the aunties 🎉",
      10: "PERFECT SCORE!! Mumma is literally crying happy tears right now!! 😭❤️"
    };

    return (
      <div className="main-container fade-up">
        <div className="text-center mb-4 py-1">
          <div className="text-xs font-extrabold text-dark/45 tracking-wider uppercase mb-1.5">
            mumma gives you
          </div>
          <div className="font-lilita text-[112px] leading-none text-dark">{score}</div>
          <div className="font-lilita text-2xl text-dark/28 -mt-2">/10</div>
        </div>

        <div className="flex gap-3 mb-4.5">
          <div className="w-11 h-11 rounded-full border-[2.5px] border-dark flex items-center justify-center shadow-custom-small flex-shrink-0 overflow-hidden bg-white">
            <AppLogo className="w-full h-full object-cover" />
          </div>
          <div className="bg-yellow border-[2.5px] border-dark rounded-[14px] rounded-tl-[4px] p-3.5 text-sm font-bold text-dark leading-relaxed flex-1">
            {messages[score as keyof typeof messages] || messages[7]}
          </div>
        </div>

        <Card className="bg-dark text-center p-6 mb-4">
          <div className="font-lilita text-xs text-white/35 mb-3.5 tracking-wider">
            <span className="emoji-cheese"></span> MUMMA'S KITCHEN
          </div>
          {foodPic && (
            <div className="w-[70px] h-[70px] rounded-[14px] bg-yellow border-2 border-white/20 flex items-center justify-center text-3xl mx-auto mb-3.5">
              <span className="emoji-cheese"></span>
            </div>
          )}
          {selfie && (
            <div className={`w-[54px] h-[54px] rounded-full bg-blue border-2 border-white/20 flex items-center justify-center text-2xl mx-auto mb-3.5 ${foodPic ? '-mt-5 ml-30' : ''}`}>
              😊
            </div>
          )}
          <h3 className="font-lilita text-xl text-white mb-1.5">
            I cooked {session.recipeName}!
          </h3>
          <p className="text-xs font-bold text-white/45 mb-4">
            and mumma gave me...
          </p>
          <div className="bg-yellow border-[2.5px] border-white/20 rounded-[16px] px-7 py-3 inline-flex items-baseline gap-1">
            <span className="font-lilita text-[56px] text-dark">{score}</span>
            <span className="font-lilita text-2xl text-dark/35">/10</span>
          </div>
          <p className="text-xs font-bold text-white/30 mt-3.5">
            Made with Mumma's Kitchen <span className="emoji-cheese"></span> Try it out!
          </p>
        </Card>

        <Button fullWidth onClick={() => router.push('/community')} className="mb-2.5">
          Share to Community →
        </Button>
        <Button variant="secondary" fullWidth onClick={resetApp}>
          Cook something else <span className="emoji-plate"></span>
        </Button>
      </div>
    );
  }

  const currentStepData = session.steps[currentStep];
  const progress = Math.round((session.steps.filter(s => s.isCompleted).length / session.steps.length) * 100);

  return (
    <div className="main-container fade-up">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-extrabold text-dark/45 tracking-wider uppercase">now cooking</div>
          <h3 className="font-lilita text-xl text-dark">{session.recipeName}</h3>
        </div>
        <span className="bg-yellow border-2 border-dark rounded-[20px] px-3 py-1 text-xs font-extrabold text-dark">
          {currentStep + 1} / {session.totalSteps}
        </span>
      </div>

      <div className="bg-gray-100 rounded-[10px] h-2 border-[1.5px] border-dark overflow-hidden mb-3.5">
        <div 
          className="bg-pink h-full rounded-[8px] transition-all duration-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2.5 mb-3.5">
        {session.steps.map((step, index) => {
          const isCompleted = step.isCompleted;
          const isActive = index === currentStep && !isCompleted;
          
          return (
            <div
              key={step.id}
              className={`flex-shrink-0 w-14 h-[66px] border-[2.5px] border-dark rounded-[14px] flex flex-col items-center justify-center transition-all gap-0.5
                ${isCompleted ? 'bg-dark cursor-pointer' : isActive ? 'bg-yellow shadow-custom' : 'bg-cream cursor-default opacity-60'}
              `}
              onClick={isCompleted ? () => setCurrentStep(index) : undefined}
              title={step.title}
            >
              {isCompleted ? (
                <>
                  <div className="font-lilita text-lg text-yellow">✓</div>
                  <div className="text-xs font-bold text-white/35">done</div>
                </>
              ) : (
                <>
                  <div className="font-lilita text-lg text-dark">{step.stepNumber}</div>
                  <div className="text-xs font-bold text-dark/40 text-center max-w-[50px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {step.title.split(' ')[0]}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <Card className="bg-yellow mb-3">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-10 h-10 bg-dark border-2 border-dark rounded-[12px] flex items-center justify-center font-lilita text-xl text-yellow flex-shrink-0">
            {currentStepData.stepNumber}
          </div>
          <h2 className="font-lilita text-2xl text-dark">{currentStepData.title}</h2>
        </div>
        <p className="text-sm font-bold text-dark leading-relaxed">
          {currentStepData.instruction}
        </p>
      </Card>

      <div className="flex gap-2.5 mb-3">
        <Button 
          variant="secondary" 
          className="flex-1"
          onClick={() => setChatOpen(!chatOpen)}
        >
          {chatOpen ? '✕ close chat' : '💬 Ask Mumma'}
        </Button>
        <Button onClick={markStepDone}>
          {currentStep >= session.steps.length - 1 ? 'All done! <span className="emoji-party"></span>' : 'Done! Next →'}
        </Button>
      </div>

      {chatOpen && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full border-2 border-dark flex items-center justify-center flex-shrink-0 overflow-hidden bg-white">
              <AppLogo className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-lilita text-sm text-dark">Mumma</h3>
              <p className="text-xs font-bold text-dark/50">ask anything about this step!</p>
            </div>
          </div>
          <div 
            ref={chatContainerRef}
            className="flex flex-col gap-2 mb-3 max-h-[190px] overflow-y-auto pr-0.5"
          >
            {!messages.length && (
              <div className="bg-yellow border-2 border-dark rounded-[16px] rounded-tl-[4px] p-3.5 max-w-[88%] text-sm font-bold leading-relaxed self-start">
                Beta, any doubt about "{currentStepData.title}"? Ask mumma anything! ❤️
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3.5 border-2 border-dark max-w-[88%] text-sm font-bold leading-relaxed
                  ${message.role === 'mom' 
                    ? 'bg-yellow rounded-[16px] rounded-tl-[4px] self-start' 
                    : 'bg-dark text-white rounded-[16px] rounded-tr-[4px] self-end'
                  }
                `}
              >
                {message.content}
              </div>
            ))}
            {isWaitingMom && (
              <div className="bg-yellow border-2 border-dark rounded-[16px] rounded-tl-[4px] p-3.5 max-w-[88%] text-sm font-bold leading-relaxed self-start">
                Mumma is thinking<span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 border-[2.5px] border-dark rounded-[12px] p-2.5 font-nunito text-sm font-bold outline-none bg-cream"
              placeholder="Hey mom, can I use X instead of Y?"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              className="bg-pink border-[2.5px] border-dark rounded-[10px] w-10 h-10 flex items-center justify-center cursor-pointer text-lg shadow-custom-small flex-shrink-0 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-custom-small-hover transition-all"
              onClick={sendMessage}
            >
              ↑
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
