// 잠항 세션 관리 Store (핵심 잠항 로직만 담당)

import { create } from "zustand";
import { Port } from "@/lib/ports";
import { interpolatePosition, getDistanceBetween } from "@/lib/routes";
import { CabinType } from "@/types";

export type VoyageStatus = "idle" | "boarding" | "sailing" | "arriving" | "completed" | "failed";
export type ViewMode = "map" | "boat" | "split";

export interface StoredFocusPurpose {
  id: string;
  labelKo: string;
}

interface VoyageState {
  // 세션 상태
  status: VoyageStatus;

  // 출발/도착 항구
  departurePort: Port | null;
  arrivalPort: Port | null;

  // 잠항 정보
  selectedDuration: number; // 분
  restDuration: number; // 휴식 시간 (분)
  elapsedSeconds: number;
  distance: number; // km

  // 현재 위치 (지도용)
  currentPosition: { lat: number; lng: number } | null;

  // 이동 경로 히스토리 (추적 뷰용)
  positionHistory: { lat: number; lng: number }[];

  // 바다 경로 (육지 우회)
  seaRoute: { lat: number; lng: number }[];

  // 뷰 모드
  viewMode: ViewMode;

  // 객실 타입
  cabinType: CabinType;

  // 객실 번호
  cabinNumber: string | null;

  // 집중 목적
  focusPurpose: StoredFocusPurpose | null;
  customPurposeText: string | null;

  // 지도 줌 레벨
  mapZoom: number;

  // 일시정지
  isPaused: boolean;
  pauseUsed: boolean;

  // 액션
  selectRoute: (from: Port, to: Port, duration: number, restDuration: number, cabin?: CabinType) => void;
  setRestDuration: (minutes: number) => void;
  setCabinType: (cabin: CabinType) => void;
  setCabinNumber: (cabinNumber: string) => void;
  setFocusPurpose: (purpose: StoredFocusPurpose, customText?: string) => void;
  setMapZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  startVoyage: () => void;
  tick: () => void;
  togglePause: () => void;
  setViewMode: (mode: ViewMode) => void;
  completeVoyage: (onVisit?: (portId: string) => void) => void;
  failVoyage: () => void;
  resetVoyage: () => void;
  setSeaRoute: (route: { lat: number; lng: number }[]) => void;
}

export const useVoyageStore = create<VoyageState>((set, get) => ({
  // 초기 상태
  status: "idle",
  departurePort: null,
  arrivalPort: null,
  selectedDuration: 25,
  restDuration: 5,
  elapsedSeconds: 0,
  distance: 0,
  currentPosition: null,
  positionHistory: [],
  seaRoute: [],
  viewMode: "split",
  cabinType: "standard",
  cabinNumber: null,
  focusPurpose: null,
  customPurposeText: null,
  mapZoom: 5,
  isPaused: false,
  pauseUsed: false,

  // 항로 선택
  selectRoute: (from: Port, to: Port, duration: number, restDuration: number, cabin: CabinType = "standard") => {
    const distance = getDistanceBetween(from.id, to.id);
    set({
      departurePort: from,
      arrivalPort: to,
      selectedDuration: duration,
      restDuration,
      distance,
      status: "boarding",
      currentPosition: from.coordinates,
      cabinType: cabin,
    });
  },

  // 휴식 시간 설정
  setRestDuration: (minutes: number) => {
    set({ restDuration: Math.max(1, Math.min(60, minutes)) });
  },

  // 객실 타입 변경
  setCabinType: (cabin: CabinType) => {
    set({ cabinType: cabin });
  },

  // 객실 번호 설정
  setCabinNumber: (cabinNumber: string) => {
    set({ cabinNumber });
  },

  // 집중 목적 설정
  setFocusPurpose: (purpose: StoredFocusPurpose, customText?: string) => {
    set({
      focusPurpose: purpose,
      customPurposeText: purpose.id === "custom" ? customText ?? null : null,
    });
  },

  // 지도 줌 설정
  setMapZoom: (zoom: number) => {
    set({ mapZoom: Math.max(1, Math.min(18, zoom)) });
  },

  // 줌 인
  zoomIn: () => {
    const { mapZoom } = get();
    set({ mapZoom: Math.min(18, mapZoom + 1) });
  },

  // 줌 아웃
  zoomOut: () => {
    const { mapZoom } = get();
    set({ mapZoom: Math.max(1, mapZoom - 1) });
  },

  // 잠항 시작
  startVoyage: () => {
    const { departurePort, arrivalPort } = get();
    if (!departurePort || !arrivalPort) return;

    set({
      status: "sailing",
      elapsedSeconds: 0,
      isPaused: false,
      pauseUsed: false,
      positionHistory: [departurePort.coordinates],
    });
  },

  // 타이머 틱 (1초마다)
  tick: () => {
    const { status, isPaused, elapsedSeconds, selectedDuration, departurePort, arrivalPort, positionHistory, seaRoute } = get();

    if (status !== "sailing" || isPaused) return;

    const newElapsed = elapsedSeconds + 1;
    const totalSeconds = selectedDuration * 60;
    const progress = Math.min(100, (newElapsed / totalSeconds) * 100);

    // 현재 위치 계산 (바다 경로 사용)
    let newPosition: { lat: number; lng: number } | null = null;
    if (departurePort && arrivalPort) {
      newPosition = interpolatePosition(departurePort, arrivalPort, progress, seaRoute.length > 0 ? seaRoute : undefined);
    }

    // 위치 히스토리 업데이트 (5초마다 기록하여 메모리 절약)
    const shouldRecordPosition = newPosition !== null && newElapsed % 5 === 0;
    const newHistory: { lat: number; lng: number }[] = (shouldRecordPosition && newPosition)
      ? [...positionHistory, newPosition]
      : positionHistory;

    // 완료 체크
    if (newElapsed >= totalSeconds) {
      const finalHistory: { lat: number; lng: number }[] = newPosition !== null
        ? [...newHistory, newPosition]
        : newHistory;
      set({
        elapsedSeconds: totalSeconds,
        currentPosition: newPosition,
        positionHistory: finalHistory,
        status: "arriving",
      });
    } else {
      set({
        elapsedSeconds: newElapsed,
        currentPosition: newPosition,
        positionHistory: newHistory,
      });
    }
  },

  // 일시정지 토글
  togglePause: () => {
    const { isPaused, pauseUsed } = get();

    if (isPaused) {
      // 재개
      set({ isPaused: false });
    } else if (!pauseUsed) {
      // 첫 번째 일시정지만 허용
      set({ isPaused: true, pauseUsed: true });
    }
  },

  // 뷰 모드 변경
  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
  },

  // 잠항 완료
  completeVoyage: (onVisit?: (portId: string) => void) => {
    const { arrivalPort } = get();

    if (arrivalPort && onVisit) {
      onVisit(arrivalPort.id);
    }
    set({ status: "completed" });
  },

  // 잠항 실패 (탭 이탈 등)
  failVoyage: () => {
    set({ status: "failed" });
  },

  // 초기화
  resetVoyage: () => {
    set({
      status: "idle",
      departurePort: null,
      arrivalPort: null,
      elapsedSeconds: 0,
      restDuration: 5,
      distance: 0,
      currentPosition: null,
      positionHistory: [],
      seaRoute: [],
      isPaused: false,
      pauseUsed: false,
      cabinType: "standard",
      cabinNumber: null,
      focusPurpose: null,
      customPurposeText: null,
      mapZoom: 5,
    });
  },

  // 바다 경로 설정
  setSeaRoute: (route: { lat: number; lng: number }[]) => {
    set({ seaRoute: route });
  },
}));

// 파생값: 진행률 (0-100)
export function getProgress(state: VoyageState): number {
  const totalSeconds = state.selectedDuration * 60;
  if (totalSeconds === 0) return 0;
  return Math.min(100, (state.elapsedSeconds / totalSeconds) * 100);
}

// 파생값: 남은 시간 (초)
export function getRemainingSeconds(state: VoyageState): number {
  const totalSeconds = state.selectedDuration * 60;
  return Math.max(0, totalSeconds - state.elapsedSeconds);
}

// 파생값: 이동한 거리 (km)
export function getTraveledDistance(state: VoyageState): number {
  const progress = getProgress(state);
  return Math.round((state.distance * progress) / 100);
}

// 파생값: 남은 거리 (km)
export function getRemainingDistance(state: VoyageState): number {
  return state.distance - getTraveledDistance(state);
}

// 집중 시간에 따른 기본 휴식 시간 계산
export function calculateDefaultRestDuration(focusMinutes: number): number {
  if (focusMinutes < 30) {
    return 5; // 짧은 잠항: 5분 휴식
  } else if (focusMinutes <= 60) {
    return 10; // 중간 잠항: 10분 휴식
  } else {
    return 15; // 긴 잠항: 15분 휴식
  }
}

// 기존 호환성을 위한 re-exports
export type { BreakType } from "./timerStore";
