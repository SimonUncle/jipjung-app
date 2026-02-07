"use client";

import { Target, TrendingUp } from "lucide-react";

interface GoalProgressProps {
  todayMinutes: number;
  dailyGoal: number;
  weeklyMinutes: number;
  weeklyGoal: number;
  onEditGoal?: () => void;
}

export function GoalProgress({
  todayMinutes,
  dailyGoal,
  weeklyMinutes,
  weeklyGoal,
  onEditGoal,
}: GoalProgressProps) {
  const dailyProgress = Math.min(100, (todayMinutes / dailyGoal) * 100);
  const weeklyProgress = Math.min(100, (weeklyMinutes / weeklyGoal) * 100);
  const isDailyComplete = todayMinutes >= dailyGoal;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
      {/* 오늘 목표 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white/80">오늘 목표</span>
          </div>
          <span className={`text-sm font-medium ${isDailyComplete ? "text-green-400" : "text-white"}`}>
            {formatTime(todayMinutes)} / {formatTime(dailyGoal)}
            {isDailyComplete && " ✓"}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDailyComplete
                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                : "bg-gradient-to-r from-cyan-400 to-blue-500"
            }`}
            style={{ width: `${dailyProgress}%` }}
          />
        </div>
      </div>

      {/* 주간 목표 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white/80">이번 주</span>
          </div>
          <span className="text-sm text-white/60">
            {formatTime(weeklyMinutes)} / {formatTime(weeklyGoal)}
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${weeklyProgress}%` }}
          />
        </div>
      </div>

      {/* 목표 수정 버튼 (옵션) */}
      {onEditGoal && (
        <button
          onClick={onEditGoal}
          className="mt-3 w-full text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          목표 수정
        </button>
      )}
    </div>
  );
}
