"use client";

import { Checkpoint } from "@/types";
import { useEffect, useState } from "react";

interface CheckpointAlertProps {
  checkpoint: Checkpoint;
  onDismiss?: () => void;
}

export function CheckpointAlert({ checkpoint, onDismiss }: CheckpointAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 등장 애니메이션
    setIsVisible(true);

    // 3초 후 사라짐
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss?.(), 300);
    }, 2700);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm
                  transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`checkpoint-popup flex flex-col items-center gap-4 p-8 rounded-3xl
                    bg-gradient-to-b from-dark-surface to-dark-bg border border-dark-border
                    ${isVisible ? "scale-100" : "scale-90"} transition-transform duration-300`}
      >
        <span className="text-6xl">{checkpoint.emoji}</span>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">{checkpoint.label}</h3>
          {checkpoint.percent < 100 ? (
            <p className="text-dark-muted mt-2">잘하고 있어요!</p>
          ) : (
            <p className="text-accent-primary mt-2 font-medium">
              정상 도착을 축하합니다!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
