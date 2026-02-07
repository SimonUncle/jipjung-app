import { create } from "zustand";
import { LEVELS, getCurrentLevel, getTotalWorldWidth } from "@/lib/levels";

const EXIT_MARGIN = 50; // 맵 끝 여유 거리
const CAMERA_OFFSET = 0.35; // 카메라가 플레이어 위치의 35% 앞에
const SAFE_SPAWN_OFFSET = 20; // 안전 스폰 오프셋 (경계에서 20px 안쪽)
const TRANSITION_COOLDOWN = 400; // 전환 쿨다운 (ms)

interface WorldState {
  // 플레이어 좌표 (world 기준)
  worldX: number;
  worldY: number;

  // 현재 레벨 정보
  currentLevelIndex: number;

  // 카메라 (계산된 값)
  cameraX: number;

  // 스크린 크기
  screenWidth: number;

  // 전환 락
  isTransitioning: boolean;
  lastTransitionTime: number;

  // 액션
  movePlayer: (deltaX: number) => void;
  setScreenWidth: (width: number) => void;
  resetWorld: () => void;
}

export const useWorldStore = create<WorldState>((set, get) => ({
  worldX: 0,
  worldY: 0,
  currentLevelIndex: 0,
  cameraX: 0,
  screenWidth: 400,
  isTransitioning: false,
  lastTransitionTime: 0,

  movePlayer: (deltaX: number) => {
    const {
      worldX,
      currentLevelIndex,
      screenWidth,
      isTransitioning,
      lastTransitionTime,
    } = get();

    // 전환 중이면 무시
    if (isTransitioning) {
      return;
    }

    const now = Date.now();
    const currentLevel = getCurrentLevel(currentLevelIndex);
    const levelWidth = currentLevel.width;

    // 쿨다운 체크: 쿨다운 중에는 일반 이동만 (전환 불가)
    if (now - lastTransitionTime < TRANSITION_COOLDOWN) {
      const clampedX = Math.max(
        0,
        Math.min(worldX + deltaX, levelWidth - EXIT_MARGIN)
      );

      const targetCameraX = clampedX - screenWidth * CAMERA_OFFSET;
      const newCameraX = Math.max(
        0,
        Math.min(targetCameraX, levelWidth - screenWidth)
      );

      set({ worldX: clampedX, cameraX: newCameraX });
      return;
    }

    let newWorldX = Math.max(0, worldX + deltaX);
    let newLevelIndex = currentLevelIndex;
    let newCameraX: number;

    // 맵 끝 도달 체크 (worldX 기준으로만!)
    if (newWorldX >= levelWidth - EXIT_MARGIN) {
      if (currentLevelIndex < LEVELS.length - 1) {
        // 전환 락 설정
        set({ isTransitioning: true });

        // 다음 레벨로 전환
        newLevelIndex = currentLevelIndex + 1;
        newWorldX = SAFE_SPAWN_OFFSET; // 0이 아닌 안전 위치

        // 카메라를 음수로 설정하여 캐릭터가 왼쪽~중간에서 시작
        // screenX = worldX - cameraX = 20 - (-140) = 160px
        newCameraX = -(screenWidth * CAMERA_OFFSET);

        set({
          worldX: newWorldX,
          currentLevelIndex: newLevelIndex,
          cameraX: newCameraX,
          lastTransitionTime: now,
        });

        // 짧은 딜레이 후 전환 락 해제
        setTimeout(() => {
          set({ isTransitioning: false });
        }, 200);

        return;
      } else {
        // 마지막 레벨 - 끝에서 멈춤
        newWorldX = levelWidth - EXIT_MARGIN;
      }
    }

    // 일반 이동: 카메라 계산
    const newLevel = getCurrentLevel(newLevelIndex);
    const targetCameraX = newWorldX - screenWidth * CAMERA_OFFSET;
    newCameraX = Math.max(
      0,
      Math.min(targetCameraX, newLevel.width - screenWidth)
    );

    set({
      worldX: newWorldX,
      currentLevelIndex: newLevelIndex,
      cameraX: newCameraX,
    });
  },

  setScreenWidth: (width: number) => {
    set({ screenWidth: width });
  },

  resetWorld: () => {
    set({
      worldX: 0,
      worldY: 0,
      currentLevelIndex: 0,
      cameraX: 0,
      isTransitioning: false,
      lastTransitionTime: 0,
    });
  },
}));

// 파생값: stageProgress (현재 레벨 내 진행률 0-100)
export function getStageProgress(state: WorldState): number {
  const level = getCurrentLevel(state.currentLevelIndex);
  return Math.min(100, (state.worldX / level.width) * 100);
}

// 파생값: screenX (렌더링용)
export function getScreenX(state: WorldState): number {
  return state.worldX - state.cameraX;
}

// 파생값: 전체 진행률 (모든 레벨 합산)
export function getTotalProgress(state: WorldState): number {
  const totalWidth = getTotalWorldWidth();
  let completedWidth = 0;

  // 이전 레벨들의 너비 합산
  for (let i = 0; i < state.currentLevelIndex; i++) {
    completedWidth += LEVELS[i].width;
  }

  // 현재 레벨 내 진행 거리 추가
  completedWidth += state.worldX;

  return Math.min(100, (completedWidth / totalWidth) * 100);
}
