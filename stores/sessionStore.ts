import { create } from "zustand";
import { SessionState, TimerDuration } from "@/types";
import { REST_DURATION_MINUTES } from "@/lib/constants";

export const useSessionStore = create<SessionState>((set, get) => ({
  status: "idle",
  selectedDuration: 1,
  remaining: 0,
  startedAt: null,
  passedCheckpoints: [],
  isPaused: false,
  pauseUsed: false,

  startSession: (duration: TimerDuration) => {
    set({
      status: "climbing",
      selectedDuration: duration,
      remaining: duration * 60,
      startedAt: Date.now(),
      passedCheckpoints: [],
      isPaused: false,
      pauseUsed: false,
    });
  },

  tick: () => {
    const { remaining, status, isPaused } = get();
    if (status !== "climbing" && status !== "resting") return;
    if (isPaused) return; // 일시정지 중에는 틱하지 않음

    if (remaining <= 1) {
      if (status === "climbing") {
        set({ remaining: 0, status: "completed" });
      } else {
        set({ remaining: 0, status: "idle" });
      }
    } else {
      set({ remaining: remaining - 1 });
    }
  },

  failSession: () => {
    set({
      status: "failed",
      remaining: 0,
      startedAt: null,
      isPaused: false,
    });
  },

  completeSession: () => {
    set({
      status: "completed",
      remaining: 0,
      isPaused: false,
    });
  },

  startRest: (customMinutes?: number) => {
    const minutes = customMinutes ?? REST_DURATION_MINUTES;
    set({
      status: "resting",
      remaining: minutes * 60,
      startedAt: Date.now(),
      isPaused: false,
      pauseUsed: false,
    });
  },

  resetSession: () => {
    set({
      status: "idle",
      selectedDuration: 1,
      remaining: 0,
      startedAt: null,
      passedCheckpoints: [],
      isPaused: false,
      pauseUsed: false,
    });
  },

  togglePause: () => {
    const { isPaused, pauseUsed, status } = get();
    if (status !== "climbing") return;

    if (isPaused) {
      // 일시정지 해제
      set({ isPaused: false });
    } else if (!pauseUsed) {
      // 일시정지 (1회만 가능)
      set({ isPaused: true, pauseUsed: true });
    }
  },
}));

// 진행률 계산 (0-100)
export function getProgress(state: SessionState): number {
  if (state.status !== "climbing") return 0;
  const total = state.selectedDuration * 60;
  const elapsed = total - state.remaining;
  return Math.min(100, (elapsed / total) * 100);
}
