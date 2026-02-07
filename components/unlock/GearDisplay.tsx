"use client";

import { GEARS } from "@/lib/constants";
import { getProgressToNextUnlock } from "@/lib/unlocks";

interface GearDisplayProps {
  totalMinutes: number;
  unlockedGears: string[];
}

export function GearDisplay({ totalMinutes, unlockedGears }: GearDisplayProps) {
  const unlockedItems = GEARS.filter((g) => unlockedGears.includes(g.id));
  const nextProgress = getProgressToNextUnlock(totalMinutes, unlockedGears);

  return (
    <div className="w-full max-w-xs space-y-4">
      {/* 해금된 장비 */}
      {unlockedItems.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          {unlockedItems.map((gear) => (
            <div
              key={gear.id}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-dark-surface border border-dark-border"
              title={gear.description}
            >
              <span className="text-xl">{gear.emoji}</span>
              <span className="text-sm text-white/80">{gear.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* 다음 해금까지 진행도 */}
      {nextProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-muted">다음 해금</span>
            <span className="text-white/80">
              {nextProgress.gear.emoji} {nextProgress.gear.name}
            </span>
          </div>
          <div className="relative h-2 bg-dark-surface rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-primary/50 to-accent-primary rounded-full transition-all duration-500"
              style={{ width: `${nextProgress.progress}%` }}
            />
          </div>
          <div className="text-xs text-dark-muted text-center">
            {totalMinutes}분 / {nextProgress.gear.requiredMinutes}분
          </div>
        </div>
      )}

      {/* 모두 해금 완료 */}
      {!nextProgress && unlockedItems.length === GEARS.length && (
        <div className="text-center text-sm text-accent-primary">
          모든 장비를 획득했습니다!
        </div>
      )}
    </div>
  );
}
