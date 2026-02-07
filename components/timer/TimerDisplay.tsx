"use client";

import { formatTime } from "@/hooks/useTimer";

interface TimerDisplayProps {
  remaining: number;
  className?: string;
}

export function TimerDisplay({ remaining, className = "" }: TimerDisplayProps) {
  return (
    <div className={`text-center ${className}`}>
      <span className="timer-display text-6xl md:text-7xl font-bold text-white tracking-wider">
        {formatTime(remaining)}
      </span>
    </div>
  );
}
