// 타이머 모드 및 사이클 관리 Store

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TimerMode, getTimerModeById, DEFAULT_MODE } from "@/lib/timerModes";

export type BreakType = "short" | "long";

interface TimerState {
  // 타이머 모드
  timerMode: TimerMode;
  cycleCount: number; // 현재 사이클에서 완료한 세션 수 (0-3, 4가 되면 긴 휴식)
  nextBreakType: BreakType; // 다음 휴식 타입
  isAutoCycleEnabled: boolean; // 자동 반복 활성화 여부

  // 커스텀 모드 설정
  customFocusMinutes: number;
  customShortBreakMinutes: number;
  customLongBreakMinutes: number;

  // 액션
  setTimerMode: (modeId: string) => void;
  setCustomTimerSettings: (focus: number, shortBreak: number, longBreak: number) => void;
  setAutoCycleEnabled: (enabled: boolean) => void;
  incrementCycleCount: () => void;
  resetCycleCount: () => void;
  getBreakDuration: () => number;
  getFocusMinutes: () => number;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      timerMode: DEFAULT_MODE,
      cycleCount: 0,
      nextBreakType: "short",
      isAutoCycleEnabled: false,
      customFocusMinutes: 30,
      customShortBreakMinutes: 10,
      customLongBreakMinutes: 20,

      // 타이머 모드 설정
      setTimerMode: (modeId: string) => {
        const mode = getTimerModeById(modeId);
        if (mode) {
          set({ timerMode: mode });
        }
      },

      // 커스텀 타이머 설정
      setCustomTimerSettings: (focus: number, shortBreak: number, longBreak: number) => {
        set({
          customFocusMinutes: focus,
          customShortBreakMinutes: shortBreak,
          customLongBreakMinutes: longBreak,
        });
      },

      // 자동 사이클 활성화/비활성화
      setAutoCycleEnabled: (enabled: boolean) => {
        set({ isAutoCycleEnabled: enabled });
      },

      // 사이클 카운트 증가 (완료 시 호출)
      incrementCycleCount: () => {
        const { cycleCount, timerMode } = get();
        const newCount = cycleCount + 1;
        const isLongBreak = newCount >= timerMode.sessionsBeforeLongBreak;

        set({
          cycleCount: isLongBreak ? 0 : newCount,
          nextBreakType: isLongBreak ? "long" : "short",
        });
      },

      // 사이클 카운트 초기화
      resetCycleCount: () => {
        set({
          cycleCount: 0,
          nextBreakType: "short",
        });
      },

      // 휴식 시간 가져오기
      getBreakDuration: () => {
        const { timerMode, nextBreakType, customShortBreakMinutes, customLongBreakMinutes } = get();

        if (timerMode.id === "custom") {
          return nextBreakType === "long" ? customLongBreakMinutes : customShortBreakMinutes;
        }

        return nextBreakType === "long" ? timerMode.longBreakMinutes : timerMode.shortBreakMinutes;
      },

      // 현재 모드의 집중 시간 가져오기
      getFocusMinutes: () => {
        const { timerMode, customFocusMinutes } = get();
        return timerMode.id === "custom" ? customFocusMinutes : timerMode.focusMinutes;
      },
    }),
    {
      name: "timer-storage",
      partialize: (state) => ({
        timerMode: state.timerMode,
        isAutoCycleEnabled: state.isAutoCycleEnabled,
        customFocusMinutes: state.customFocusMinutes,
        customShortBreakMinutes: state.customShortBreakMinutes,
        customLongBreakMinutes: state.customLongBreakMinutes,
      }),
    }
  )
);
