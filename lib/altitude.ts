import { TimerDuration } from "@/types";

// 시간별 목표 고도 설정
export const ALTITUDE_CONFIG: Record<
  TimerDuration,
  { maxAltitude: number; peakName: string }
> = {
  0.33: { maxAltitude: 100, peakName: "테스트 언덕" },
  1: { maxAltitude: 500, peakName: "작은 언덕" },
  10: { maxAltitude: 1500, peakName: "낮은 봉우리" },
  30: { maxAltitude: 3000, peakName: "설악산" },
  60: { maxAltitude: 5000, peakName: "백두산" },
};

// 체크포인트 고도 (진행률 기준)
export const ALTITUDE_CHECKPOINTS = [
  { percent: 33, label: "1차 캠프" },
  { percent: 66, label: "2차 캠프" },
  { percent: 100, label: "정상" },
];

/**
 * 진행률을 해발 고도로 변환
 * @param progress 0-100
 * @param selectedDuration 선택한 시간 (분)
 * @returns 현재 해발 고도 (m)
 */
export function calculateAltitude(
  progress: number,
  selectedDuration: TimerDuration
): number {
  const config = ALTITUDE_CONFIG[selectedDuration];
  return Math.round((progress / 100) * config.maxAltitude);
}

/**
 * 고도를 포맷팅된 문자열로 변환
 * @param altitude 고도 (m)
 * @returns "해발 1,234m" 형식
 */
export function formatAltitude(altitude: number): string {
  return `해발 ${altitude.toLocaleString()}m`;
}

/**
 * 목표 고도 정보 가져오기
 */
export function getPeakInfo(selectedDuration: TimerDuration) {
  return ALTITUDE_CONFIG[selectedDuration];
}

/**
 * 체크포인트 고도 계산
 */
export function getCheckpointAltitude(
  checkpointPercent: number,
  selectedDuration: TimerDuration
): number {
  const config = ALTITUDE_CONFIG[selectedDuration];
  return Math.round((checkpointPercent / 100) * config.maxAltitude);
}
