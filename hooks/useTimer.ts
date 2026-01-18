'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseTimerOptions {
  autoStart?: boolean;
  onComplete?: () => void;
}

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  formatTime: (seconds?: number) => string;
}

export function useTimer(
  initialSeconds: number,
  options: UseTimerOptions = {}
): UseTimerReturn {
  const { autoStart = true, onComplete } = options;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onComplete]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTimeLeft(initialSeconds);
    setIsRunning(autoStart);
  }, [initialSeconds, autoStart]);

  const formatTime = useCallback((seconds?: number) => {
    const secs = seconds ?? timeLeft;
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
    formatTime,
  };
}
