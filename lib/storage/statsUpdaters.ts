// 통계 관련 업데이터

import { ClimbFocusData, DailyFocusRecord } from "@/types";
import { getData, saveData, getTodayDate } from "./core";
import { getUnlockedPortIds } from "../portUnlocks";

// 스트릭 업데이트 로직
function updateStreak(
  prevStreak: ClimbFocusData["streak"],
  today: string
): ClimbFocusData["streak"] {
  const lastDate = prevStreak.lastActiveDate;

  if (!lastDate) {
    return {
      currentStreak: 1,
      lastActiveDate: today,
      longestStreak: 1,
    };
  }

  if (lastDate === today) {
    return prevStreak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (lastDate === yesterdayStr) {
    const newStreak = prevStreak.currentStreak + 1;
    return {
      currentStreak: newStreak,
      lastActiveDate: today,
      longestStreak: Math.max(prevStreak.longestStreak, newStreak),
    };
  }

  return {
    currentStreak: 1,
    lastActiveDate: today,
    longestStreak: prevStreak.longestStreak,
  };
}

// 주간 집중 기록 업데이트
function updateWeeklyFocusRecords(
  prev: DailyFocusRecord[],
  today: string,
  durationMinutes: number
): DailyFocusRecord[] {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  let weeklyFocus = (prev || []).filter((r) => r.date >= sevenDaysAgoStr);

  const existingIndex = weeklyFocus.findIndex((r) => r.date === today);
  if (existingIndex >= 0) {
    weeklyFocus[existingIndex] = {
      date: today,
      focusMinutes: weeklyFocus[existingIndex].focusMinutes + durationMinutes,
      completedSessions: weeklyFocus[existingIndex].completedSessions + 1,
    };
  } else {
    weeklyFocus.push({
      date: today,
      focusMinutes: durationMinutes,
      completedSessions: 1,
    });
  }
  weeklyFocus.sort((a, b) => a.date.localeCompare(b.date));

  return weeklyFocus;
}

/**
 * 세션 완료 기록
 */
export function recordComplete(durationMinutes: number): ClimbFocusData {
  const prev = getData();
  const today = getTodayDate();
  const oldTotal = prev.stats.totalFocusMinutes;
  const newTotal = oldTotal + durationMinutes;
  const newLongest = Math.max(prev.stats.longestSession, durationMinutes);

  // 오늘 통계 업데이트
  const todayStats =
    prev.todayStats?.date === today
      ? {
          date: today,
          focusMinutes: prev.todayStats.focusMinutes + durationMinutes,
          completedSessions: prev.todayStats.completedSessions + 1,
        }
      : {
          date: today,
          focusMinutes: durationMinutes,
          completedSessions: 1,
        };

  // 스트릭 업데이트
  const streak = updateStreak(
    prev.streak || { currentStreak: 0, lastActiveDate: "", longestStreak: 0 },
    today
  );

  // 항구 해금 업데이트
  const newUnlockedPorts = getUnlockedPortIds(newTotal);

  // 주간 집중 기록 업데이트
  const weeklyFocus = updateWeeklyFocusRecords(prev.weeklyFocus, today, durationMinutes);

  const updated: ClimbFocusData = {
    ...prev,
    stats: {
      ...prev.stats,
      totalFocusMinutes: newTotal,
      completedSessions: prev.stats.completedSessions + 1,
      longestSession: newLongest,
    },
    todayStats,
    streak,
    unlocks: {
      ...prev.unlocks,
      ports: newUnlockedPorts,
    },
    weeklyFocus,
    lastActivity: new Date().toISOString(),
  };
  saveData(updated);
  return updated;
}

/**
 * 세션 실패 기록
 */
export function recordFail(): ClimbFocusData {
  const prev = getData();
  const updated: ClimbFocusData = {
    ...prev,
    stats: {
      ...prev.stats,
      failedSessions: prev.stats.failedSessions + 1,
    },
    lastActivity: new Date().toISOString(),
  };
  saveData(updated);
  return updated;
}

/**
 * 통계 부분 업데이트
 */
export function updateStats(
  update: Partial<ClimbFocusData["stats"]>
): ClimbFocusData {
  const current = getData();
  const updated: ClimbFocusData = {
    ...current,
    stats: { ...current.stats, ...update },
    lastActivity: new Date().toISOString(),
  };
  saveData(updated);
  return updated;
}

/**
 * 주간 집중 기록 업데이트
 */
export function updateWeeklyFocus(record: DailyFocusRecord): ClimbFocusData {
  const prev = getData();
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  let weeklyFocus = prev.weeklyFocus.filter((r) => r.date >= sevenDaysAgoStr);

  const existingIndex = weeklyFocus.findIndex((r) => r.date === record.date);
  if (existingIndex >= 0) {
    weeklyFocus[existingIndex] = record;
  } else {
    weeklyFocus.push(record);
  }
  weeklyFocus.sort((a, b) => a.date.localeCompare(b.date));

  const updated: ClimbFocusData = {
    ...prev,
    weeklyFocus,
    lastActivity: new Date().toISOString(),
  };
  saveData(updated);
  return updated;
}
