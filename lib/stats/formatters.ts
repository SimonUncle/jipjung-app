// 시간 관련 포맷팅 유틸리티

/**
 * 분을 읽기 쉬운 시간 문자열로 변환
 * @example formatMinutesToTime(90) // "1시간 30분"
 * @example formatMinutesToTime(30) // "30분"
 */
export function formatMinutesToTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${mins}분`;
}

/**
 * 초를 MM:SS 형식으로 변환
 * @example formatSecondsToMMSS(90) // "01:30"
 */
export function formatSecondsToMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 숫자를 천단위 콤마 포함 문자열로 변환
 * @example formatNumberWithCommas(1234567) // "1,234,567"
 */
export function formatNumberWithCommas(num: number): string {
  return num.toLocaleString("ko-KR");
}

/**
 * 퍼센트 계산
 * @example calculatePercentage(30, 100) // 30
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
