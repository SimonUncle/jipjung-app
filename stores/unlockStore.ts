// 항구 해금 및 방문 기록 Store

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getData } from "@/lib/storage";

// 초기 해금 항구
const INITIAL_UNLOCKED_PORTS = ["busan", "osaka", "tokyo"];
const INITIAL_VISITED_PORTS = ["busan"];

interface UnlockState {
  // 해금된 항구 ID 목록
  unlockedPorts: string[];

  // 방문 기록 (스탬프)
  visitedPorts: string[];

  // 액션
  unlockPort: (portId: string) => void;
  addVisitedPort: (portId: string) => void;
  setUnlockedPorts: (ports: string[]) => void;
  setVisitedPorts: (ports: string[]) => void;
  initFromStorage: () => void;
  isPortUnlocked: (portId: string) => boolean;
  isPortVisited: (portId: string) => boolean;
}

export const useUnlockStore = create<UnlockState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      unlockedPorts: INITIAL_UNLOCKED_PORTS,
      visitedPorts: INITIAL_VISITED_PORTS,

      // 항구 해금
      unlockPort: (portId: string) => {
        const { unlockedPorts } = get();
        if (!unlockedPorts.includes(portId)) {
          set({ unlockedPorts: [...unlockedPorts, portId] });
        }
      },

      // 방문 기록 추가
      addVisitedPort: (portId: string) => {
        const { visitedPorts } = get();
        if (!visitedPorts.includes(portId)) {
          set({ visitedPorts: [...visitedPorts, portId] });
        }
      },

      // 해금된 항구 설정
      setUnlockedPorts: (ports: string[]) => {
        set({ unlockedPorts: ports });
      },

      // 방문한 항구 설정
      setVisitedPorts: (ports: string[]) => {
        set({ visitedPorts: ports });
      },

      // localStorage에서 상태 동기화 (기존 데이터 마이그레이션용)
      initFromStorage: () => {
        if (typeof window === "undefined") return;
        const data = getData();
        set({
          unlockedPorts: data.unlocks?.ports || INITIAL_UNLOCKED_PORTS,
          visitedPorts: data.visitedPorts || INITIAL_VISITED_PORTS,
        });
      },

      // 헬퍼: 항구가 해금되었는지 확인
      isPortUnlocked: (portId: string) => {
        return get().unlockedPorts.includes(portId);
      },

      // 헬퍼: 항구를 방문했는지 확인
      isPortVisited: (portId: string) => {
        return get().visitedPorts.includes(portId);
      },
    }),
    {
      name: "unlock-storage",
      partialize: (state) => ({
        unlockedPorts: state.unlockedPorts,
        visitedPorts: state.visitedPorts,
      }),
    }
  )
);
