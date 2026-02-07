import { TimerDuration } from "@/types";

// 시간별 목표 거리 설정 (km)
export const DISTANCE_CONFIG: Record<
  TimerDuration,
  { maxDistance: number; journeyName: string }
> = {
  0.33: { maxDistance: 0.1, journeyName: "테스트 산책로" },
  1: { maxDistance: 0.5, journeyName: "숲 속 오솔길" },
  10: { maxDistance: 1.5, journeyName: "계곡 탐험로" },
  30: { maxDistance: 3, journeyName: "고대 숲 탐험" },
  60: { maxDistance: 5, journeyName: "신비의 숲 여정" },
};

/**
 * 진행률을 이동 거리로 변환
 * @param progress 0-100
 * @param selectedDuration 선택한 시간 (분)
 * @returns 현재 이동 거리 (km)
 */
export function calculateDistance(
  progress: number,
  selectedDuration: TimerDuration
): number {
  const config = DISTANCE_CONFIG[selectedDuration];
  return Math.round((progress / 100) * config.maxDistance * 10) / 10;
}

/**
 * 거리를 포맷팅된 문자열로 변환
 * @param distance 거리 (km)
 * @returns "1.5km" 형식
 */
export function formatDistance(distance: number): string {
  return `${distance.toFixed(1)}km`;
}

/**
 * 목표 거리 정보 가져오기
 */
export function getJourneyInfo(selectedDuration: TimerDuration) {
  return DISTANCE_CONFIG[selectedDuration];
}
