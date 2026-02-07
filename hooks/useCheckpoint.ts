"use client";

import { useState, useEffect, useCallback } from "react";
import { Checkpoint } from "@/types";
import { CHECKPOINTS } from "@/lib/constants";

interface UseCheckpointOptions {
  onCheckpoint?: (checkpoint: Checkpoint) => void;
}

export function useCheckpoint(
  progress: number, // 0-100
  options: UseCheckpointOptions = {}
) {
  const { onCheckpoint } = options;
  const [passedCheckpoints, setPassedCheckpoints] = useState<number[]>([]);
  const [currentAlert, setCurrentAlert] = useState<Checkpoint | null>(null);

  // 새로운 체크포인트 도달 확인
  useEffect(() => {
    const newCheckpoint = CHECKPOINTS.find(
      (cp) => progress >= cp.percent && !passedCheckpoints.includes(cp.percent)
    );

    if (newCheckpoint) {
      setPassedCheckpoints((prev) => [...prev, newCheckpoint.percent]);
      setCurrentAlert(newCheckpoint);
      onCheckpoint?.(newCheckpoint);

      // 3초 후 알림 해제
      const timer = setTimeout(() => {
        setCurrentAlert(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [progress, passedCheckpoints, onCheckpoint]);

  const reset = useCallback(() => {
    setPassedCheckpoints([]);
    setCurrentAlert(null);
  }, []);

  const dismissAlert = useCallback(() => {
    setCurrentAlert(null);
  }, []);

  return {
    passedCheckpoints,
    currentAlert,
    reset,
    dismissAlert,
    checkpoints: CHECKPOINTS,
  };
}
