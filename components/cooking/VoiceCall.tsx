'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import AppLogo from '@/components/ui/AppLogo';
import Link from 'next/link';

interface VoiceCallProps {
  stepId: string;
  stepTitle: string;
  onClose: () => void;
  initialQuotaExceeded?: boolean;
}

export default function VoiceCall({ stepId, stepTitle, onClose, initialQuotaExceeded }: VoiceCallProps) {
  const [callState, setCallState] = useState<'connecting' | 'listening' | 'thinking' | 'speaking' | 'muted' | 'ended'>('connecting');
  const [duration, setDuration] = useState(0);
  const [userTranscript, setUserTranscript] = useState('');
  const [momReply, setMomReply] = useState('');
  const [quotaExceeded, setQuotaExceeded] = useState(initialQuotaExceeded || false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMutedRef = useRef(false);

  // 1. Duration counter
  useEffect(() => {
    if (initialQuotaExceeded) return;
    durationIntervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [initialQuotaExceeded]);

  // Format call duration MM:SS
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 2. Initialize Speech Recognition
  useEffect(() => {
    if (initialQuotaExceeded) {
      setCallState('ended');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Web Speech API is not supported in this browser. Please use Chrome/Safari.');
      setCallState('ended');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-IN'; // Indian English matching Mumma's accent

    rec.onstart = () => {
      if (!isMutedRef.current) {
        setCallState('listening');
      }
    };

    rec.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (!transcript.trim()) return;

      setUserTranscript(transcript);
      setCallState('thinking');

      // Send to AI voice API
      try {
        const response = await fetch('/api/chat/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stepId, userMessage: transcript }),
        });

        if (response.status === 402) {
          setQuotaExceeded(true);
          setCallState('ended');
          return;
        }

        if (!response.ok) {
          throw new Error('API failed');
        }

        const data = await response.json();
        setMomReply(data.text);

        if (data.audio) {
          playMomAudio(data.audio);
        } else {
          // If no audio (best-effort text-only fallback)
          setCallState('speaking');
          setTimeout(() => {
            startListening();
          }, 3000);
        }
      } catch (err) {
        console.error(err);
        setMomReply('Sorry beta, network error. Speak again?');
        setCallState('speaking');
        setTimeout(() => {
          startListening();
        }, 3000);
      }
    };

    rec.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Just silently restart listening
        startListening();
      } else {
        setError('Microphone error. Check permissions.');
        setCallState('ended');
      }
    };

    rec.onend = () => {
      // Loop: Only restart if we are still expected to be in listening state and not speaking/thinking
      if (callState === 'listening' && !isMutedRef.current) {
        rec.start();
      }
    };

    recognitionRef.current = rec;

    // Simulate connection delay
    const connectTimeout = setTimeout(() => {
      setCallState('listening');
      rec.start();
    }, 1500);

    return () => {
      clearTimeout(connectTimeout);
      stopAll();
    };
  }, [stepId]);

  // Start listening helper
  const startListening = () => {
    if (isMutedRef.current) return;
    setCallState('listening');
    try {
      recognitionRef.current?.start();
    } catch (e) {
      // Already running
    }
  };

  // Play audio response and handle transition
  const playMomAudio = (base64Audio: string) => {
    stopActiveAudio();
    setCallState('speaking');

    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    activeAudioRef.current = audio;

    audio.onended = () => {
      activeAudioRef.current = null;
      startListening();
    };

    audio.onerror = () => {
      activeAudioRef.current = null;
      startListening();
    };

    audio.play().catch((err) => {
      console.warn('Audio play failed:', err);
      // Fallback
      startListening();
    });
  };

  const stopActiveAudio = () => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
      } catch (e) {}
      activeAudioRef.current = null;
    }
  };

  const stopAll = () => {
    stopActiveAudio();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
  };

  const toggleMute = () => {
    if (isMutedRef.current) {
      isMutedRef.current = false;
      setCallState('listening');
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    } else {
      isMutedRef.current = true;
      setCallState('muted');
      try {
        recognitionRef.current?.abort();
      } catch (e) {}
      stopActiveAudio();
    }
  };

  const handleEndCall = () => {
    stopAll();
    setCallState('ended');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-dark/95 backdrop-blur-lg z-[99999] flex flex-col items-center justify-between p-6 text-white select-none transition-all duration-300">
      {/* Top Banner */}
      <div className="w-full max-w-md flex flex-col items-center text-center mt-8">
        <span className="bg-white/10 text-yellow text-[10px] font-extrabold px-3 py-1 rounded-full border border-white/20 tracking-wider uppercase mb-2">
          Cooking Step {stepTitle.split(' ')[0] || ''}
        </span>
        <h2 className="font-lilita text-lg text-white/80 max-w-[280px] truncate">
          {stepTitle}
        </h2>
      </div>

      {/* Center Avatar & Pulsing Wave */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative flex items-center justify-center">
          {/* Wave 1 */}
          {(callState === 'listening' || callState === 'speaking') && (
            <div className="absolute w-[220px] h-[220px] bg-yellow/10 rounded-full animate-ping [animation-duration:2s]" />
          )}
          {/* Wave 2 */}
          {callState === 'speaking' && (
            <div className="absolute w-[180px] h-[180px] bg-pink/20 rounded-full animate-ping [animation-duration:1.2s]" />
          )}

          {/* Avatar Container */}
          <div className="w-36 h-36 rounded-full bg-white border-[4px] border-dark flex items-center justify-center overflow-hidden shadow-2xl relative z-10">
            <AppLogo className="w-full h-full object-cover scale-110" />
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-8 text-center">
          <h1 className="font-lilita text-2xl tracking-wide text-yellow">
            {callState === 'connecting' && 'Connecting...'}
            {callState === 'listening' && 'Listening Beta...'}
            {callState === 'thinking' && 'Mumma listening...'}
            {callState === 'speaking' && 'Mumma Speaking...'}
            {callState === 'muted' && 'Microphone Muted'}
            {callState === 'ended' && 'Call Ended'}
          </h1>
          <span className="font-nunito text-sm text-white/40 font-bold block mt-1">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Subtitles Area (Live Transcript) */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[20px] p-4.5 mb-8 text-center min-h-[96px] flex flex-col justify-center gap-1.5 backdrop-blur-sm">
        {userTranscript && (
          <p className="text-xs font-bold text-white/50 leading-relaxed italic">
            &ldquo;{userTranscript}&rdquo;
          </p>
        )}
        {momReply ? (
          <p className="text-sm font-extrabold text-yellow leading-relaxed">
            {momReply}
          </p>
        ) : (
          callState === 'listening' && (
            <p className="text-xs font-bold text-white/30 italic">
              Speak your kitchen doubts aloud...
            </p>
          )
        )}
      </div>

      {/* Quota Banner */}
      {quotaExceeded && (
        <div className="fixed inset-0 bg-dark/95 flex flex-col items-center justify-center p-6 text-center z-[999999]">
          <h2 className="font-lilita text-2xl text-yellow mb-2">Voice Limits Reached!</h2>
          <p className="text-sm font-bold text-white/60 max-w-sm mb-6 leading-relaxed">
            Beta, you have run out of your voice call characters. Upgrade to Pro so we can continue talking!
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link href="/pricing" onClick={handleEndCall}>
              <Button fullWidth className="!bg-[#FF4D80]">
                Upgrade to Pro
              </Button>
            </Link>
            <Button variant="secondary" fullWidth onClick={handleEndCall} className="!bg-white/10 !text-white !border-white/20">
              Go back
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-8 mb-8 z-10">
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          disabled={callState === 'connecting'}
          className={`w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center transition-all cursor-pointer font-bold
            ${callState === 'muted' ? 'bg-white text-dark border-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
        >
          {callState === 'muted' ? 'Talk' : 'Mute'}
        </button>

        {/* Hang Up Button */}
        <button
          onClick={handleEndCall}
          className="w-20 h-20 rounded-full bg-pink hover:bg-pink/90 border-4 border-dark flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer font-lilita text-dark text-sm"
        >
          End
        </button>
      </div>

      {/* Top level browser support error */}
      {error && !quotaExceeded && (
        <div className="fixed inset-0 bg-dark/95 flex flex-col items-center justify-center p-6 text-center z-[999999]">
          <h2 className="font-lilita text-xl text-pink mb-2">Speech Error</h2>
          <p className="text-sm font-bold text-white/70 max-w-xs mb-6">{error}</p>
          <Button onClick={handleEndCall}>Close</Button>
        </div>
      )}
    </div>
  );
}
