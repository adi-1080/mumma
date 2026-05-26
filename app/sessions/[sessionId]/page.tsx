'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AppLogo from '@/components/ui/AppLogo';
import { PosterGenerator } from '@/components/ui/PosterGenerator';
import Timer from '@/components/cooking/Timer';
import VoiceCall from '@/components/cooking/VoiceCall';

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
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceCallOpen, setVoiceCallOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isWaitingMom, setIsWaitingMom] = useState(false);
  const [showAllStepsModal, setShowAllStepsModal] = useState(false);
  const [foodPic, setFoodPic] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [isGettingScore, setIsGettingScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foodPhotoDataUrl, setFoodPhotoDataUrl] = useState<string | null>(null);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const foodInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

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
      const response = await fetch(`/api/sessions/${sessionId}`);
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
    setIsMarkingDone(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/step/${step.id}`, {
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
    } finally {
      setIsMarkingDone(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !session) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setIsWaitingMom(true);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/step/${session.steps[currentStep].id}/chat`, {
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
      setMessages(prev => [...prev, { role: 'mom', content: data.momMessage.content }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'mom', content: 'Sorry beta, mumma had trouble understanding. Can you try again?' }]);
    } finally {
      setIsWaitingMom(false);
    }
  };

  const getScore = async () => {
    setIsGettingScore(true);
    try {
      const formData = new FormData();
      if (foodPic) formData.append('foodPhoto', foodPic);
      if (selfie) formData.append('selfie', selfie);

      const response = await fetch(`/api/sessions/${sessionId}/result`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get score');
      }

      const data = await response.json();
      setScore(data.result?.score || 7);
      if (data.result?.id) {
        setResultId(data.result.id);
      }
    } catch (error) {
      console.error('Error getting score:', error);
      // Fallback to random score for demo
      setScore(Math.floor(Math.random() * 4) + 7);
    } finally {
      setIsGettingScore(false);
    }
  };

  const handlePublish = async () => {
    if (!resultId) {
      router.push('/community');
      return;
    }
    setIsPublishing(true);
    try {
      await fetch(`/api/result/${resultId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: `I cooked ${session?.recipeName || 'something delicious'} with Mumma's Kitchen!` })
      });
      router.push('/community');
    } catch (e) {
      console.error(e);
      setIsPublishing(false);
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Convert food photo to data URL when it's selected
  useEffect(() => {
    if (foodPic) {
      fileToDataUrl(foodPic).then(setFoodPhotoDataUrl).catch(console.error);
    } else {
      setFoodPhotoDataUrl(null);
    }
  }, [foodPic]);

  // Convert selfie to data URL when it's selected
  useEffect(() => {
    if (selfie) {
      fileToDataUrl(selfie).then(setSelfieDataUrl).catch(console.error);
    } else {
      setSelfieDataUrl(null);
    }
  }, [selfie]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    
    fetchUserData();
  }, []);

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
            Arre wah!! Upload a photo of what you made - and show mumma your happy face too! She'll give you a score <span className="emoji-trophy"></span>
          </div>
        </div>

        <input type="file" accept="image/*" className="hidden" ref={foodInputRef} onChange={(e) => setFoodPic(e.target.files?.[0] || null)} />
        <input type="file" accept="image/*" className="hidden" ref={selfieInputRef} onChange={(e) => setSelfie(e.target.files?.[0] || null)} />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className={`text-center cursor-pointer transition-all ${foodPic ? 'bg-green border-solid' : 'border-dashed hover:bg-yellow'}`}
            onClick={() => foodPic ? setFoodPic(null) : foodInputRef.current?.click()}>
            {foodPic ? (
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg border-2 border-dark overflow-hidden bg-white">
                <img src={URL.createObjectURL(foodPic)} alt="Food" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="text-3xl mb-2">[Camera]</div>
            )}
            <h3 className="font-lilita text-sm text-dark mb-1">{foodPic ? 'Photo added!' : 'Food photo'}</h3>
            <p className="text-xs font-bold text-dark/45">
              {foodPic ? 'tap to remove' : 'optional - tap to add'}
            </p>
          </Card>
          <Card className={`text-center cursor-pointer transition-all ${selfie ? 'bg-green border-solid' : 'border-dashed hover:bg-yellow'}`}
            onClick={() => selfie ? setSelfie(null) : selfieInputRef.current?.click()}>
            {selfie ? (
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg border-2 border-dark overflow-hidden bg-white">
                <img src={URL.createObjectURL(selfie)} alt="Selfie" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="text-3xl mb-2">[Selfie]</div>
            )}
            <h3 className="font-lilita text-sm text-dark mb-1">{selfie ? 'Selfie added!' : 'Your selfie'}</h3>
            <p className="text-xs font-bold text-dark/45">
              {selfie ? 'tap to remove' : 'show your happy face!'}
            </p>
          </Card>
        </div>

        <Button fullWidth onClick={getScore} isLoading={isGettingScore} className="mb-2.5">
          <span className="emoji-trophy"></span> Get my score! {'>'}
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
      7: "Good effort! Mumma's already planning your next lesson 😄",
      8: "Arey wah! Quite good! Mumma is smiling so wide right now 🥰",
      9: "THIS is amazing! Showing your photo to all the aunties 🎉",
      10: "PERFECT SCORE!! Humara best chef! Mumma is literally crying happy tears right now!! 😭❤️"
    };

    return (
      <div className="main-container fade-up pb-8">
        {/* The Poster Card */}
        <div className="bg-[#FAF4EB] border-[2.5px] border-dashed border-[#F0A8B6] rounded-[28px] p-5 mb-5 relative shadow-sm max-w-full overflow-hidden">
          
          {/* Header Pill */}
          <div className="bg-[#241000] rounded-full py-2.5 px-5 flex items-center gap-3 mb-6 mx-auto w-fit max-w-full">
            <div className="w-[34px] h-[34px] rounded-full flex-shrink-0 bg-[#ED5B97] overflow-hidden flex items-center justify-center border-2 border-transparent">
              <AppLogo className="w-full h-full object-cover" />
            </div>
            <div className="text-left pr-4">
              <div className="text-white font-lilita tracking-wide text-[17px] leading-tight">Mumma's Kitchen</div>
              <div className="text-[#F5B827] text-[10px] font-bold uppercase tracking-wider">cooked with love ✨</div>
            </div>
          </div>

          {/* Title Area */}
          <div className="text-center mb-6">
            <h2 className="font-lilita text-[32px] text-dark leading-none mb-1">
              I Cooked It! 🍲
            </h2>
            <div className="text-[#ED5B97] font-bold text-sm tracking-wide">
              sharing my cooking adventure
            </div>
          </div>

          {/* Main Photo Area */}
          <div className="relative mb-14 px-1 mx-auto max-w-[320px]">
            <div 
              className="bg-white rounded-[24px] aspect-[4/3] flex flex-col items-center justify-center border-2 border-transparent shadow-sm relative overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(#F3D5D7 20%, transparent 20%)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0'
              }}
            >
              <div className="absolute inset-0 bg-white/40"></div>
              
              {foodPic ? (
                <div className="absolute inset-0 z-10 w-full h-full p-2.5">
                  <img src={foodPic instanceof File ? URL.createObjectURL(foodPic) : ''} alt="Food" className="w-full h-full object-cover rounded-[16px]" />
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <span className="text-4xl mb-2">🍲</span>
                  <span className="text-xs font-bold text-dark/40 bg-white/80 px-3 py-1 rounded-full">food photo</span>
                </div>
              )}
            </div>

            {/* Selfie Overlay (Bottom Left) */}
            <div className={`absolute -bottom-8 -left-4 z-20 transition-all ${selfie ? 'scale-100' : 'scale-90 opacity-80'}`}>
              <div className="w-[96px] h-[96px] rounded-full border-[5px] border-[#ED5B97] bg-white shadow-custom-small overflow-hidden relative flex items-center justify-center">
                {selfie ? (
                  <img src={selfie instanceof File ? URL.createObjectURL(selfie) : ''} alt="Selfie" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-3xl">😊</div>
                )}
              </div>
            </div>

            {/* Score Overlay (Bottom Right) */}
            <div className="absolute -bottom-8 -right-4 z-20">
              <div className="bg-[#F5B827] border-[2px] border-[#D99A1C] rounded-[16px] shadow-custom-small w-[100px] h-[75px] flex flex-col items-center justify-center rotate-3">
                <div className="flex items-baseline gap-0.5">
                  <span className="font-lilita text-[42px] text-dark leading-none">{score}</span>
                  <span className="font-lilita text-[18px] text-dark/70">/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Bubble */}
          <div className="relative bg-[#F5B827] rounded-[16px] p-4 mt-14 mb-6 mx-1 shadow-sm">
            {/* Bubble Tail pointing up to the main area */}
            <div className="absolute -top-[14px] left-[25%] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[16px] border-b-[#F5B827]"></div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex-shrink-0 bg-[#ED5B97] overflow-hidden border-2 border-dark/20 flex items-center justify-center shadow-sm">
                <AppLogo className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-dark leading-tight mt-1 mb-1 pr-2">
                  {messages[score as keyof typeof messages] || messages[7]}
                </p>
                <p className="text-[10px] font-bold text-dark/60 tracking-wider uppercase">
                  — Mumma 💖
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 mx-1">
            <Button 
              onClick={handlePublish} 
              isLoading={isPublishing} 
              className="flex-1 !bg-[#ED5B97] !hover:bg-[#D94A84] !text-white !font-lilita !text-lg !tracking-wide !rounded-[30px] !p-4 !shadow-sm !flex !items-center !justify-center !gap-2 !border-[2.5px] !border-transparent !cursor-pointer"
            >
              Share to Community
            </Button>
            <button 
              onClick={resetApp} 
              className="flex-1 bg-[#241000] hover:bg-[#1A0A00] text-white rounded-[30px] p-2.5 transition-all flex flex-col items-center justify-center border-[2.5px] border-transparent cursor-pointer"
            >
              <div className="font-lilita text-[#F5B827] text-[15px] tracking-wide">mumma's kitchen ✨</div>
              <div className="text-[9px] text-[#FAF4EB] font-bold tracking-widest opacity-80 mt-0.5">cook with love, share with world</div>
            </button>
          </div>

          {/* Poster Generation Section */}
          <div className="mt-6 px-1">
            <PosterGenerator
              recipeName={session.recipeName}
              score={score!}
              userName={userData?.name || 'You'}
              userImage={selfieDataUrl || userData?.image || undefined}
              foodPhotoUrl={foodPhotoDataUrl || undefined}
              caption={`I made ${session.recipeName} with Mumma's Kitchen!`}
            />
          </div>
        </div>
        
        <div className="flex justify-center mt-3">
          <div className="w-10 h-10 rounded-full bg-dark/60 text-white flex items-center justify-center opacity-50 cursor-not-allowed">
            ↓
          </div>
        </div>
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
        <div className="flex flex-col items-end gap-1">
          <span className="bg-yellow border-2 border-dark rounded-[20px] px-3 py-1 text-xs font-extrabold text-dark">
            {currentStep + 1} / {session.totalSteps}
          </span>
          <button 
            onClick={() => setShowAllStepsModal(true)}
            className="text-[10px] font-extrabold text-dark/60 uppercase tracking-widest underline decoration-2 underline-offset-2 hover:text-dark cursor-pointer transition-colors"
          >
            view all
          </button>
        </div>
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

      {/* Timer */}
      <div className="mb-3">
        <Timer />
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => { setChatOpen(!chatOpen); if (!chatOpen) setVoiceCallOpen(false); }}
        >
          {chatOpen ? '✕ close chat' : '💬 Ask Mumma'}
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => { setVoiceCallOpen(true); setChatOpen(false); }}
        >
          🎙️ Call Mumma
        </Button>
        <Button onClick={markStepDone} isLoading={isMarkingDone} className="flex-1">
          {currentStep >= session.steps.length - 1 ? <>All done! 🥳</> : 'Done! Next →'}
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
                Mumma is typing<span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span>
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
            <Button
              className="!w-10 !h-10 !p-0 !min-h-0 !flex !items-center !justify-center !text-lg !shadow-custom-small !flex-shrink-0"
              onClick={sendMessage}
              isLoading={isWaitingMom}
            >
              ↑
            </Button>
          </div>
        </Card>
      )}

      {/* Voice Call Overlay */}
      {voiceCallOpen && (
        <VoiceCall
          stepId={currentStepData.id}
          stepTitle={currentStepData.title}
          onClose={() => setVoiceCallOpen(false)}
        />
      )}

      {/* Modal for All Steps */}
      {showAllStepsModal && (
        <div className="fixed inset-0 bg-dark/60 z-50 flex flex-col justify-end sm:justify-center p-4 fade-up">
          <div className="bg-cream border-[3px] border-dark rounded-[24px] max-h-[85vh] flex flex-col overflow-hidden max-w-md mx-auto w-full shadow-custom">
            <div className="p-4 border-b-2 border-dark flex justify-between items-center bg-yellow">
               <h2 className="font-lilita text-xl text-dark">All Recipe Steps</h2>
               <button onClick={() => setShowAllStepsModal(false)} className="w-8 h-8 flex items-center justify-center border-2 border-dark rounded-full bg-pink text-white font-bold cursor-pointer hover:bg-[#D94A84] transition-colors">&times;</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {session.steps.map(step => (
                <div key={step.id} className={`p-4 border-2 border-dark rounded-[16px] ${step.isCompleted ? 'bg-dark/5' : 'bg-white shadow-sm'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 border-2 border-dark rounded-[12px] flex items-center justify-center font-lilita flex-shrink-0 ${step.isCompleted ? 'bg-dark text-white' : 'bg-yellow text-dark'}`}>
                      {step.stepNumber}
                    </div>
                    <div>
                      <h3 className="font-lilita text-lg text-dark leading-none mb-1.5 text-left">{step.title}</h3>
                      <p className="text-sm font-bold text-dark/80 text-left leading-relaxed">{step.instruction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
