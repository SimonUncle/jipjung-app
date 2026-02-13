"use client";

import { Flame } from "lucide-react";

interface StreakBadgeProps {
  currentStreak: number;
}

export function StreakBadge({ currentStreak }: StreakBadgeProps) {
  // 색상 결정: 1-6일 cyan, 7일+ orange, 30일+ red
  const getStreakColor = () => {
    if (currentStreak >= 30) return "from-red-500 to-orange-500";
    if (currentStreak >= 7) return "from-orange-500 to-amber-500";
    return "from-cyan-500 to-blue-500";
  };

  const getTextColor = () => {
    if (currentStreak >= 30) return "text-red-400";
    if (currentStreak >= 7) return "text-orange-400";
    return "text-cyan-400";
  };

  if (currentStreak === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-blue-200/60 text-sm">
          오늘 첫 잠항을 시작하세요!
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <div className={`p-1.5 rounded-full bg-gradient-to-r ${getStreakColor()}`}>
        <Flame className="w-4 h-4 text-white" />
      </div>
      <span className={`font-bold ${getTextColor()}`}>
        {currentStreak}일 연속 집중 중!
      </span>
    </div>
  );
}
