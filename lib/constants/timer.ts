// 타이머 모드 관련 상수

export const TIMER_PRESETS = {
  POMODORO: {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsBeforeLongBreak: 4,
  },
  DEEP_WORK: {
    focus: 50,
    shortBreak: 10,
    longBreak: 30,
    sessionsBeforeLongBreak: 2,
  },
  QUICK_FOCUS: {
    focus: 15,
    shortBreak: 3,
    longBreak: 10,
    sessionsBeforeLongBreak: 4,
  },
} as const;

export const TIMER_LIMITS = {
  // 커스텀 설정 제한
  MIN_FOCUS_MINUTES: 1,
  MAX_FOCUS_MINUTES: 120,
  MIN_BREAK_MINUTES: 1,
  MAX_SHORT_BREAK_MINUTES: 30,
  MAX_LONG_BREAK_MINUTES: 60,
} as const;

// 애니메이션 타이밍 (밀리초)
export const ANIMATION_TIMINGS = {
  MODAL_ENTER: 300,
  MODAL_EXIT: 200,
  TRANSITION: 300,
  SHIP_HORN_DELAY: 1500,
  ACHIEVEMENT_SHOW_DELAY: 100,
  STAMP_ANIMATION_DELAY: 500,
} as const;
