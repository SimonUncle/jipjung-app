import { TimerDuration, VoyageTicket, DailyFocusRecord } from "@/types";

// 어드민 이메일
export const ADMIN_EMAILS = [
  "k01077679687@gmail.com",
  "kingapple1369@gmail.com",
];

// 타이머 옵션 (0.33 = 20초 테스트용)
export const TIMER_DURATIONS: TimerDuration[] = [0.33, 1, 10, 30, 60];

// 휴식 시간 (분)
export const REST_DURATION_MINUTES = 10;

// localStorage 키 (기존 사용자 데이터 호환을 위해 값 유지)
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
