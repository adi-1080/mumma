'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function playAlarm() {
  // Try MP3 first, fall back to AudioContext beep
  try {
    const audio = new Audio('/alarm.mp3');
    audio.play().catch(() => playBeep());
  } catch {
    playBeep();
  }
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    // Play 3 short beeps
    [0, 0.3, 0.6].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
  } catch {
    // AudioContext not available
  }
}

const PRESETS = [
  { label: '5m', seconds: 5 * 60 },
  { label: '10m', seconds: 10 * 60 },
  { label: '15m', seconds: 15 * 60 },
  { label: '30m', seconds: 30 * 60 },
];

export default function Timer() {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [hasFinished, setHasFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasFinished(true);
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining]);

  const setPreset = useCallback((seconds: number) => {
    setTotalSeconds(seconds);
    setRemaining(seconds);
    setIsRunning(false);
    setHasFinished(false);
    setCustomMinutes('');
  }, []);

  const setCustom = useCallback(() => {
    const mins = parseInt(customMinutes, 10);
    if (isNaN(mins) || mins <= 0 || mins > 180) return;
    const secs = mins * 60;
    setTotalSeconds(secs);
    setRemaining(secs);
    setIsRunning(false);
    setHasFinished(false);
  }, [customMinutes]);

  const toggleRunning = useCallback(() => {
    if (remaining <= 0) return;
    setHasFinished(false);
    setIsRunning((prev) => !prev);
  }, [remaining]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setRemaining(totalSeconds);
    setHasFinished(false);
  }, [totalSeconds]);

  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  return (
    <Card className={`${hasFinished ? 'bg-pink/10' : 'bg-orange'} transition-colors`}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-lilita text-base text-dark">Timer</h3>
        {hasFinished && (
          <span className="bg-pink text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full ml-auto border-2 border-dark">
            Done!
          </span>
        )}
      </div>

      {/* Clock Display */}
      <div className="text-center mb-3">
        <div className={`font-lilita text-5xl tracking-wider ${hasFinished ? 'text-pink' : 'text-dark'} transition-colors`}>
          {formatTime(remaining)}
        </div>
      </div>

      {/* Progress Bar */}
      {totalSeconds > 0 && (
        <div className="bg-dark/10 rounded-full h-1.5 mb-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${hasFinished ? 'bg-pink' : 'bg-dark'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Preset Buttons */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setPreset(p.seconds)}
            className={`btn-secondary !text-xs !px-3 !py-1.5 !rounded-[10px] flex-1 min-w-[50px]
              ${totalSeconds === p.seconds && !isRunning ? '!bg-yellow' : ''}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Input */}
      <div className="flex gap-2 mb-3">
        <input
          type="number"
          min="1"
          max="180"
          placeholder="mins"
          value={customMinutes}
          onChange={(e) => setCustomMinutes(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setCustom()}
          className="flex-1 border-[2.5px] border-dark rounded-[12px] p-2 font-nunito text-sm font-bold outline-none bg-cream text-center w-20"
        />
        <Button variant="secondary" onClick={setCustom} className="!text-xs">
          Set
        </Button>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          variant={isRunning ? 'secondary' : 'primary'}
          className="flex-1 !text-sm"
          onClick={toggleRunning}
          disabled={remaining <= 0 && !hasFinished}
        >
          {isRunning ? 'Pause' : remaining < totalSeconds && remaining > 0 ? 'Resume' : 'Start'}
        </Button>
        <Button
          variant="secondary"
          className="!text-sm"
          onClick={reset}
          disabled={totalSeconds <= 0}
        >
          Reset
        </Button>
      </div>
    </Card>
  );
}
