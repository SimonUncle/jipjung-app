"use client";

import { Achievement, ClimbFocusData } from "@/types";
import { ACHIEVEMENTS, getAchievementProgress, checkAchievementCondition } from "@/lib/achievements";
import { Lock } from "lucide-react";

interface AchievementGridProps {
  data: ClimbFocusData;
}

export function AchievementGrid({ data }: AchievementGridProps) {
  const unlockedIds = data.unlocks?.achievements || [];

  return (
    <div className="bg-black/20 rounded-xl p-4">
      <h3 className="text-sm font-medium text-white/80 mb-4">업적</h3>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const progress = getAchievementProgress(achievement, data);
          // 배열에 있거나 조건 충족 시 해금으로 표시
          const isUnlocked = unlockedIds.includes(achievement.id) ||
                            checkAchievementCondition(achievement, data);

          return (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              isUnlocked={isUnlocked}
              progress={progress}
            />
          );
        })}
      </div>
    </div>
  );
}

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
}

function AchievementBadge({ achievement, isUnlocked, progress }: AchievementBadgeProps) {
  return (
    <div className="relative group">
      <div
        className={`
          aspect-square rounded-xl flex flex-col items-center justify-center
          transition-all
          ${
            isUnlocked
              ? "bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-400/50"
              : "bg-white/5 border border-white/10"
          }
        `}
      >
        {isUnlocked ? (
          <span className="text-2xl">{achievement.icon}</span>
        ) : (
          <Lock className="w-5 h-5 text-white/30" />
        )}

        {/* 진행률 표시 (미달성 시) */}
        {!isUnlocked && progress > 0 && (
          <div className="absolute bottom-1 left-1 right-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500/50 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* 툴팁 */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5
                    bg-slate-800 rounded text-xs text-white whitespace-nowrap
                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                    border border-white/10 z-10">
        <div className="font-medium">{achievement.nameKo}</div>
        <div className="text-white/50 text-[10px] mt-0.5">{achievement.descriptionKo}</div>
        {!isUnlocked && (
          <div className="text-cyan-400 mt-1">{Math.round(progress)}% 달성</div>
        )}
      </div>
    </div>
  );
}
