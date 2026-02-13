// 타이머 옵션 (분 단위, 0.33 = 20초 테스트용)
export const TIMER_DURATIONS = [0.33, 1, 10, 30, 60] as const;
export type TimerDuration = (typeof TIMER_DURATIONS)[number];

// 캐빈 타입 (프리미엄 제거됨)
export const CABIN_TYPES = ["standard"] as const;
export type CabinType = (typeof CABIN_TYPES)[number];

// 시간대 모드
export const TIME_MODES = ["voyage", "realtime", "manual"] as const;
export type TimeMode = (typeof TIME_MODES)[number];

// 잠항 티켓 (컬렉션용)
export interface VoyageTicket {
  id: string;
  date: string; // ISO date string
  departurePortId: string;
  arrivalPortId: string;
  duration: number; // 분
  distance: number; // km
  cabinNumber: string;
  focusPurposeId?: string;
  focusPurposeText?: string;
}

// 업적 조건
export interface AchievementCondition {
  type: "voyages" | "focus_minutes" | "ports_visited" | "streak" | "region";
  value: number;
  region?: string;
}

// 업적 정의
export interface Achievement {
  id: string;
  name: string;
  nameKo: string;
  descriptionKo: string; // 해금 조건 설명
  icon: string;
  category: "voyage" | "focus" | "exploration" | "streak";
  condition: AchievementCondition;
}

// 일일 집중 기록 (주간 차트용)
export interface DailyFocusRecord {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  completedSessions: number;
}

// localStorage에 저장되는 데이터
export interface ClimbFocusData {
  version: number;
  stats: {
    totalFocusMinutes: number;
    completedSessions: number;
    failedSessions: number;
    longestSession: number;
  };
  // 오늘의 집중 통계
  todayStats: {
    date: string; // YYYY-MM-DD 형식
    focusMinutes: number;
    completedSessions: number;
  };
  // 연속 스트릭
  streak: {
    currentStreak: number;
    lastActiveDate: string; // YYYY-MM-DD
    longestStreak: number;
  };
  unlocks: {
    gears: string[];
    ports: string[]; // 해금된 항구 ID
    achievements: string[]; // 달성한 업적 ID
  };
  settings: {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    notificationsEnabled: boolean;
    timeMode: TimeMode;
  };
  // 일일/주간 목표
  goals: {
    dailyMinutes: number;
    weeklyMinutes: number;
  };
  // 잠항 기록
  voyageHistory: VoyageTicket[];
  // 주간 집중 기록
  weeklyFocus: DailyFocusRecord[];
  // 방문한 항구
  visitedPorts: string[];
  lastActivity: string;
}

