"use client";

import { Gear } from "@/types";
import { useEffect, useState } from "react";

interface UnlockBadgeProps {
  gear: Gear;
  onDismiss?: () => void;
}

export function UnlockBadge({ gear, onDismiss }: UnlockBadgeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 등장 애니메이션
    setTimeout(() => setIsVisible(true), 100);

    // 4초 후 자동 닫힘
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss?.(), 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm
                  transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
      onClick={() => {
        setIsVisible(false);
        setTimeout(() => onDismiss?.(), 300);
      }}
    >
      <div
        className={`flex flex-col items-center gap-6 p-8 rounded-3xl
                    bg-gradient-to-b from-dark-surface to-dark-bg border border-accent-primary/50
                    shadow-lg shadow-accent-primary/20
                    transform transition-all duration-500
                    ${isVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-4"}`}
      >
        {/* 빛나는 효과 */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-accent-primary/5 animate-pulse" />
        </div>

        {/* 새 장비 해금! 텍스트 */}
        <div className="relative">
          <span className="text-sm font-medium text-accent-primary tracking-wider uppercase">
            New Gear Unlocked!
          </span>
        </div>

        {/* 장비 아이콘 */}
        <div className="relative">
          <span className="text-7xl animate-bounce">{gear.emoji}</span>
          {/* 반짝임 효과 */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-300 rounded-full animate-ping" />
          <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-accent-primary rounded-full animate-ping animation-delay-500" />
        </div>

        {/* 장비 이름 */}
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-bold text-white">{gear.name}</h3>
          <p className="text-dark-muted text-sm">{gear.description}</p>
        </div>

        {/* 탭하여 닫기 */}
        <p className="text-xs text-dark-muted/60">탭하여 닫기</p>
      </div>
    </div>
  );
}
