import { Checkpoint, Gear, TimerDuration, VoyageTicket, DailyFocusRecord } from "@/types";

// 타이머 옵션 (0.33 = 20초 테스트용)
export const TIMER_DURATIONS: TimerDuration[] = [0.33, 1, 10, 30, 60];

// 휴식 시간 (분)
export const REST_DURATION_MINUTES = 10;

// 체크포인트 (진행률 기준) - 100%만 표시
export const CHECKPOINTS: Checkpoint[] = [
  { percent: 100, label: "탐험 완료!", emoji: "🎉" },
];

// 해금 가능한 장비
export const GEARS: Gear[] = [
  {
    id: "boots",
    name: "탐험 신발",
    emoji: "🥾",
    requiredMinutes: 60,
    description: "첫 번째 장비! 60분 집중으로 해금",
  },
  {
    id: "backpack",
    name: "탐험 배낭",
    emoji: "🎒",
    requiredMinutes: 180,
    description: "3시간 누적 집중으로 해금",
  },
];

// localStorage 키
export const STORAGE_KEY = "climb-focus-data";

// 오늘 날짜 가져오기 (YYYY-MM-DD)
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// 초기 해금 항구
export const INITIAL_UNLOCKED_PORTS = ["busan", "osaka", "tokyo"];

// 기본 저장 데이터 생성 함수 (hydration 문제 방지)
export function getDefaultData() {
  return {
    version: 3,
    stats: {
      totalFocusMinutes: 0,
      completedSessions: 0,
      failedSessions: 0,
      longestSession: 0,
    },
    todayStats: {
      date: getTodayDate(),
      focusMinutes: 0,
      completedSessions: 0,
    },
    streak: {
      currentStreak: 0,
      lastActiveDate: "",
      longestStreak: 0,
    },
    unlocks: {
      gears: [] as string[],
      ports: INITIAL_UNLOCKED_PORTS,
      achievements: [] as string[],
    },
    settings: {
      soundEnabled: true,
      vibrationEnabled: true,
      notificationsEnabled: false,
      timeMode: "voyage" as const,
    },
    goals: {
      dailyMinutes: 60,
      weeklyMinutes: 300,
    },
    voyageHistory: [] as VoyageTicket[],
    weeklyFocus: [] as DailyFocusRecord[],
    visitedPorts: ["busan"],
    lastActivity: new Date().toISOString(),
  };
}

// 기본 저장 데이터 (SSR용 정적 값)
export const DEFAULT_DATA = {
  version: 3,
  stats: {
    totalFocusMinutes: 0,
    completedSessions: 0,
    failedSessions: 0,
    longestSession: 0,
  },
  todayStats: {
    date: "",
    focusMinutes: 0,
    completedSessions: 0,
  },
  streak: {
    currentStreak: 0,
    lastActiveDate: "",
    longestStreak: 0,
  },
  unlocks: {
    gears: [] as string[],
    ports: INITIAL_UNLOCKED_PORTS,
    achievements: [] as string[],
  },
  settings: {
    soundEnabled: true,
    vibrationEnabled: true,
    notificationsEnabled: false,
    timeMode: "voyage" as const,
  },
  goals: {
    dailyMinutes: 60,
    weeklyMinutes: 300,
  },
  voyageHistory: [] as VoyageTicket[],
  weeklyFocus: [] as DailyFocusRecord[],
  visitedPorts: ["busan"],
  lastActivity: "",
};
