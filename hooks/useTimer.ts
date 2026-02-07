"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseTimerOptions {
  onTick?: (remaining: number) => void;
  onComplete?: () => void;
}

export function useTimer(
  durationSeconds: number,
  isRunning: boolean,
  options: UseTimerOptions = {}
) {
  const { onTick, onComplete } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const remainingRef = useRef(durationSeconds);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    remainingRef.current = durationSeconds;
  }, [durationSeconds]);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      remainingRef.current -= 1;
      onTick?.(remainingRef.current);

      if (remainingRef.current <= 0) {
        clearTimer();
        onComplete?.();
      }
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer, onTick, onComplete]);

  return {
    remaining: remainingRef.current,
    clearTimer,
  };
}

// 시간 포맷팅 유틸리티
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${mins}분`;
}
