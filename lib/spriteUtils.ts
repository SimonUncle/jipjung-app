/**
 * SVG 스프라이트 baseline 계산 유틸리티
 *
 * SVG 스프라이트에서 가장 아래쪽 픽셀 위치를 분석하여
 * 캐릭터를 지면에 정확히 배치하기 위한 offset을 계산합니다.
 */

export interface RectElement {
  y: number;
  height: number;
}

/**
 * SVG viewBox 내에서 가장 아래쪽 픽셀의 위치를 계산
 *
 * @param viewBoxHeight - SVG viewBox의 높이
 * @param elements - 렌더링되는 rect 요소들의 y, height 정보
 * @returns baselineOffset (viewBox 바닥에서 실제 픽셀까지의 거리, 0이면 바닥에 닿음)
 */
export function calculateBaselineOffset(
  viewBoxHeight: number,
  elements: RectElement[]
): number {
  if (elements.length === 0) return 0;

  // 가장 아래쪽에 있는 픽셀의 y 좌표 (y + height의 최대값)
  const maxBottom = Math.max(...elements.map((el) => el.y + el.height));

  // viewBox 바닥과의 차이
  return viewBoxHeight - maxBottom;
}

/**
 * 픽셀 스케일을 적용한 baseline offset 반환
 *
 * @param viewBoxHeight - SVG viewBox의 높이
 * @param elements - 렌더링되는 rect 요소들의 y, height 정보
 * @param scale - 픽셀 스케일 배율 (예: PX = 4)
 * @returns 스케일이 적용된 baselineOffset (px 단위)
 */
export function getScaledBaselineOffset(
  viewBoxHeight: number,
  elements: RectElement[],
  scale: number
): number {
  return calculateBaselineOffset(viewBoxHeight, elements) * scale;
}
