"use client";

import { DURATION_OPTIONS } from "@/lib/routes";

interface DurationSelectorProps {
  selected: number;
  onSelect: (duration: number) => void;
}

export function DurationSelector({ selected, onSelect }: DurationSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-xs text-blue-300/70 block">항해 시간</label>

      <div className="grid grid-cols-3 gap-2">
        {DURATION_OPTIONS.map((option) => {
          const isSelected = selected === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`py-3 px-2 rounded-xl border transition-all
                ${
                  isSelected
                    ? "bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-blue-400/50 text-white"
                    : "bg-white/5 border-white/10 text-blue-200/70 hover:bg-white/10 hover:border-white/20"
                }`}
            >
              <div className="text-2xl mb-1">{option.emoji}</div>
              <div className={`text-sm font-medium ${isSelected ? "text-white" : ""}`}>
                {option.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
