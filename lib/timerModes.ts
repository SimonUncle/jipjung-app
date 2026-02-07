// 타이머 모드 정의

export interface TimerMode {
  id: string;
  name: string;
  nameKo: string;
  icon: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number; // 긴 휴식 전 세션 수 (보통 4)
  description: string;
}

export const TIMER_MODES: TimerMode[] = [
  {
    id: "pomodoro",
    name: "Pomodoro",
    nameKo: "뽀모도로",
    icon: "🍅",
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    description: "25분 집중 + 5분 휴식",
  },
  {
    id: "deepwork",
    name: "Deep Work",
    nameKo: "딥워크",
    icon: "🧠",
    focusMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 30,
    sessionsBeforeLongBreak: 4,
    description: "50분 집중 + 10분 휴식",
  },
  {
    id: "animedoro",
    name: "Animedoro",
    nameKo: "애니메도로",
    icon: "🎬",
    focusMinutes: 40,
    shortBreakMinutes: 15,
    longBreakMinutes: 30,
    sessionsBeforeLongBreak: 4,
    description: "40분 집중 + 15분 휴식",
  },
  {
    id: "custom",
    name: "Custom",
    nameKo: "커스텀",
    icon: "⚙️",
    focusMinutes: 30, // 기본값
    shortBreakMinutes: 10,
    longBreakMinutes: 20,
    sessionsBeforeLongBreak: 4,
    description: "직접 설정",
  },
];

// 테스트용 빠른 모드 (개발 시)
export const TEST_MODE: TimerMode = {
  id: "test",
  name: "Test",
  nameKo: "테스트",
  icon: "🧪",
  focusMinutes: 0.33, // 20초
  shortBreakMinutes: 0.17, // 10초
  longBreakMinutes: 0.5, // 30초
  sessionsBeforeLongBreak: 2,
  description: "테스트용 (20초)",
};

// ID로 모드 찾기
export function getTimerModeById(id: string): TimerMode | undefined {
  if (id === "test") return TEST_MODE;
  return TIMER_MODES.find((mode) => mode.id === id);
}

// 기본 모드
export const DEFAULT_MODE = TIMER_MODES[0]; // 뽀모도로
