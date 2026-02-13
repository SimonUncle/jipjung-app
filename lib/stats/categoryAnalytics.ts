// 카테고리별 집중 통계 분석

import { VoyageTicket } from "@/types";
import { FOCUS_PURPOSES } from "@/lib/focusPurposes";
import { type LucideIcon, HelpCircle } from "lucide-react";

export interface CategoryStat {
  id: string;
  label: string;
  icon: LucideIcon;
  minutes: number;
  count: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  focus: "bg-cyan-500",
  work: "bg-blue-500",
  read: "bg-emerald-500",
  exercise: "bg-orange-500",
  study: "bg-purple-500",
  custom: "bg-pink-500",
  unknown: "bg-gray-500",
};

/**
 * 잠항 티켓에서 카테고리별 통계 계산
 */
export function calculateCategoryStats(tickets: VoyageTicket[]): CategoryStat[] {
  const stats: Record<string, CategoryStat> = {};

  // 모든 카테고리 초기화
  FOCUS_PURPOSES.forEach((purpose) => {
    stats[purpose.id] = {
      id: purpose.id,
      label: purpose.labelKo,
      icon: purpose.icon,
      minutes: 0,
      count: 0,
      color: CATEGORY_COLORS[purpose.id] || CATEGORY_COLORS.unknown,
    };
  });

  // 티켓에서 카테고리별 시간 집계
  tickets.forEach((ticket) => {
    const purposeId = ticket.focusPurposeId || "focus";
    if (stats[purposeId]) {
      stats[purposeId].minutes += ticket.duration;
      stats[purposeId].count += 1;
    } else {
      // 알 수 없는 카테고리
      if (!stats.unknown) {
        stats.unknown = {
          id: "unknown",
          label: "기타",
          icon: HelpCircle,
          minutes: 0,
          count: 0,
          color: CATEGORY_COLORS.unknown,
        };
      }
      stats.unknown.minutes += ticket.duration;
      stats.unknown.count += 1;
    }
  });

  // 시간이 있는 카테고리만 필터링하고 정렬 (내림차순)
  return Object.values(stats)
    .filter((stat) => stat.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);
}

/**
 * 카테고리 통계의 총 집중 시간 계산
 */
export function calculateTotalMinutes(categoryStats: CategoryStat[]): number {
  return categoryStats.reduce((sum, stat) => sum + stat.minutes, 0);
}

/**
 * 가장 많이 집중한 카테고리 찾기
 */
export function getTopCategory(categoryStats: CategoryStat[]): CategoryStat | null {
  if (categoryStats.length === 0) return null;
  return categoryStats[0]; // 이미 정렬되어 있음
}
