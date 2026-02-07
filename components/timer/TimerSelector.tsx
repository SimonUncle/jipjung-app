"use client";

import { TimerDuration } from "@/types";
import { TIMER_DURATIONS } from "@/lib/constants";

interface TimerSelectorProps {
  onSelect: (duration: TimerDuration) => void;
}

// 시간 표시 포맷
function formatDuration(duration: TimerDuration): { value: string; unit: string } {
  if (duration === 0.33) {
    return { value: "20", unit: "초" };
  }
  return { value: String(duration), unit: "분" };
}

export function TimerSelector({ onSelect }: TimerSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
      {TIMER_DURATIONS.map((duration) => {
        const { value, unit } = formatDuration(duration);
        const isTest = duration === 0.33;

        return (
          <button
            key={duration}
            onClick={() => onSelect(duration)}
            className={`group relative px-4 py-6 rounded-2xl border
                       transition-all duration-300 ease-out
                       focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-dark-bg
                       ${isTest
                         ? "bg-dark-surface/50 border-dark-muted/50 hover:border-accent-secondary"
                         : "bg-dark-surface border-dark-border hover:border-accent-primary hover:bg-dark-surface/80"
                       }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className={`text-2xl font-bold transition-colors
                              ${isTest
                                ? "text-dark-muted group-hover:text-accent-secondary"
                                : "text-white group-hover:text-accent-primary"
                              }`}>
                {value}
              </span>
              <span className="text-xs text-dark-muted group-hover:text-white/70 transition-colors">
                {unit}
              </span>
              {isTest && (
                <span className="text-[10px] text-dark-muted/70">테스트</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
