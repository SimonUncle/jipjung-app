"use client";

import { useMemo } from "react";
import { VoyageTicket } from "@/types";
import {
  calculateCategoryStats,
  calculateTotalMinutes,
  formatMinutesToTime,
} from "@/lib/stats";

interface CategoryChartProps {
  tickets: VoyageTicket[];
}

export function CategoryChart({ tickets }: CategoryChartProps) {
  const categoryStats = useMemo(
    () => calculateCategoryStats(tickets),
    [tickets]
  );

  const totalMinutes = useMemo(
    () => calculateTotalMinutes(categoryStats),
    [categoryStats]
  );

  if (categoryStats.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">카테고리별 집중</h3>
        <p className="text-blue-300/60 text-center py-8">
          아직 기록이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">카테고리별 집중</h3>

      {/* 막대 차트 */}
      <div className="space-y-4">
        {categoryStats.map((stat) => {
          const percentage = totalMinutes > 0 ? (stat.minutes / totalMinutes) * 100 : 0;

          return (
            <div key={stat.id} className="space-y-1">
              {/* 레이블 */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <stat.icon className="w-5 h-5 text-white/80" />
                  <span className="text-white">{stat.label}</span>
                  <span className="text-blue-300/40 text-xs">({stat.count}회)</span>
                </div>
                <span className="text-cyan-400 font-medium">
                  {formatMinutesToTime(stat.minutes)}
                </span>
              </div>

              {/* 프로그레스 바 */}
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stat.color} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 총계 */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-blue-300/60">총 집중 시간</span>
          <span className="text-xl font-bold text-white">
            {formatMinutesToTime(totalMinutes)}
          </span>
        </div>
      </div>
    </div>
  );
}
