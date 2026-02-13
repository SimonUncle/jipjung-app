"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface UseVisibilityOptions {
  onHidden?: () => void;
  onVisible?: () => void;
  enabled?: boolean;
  /** Grace period in ms before calling onHidden. 0 = immediate. */
  gracePeriodMs?: number;
  /** Called on each grace period tick with remaining seconds */
  onGraceTick?: (remainingSeconds: number) => void;
}

export function useVisibility(options: UseVisibilityOptions = {}) {
  const {
    onHidden,
    onVisible,
    enabled = true,
    gracePeriodMs = 0,
    onGraceTick,
  } = options;
  const isHiddenRef = useRef(false);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const graceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isInGracePeriod, setIsInGracePeriod] = useState(false);
  const [graceRemaining, setGraceRemaining] = useState(0);

  const clearGraceTimers = useCallback(() => {
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    if (graceIntervalRef.current) {
      clearInterval(graceIntervalRef.current);
      graceIntervalRef.current = null;
    }
    setIsInGracePeriod(false);
    setGraceRemaining(0);
  }, []);

  const startGracePeriod = useCallback(() => {
    const totalSeconds = Math.ceil(gracePeriodMs / 1000);
    setIsInGracePeriod(true);
    setGraceRemaining(totalSeconds);

    let remaining = totalSeconds;
    graceIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setGraceRemaining(remaining);
      onGraceTick?.(remaining);
      if (remaining <= 0) {
        if (graceIntervalRef.current) clearInterval(graceIntervalRef.current);
      }
    }, 1000);

    graceTimerRef.current = setTimeout(() => {
      clearGraceTimers();
      onHidden?.();
    }, gracePeriodMs);
  }, [gracePeriodMs, onHidden, onGraceTick, clearGraceTimers]);

  const handleHidden = useCallback(() => {
    isHiddenRef.current = true;

    if (gracePeriodMs > 0) {
      startGracePeriod();
    } else {
      onHidden?.();
    }
  }, [gracePeriodMs, startGracePeriod, onHidden]);

  const handleVisible = useCallback(() => {
    if (isHiddenRef.current) {
      // Returned within grace period — cancel failure
      if (graceTimerRef.current) {
        clearGraceTimers();
      }
      onVisible?.();
    }
    isHiddenRef.current = false;
  }, [onVisible, clearGraceTimers]);

  useEffect(() => {
    if (!enabled || typeof document === "undefined" || typeof window === "undefined") return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleHidden();
      } else if (document.visibilityState === "visible") {
        handleVisible();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearGraceTimers();
    };
  }, [enabled, handleHidden, handleVisible, clearGraceTimers]);

  return {
    isHidden: isHiddenRef.current,
    isInGracePeriod,
    graceRemaining,
  };
}
