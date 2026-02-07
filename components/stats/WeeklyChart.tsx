"use client";

import { DailyFocusRecord } from "@/types";

interface WeeklyChartProps {
  weeklyFocus: DailyFocusRecord[];
}

export function WeeklyChart({ weeklyFocus }: WeeklyChartProps) {
  // 최근 7일 날짜 생성
  const days: { date: string; label: string }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("ko-KR", { weekday: "short" });
    days.push({ date: dateStr, label: dayLabel });
  }

  // 각 날짜의 집중 시간 계산
  const focusMinutesByDate: Record<string, number> = {};
  for (const record of weeklyFocus) {
    focusMinutesByDate[record.date] = record.focusMinutes;
  }

  // 최대값 계산 (막대 높이 비율용)
  const maxMinutes = Math.max(
    30, // 최소 30분
    ...days.map((d) => focusMinutesByDate[d.date] || 0)
  );

  return (
    <div className="bg-black/20 rounded-xl p-4">
      <h3 className="text-sm font-medium text-white/80 mb-4">주간 집중 시간</h3>

      <div className="flex items-end justify-between h-32 gap-2">
        {days.map(({ date, label }) => {
          const minutes = focusMinutesByDate[date] || 0;
          const heightPercent = maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
          const isToday = date === today.toISOString().split("T")[0];

          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-2">
              {/* 막대 */}
              <div className="w-full h-24 flex flex-col justify-end">
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    isToday
                      ? "bg-gradient-to-t from-cyan-500 to-cyan-400"
                      : minutes > 0
                      ? "bg-gradient-to-t from-blue-500/70 to-blue-400/70"
                      : "bg-white/10"
                  }`}
                  style={{ height: `${Math.max(4, heightPercent)}%` }}
                />
              </div>

              {/* 시간 표시 */}
              <div className="text-xs text-white/60">
                {minutes > 0 ? `${minutes}분` : "-"}
              </div>

              {/* 요일 */}
              <div
                className={`text-xs ${
                  isToday ? "text-cyan-400 font-medium" : "text-white/50"
                }`}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
