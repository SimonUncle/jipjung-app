"use client";

import { Achievement } from "@/types";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

interface AchievementUnlockProps {
  achievements: Achievement[];
  onClose: () => void;
}

export function AchievementUnlock({ achievements, onClose }: AchievementUnlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(showTimer);
  }, []);

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }
  };

  const current = achievements[currentIndex];
  if (!current) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300
        ${isVisible ? "bg-black/70 backdrop-blur-sm" : "bg-transparent"}`}
      onClick={handleNext}
      role="dialog"
      aria-modal="true"
      aria-label="업적 달성 알림"
    >
      <div
        className={`transform transition-all duration-500
          ${isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
      >
        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />

        <div className="relative bg-gradient-to-br from-amber-500/30 to-orange-600/30
                      backdrop-blur-xl rounded-2xl border border-amber-400/50
                      p-8 text-center min-w-[280px]">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500
                        rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
            <span className="text-4xl">{current.icon}</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-medium">업적 달성!</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{current.nameKo}</h2>
          <p className="text-white/60 text-sm">{current.name}</p>

          {achievements.length > 1 && (
            <div className="flex justify-center gap-1 mt-6" role="group" aria-label="진행 표시">
              {achievements.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentIndex ? "bg-amber-400" : "bg-white/30"
                  }`}
                  aria-current={idx === currentIndex ? "true" : undefined}
                />
              ))}
            </div>
          )}

          <p className="text-white/40 text-xs mt-4">탭하여 계속</p>
        </div>
      </div>
    </div>
  );
}
