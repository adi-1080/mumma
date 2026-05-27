'use client';

import { useState, useRef, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AppLogo from '@/components/ui/AppLogo';
import Link from 'next/link';

interface VoiceMessage {
  role: 'user' | 'mom';
  content: string;
  audioData?: string | null;
}

interface VoiceChatProps {
  stepId: string;
  stepTitle: string;
}

export default function VoiceChat({ stepId, stepTitle }: VoiceChatProps) {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const playAudio = (base64Audio: string) => {
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audio.play().catch((err) => {
        console.warn('Audio playback failed:', err);
      });
    } catch (err) {
      console.warn('Audio creation failed:', err);
    }
  };

  const sendMessage = async () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || isSending) return;

    setInputMessage('');
    setError(null);

    // Add user message immediately
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setIsSending(true);

    try {
      const response = await fetch('/api/chat/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, userMessage: trimmed }),
      });

      if (response.status === 402) {
        setQuotaExceeded(true);
        setMessages((prev) => [
          ...prev,
          {
            role: 'mom',
            content: 'Beta, you\'ve used all your voice characters! Upgrade to Pro for more 💖',
          },
        ]);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Something went wrong' }));
        throw new Error(data.error || `Error ${response.status}`);
      }

      const data = await response.json();

      // Add mom's response
      setMessages((prev) => [
        ...prev,
        {
          role: 'mom',
          content: data.text,
          audioData: data.audio,
        },
      ]);

      // Play audio instantly if available
      if (data.audio) {
        playAudio(data.audio);
      }
    } catch (err: any) {
      console.error('Voice chat error:', err);
      setError(err.message || 'Failed to send message');
      setMessages((prev) => [
        ...prev,
        {
          role: 'mom',
          content: 'Sorry beta, mumma had trouble hearing you. Try again? 🥺',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-full border-2 border-dark flex items-center justify-center flex-shrink-0 overflow-hidden bg-white">
          <AppLogo className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h3 className="font-lilita text-sm text-dark">Mumma 🎙️</h3>
          <p className="text-xs font-bold text-dark/50">voice chat about this step</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex flex-col gap-2 mb-3 max-h-[250px] overflow-y-auto pr-0.5"
      >
        {/* Welcome message */}
        {!messages.length && (
          <div className="bg-yellow border-2 border-dark rounded-[16px] rounded-tl-[4px] p-3.5 max-w-[88%] text-sm font-bold leading-relaxed self-start">
            Beta, any doubt about &quot;{stepTitle}&quot;? Ask mumma — I&apos;ll even talk to you! 🎙️❤️
          </div>
        )}

        {/* Chat bubbles */}
        {messages.map((message, index) => (
          <div key={index} className="flex flex-col gap-1">
            <div
              className={`p-3.5 border-2 border-dark max-w-[88%] text-sm font-bold leading-relaxed
                ${message.role === 'mom'
                  ? 'bg-yellow rounded-[16px] rounded-tl-[4px] self-start'
                  : 'bg-dark text-white rounded-[16px] rounded-tr-[4px] self-end'
                }`}
            >
              {message.content}
            </div>
            {/* Replay audio button */}
            {message.role === 'mom' && message.audioData && (
              <button
                onClick={() => playAudio(message.audioData!)}
                className="self-start ml-2 text-xs font-bold text-dark/40 hover:text-dark/70 transition-colors flex items-center gap-1"
              >
                🔊 replay
              </button>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isSending && (
          <div className="bg-yellow border-2 border-dark rounded-[16px] rounded-tl-[4px] p-3.5 max-w-[88%] text-sm font-bold leading-relaxed self-start">
            Mumma is thinking<span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span>
          </div>
        )}
      </div>

      {/* Quota exceeded banner */}
      {quotaExceeded && (
        <div className="bg-pink/10 border-2 border-pink rounded-[14px] p-3 mb-3 text-center">
          <p className="text-sm font-bold text-dark mb-2">
            Voice characters used up! 🎙️
          </p>
          <Link href="/pricing">
            <Button className="!text-sm !py-2">
              ✨ Upgrade to Pro
            </Button>
          </Link>
        </div>
      )}

      {/* Error message */}
      {error && !quotaExceeded && (
        <div className="bg-pink/10 border-2 border-pink/30 rounded-[12px] p-2.5 mb-3 text-xs font-bold text-pink text-center">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 border-[2.5px] border-dark rounded-[12px] p-2.5 font-nunito text-sm font-bold outline-none bg-cream"
          placeholder="Ask mumma anything about this step..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={isSending || quotaExceeded}
        />
        <Button
          className="!w-10 !h-10 !p-0 !min-h-0 !flex !items-center !justify-center !text-lg !shadow-custom-small !flex-shrink-0"
          onClick={sendMessage}
          isLoading={isSending}
          disabled={quotaExceeded}
        >
          ↑
        </Button>
      </div>
    </Card>
  );
}
