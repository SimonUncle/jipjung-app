// 여정 구간 정의

export type SegmentMode = "horizontal" | "vertical" | "transition";

export type SegmentTheme =
  | "forest"
  | "temple-entrance"
  | "temple-stairs"
  | "temple-exit"
  | "desert"
  | "cave-entrance"
  | "cave"
  | "snow"
  | "peak";

export interface Segment {
  id: string;
  startPercent: number;
  endPercent: number;
  mode: SegmentMode;
  theme: SegmentTheme;
  label: string;
  emoji: string;
}

export const SEGMENTS: Segment[] = [
  // 숲길 (0-15%)
  {
    id: "forest",
    startPercent: 0,
    endPercent: 15,
    mode: "horizontal",
    theme: "forest",
    label: "숲길",
    emoji: "🌲",
  },
  // 신전 입구 (15-18%)
  {
    id: "temple-enter",
    startPercent: 15,
    endPercent: 18,
    mode: "transition",
    theme: "temple-entrance",
    label: "신전 입구",
    emoji: "🏛️",
  },
  // 신전 계단 (18-32%)
  {
    id: "temple-stairs",
    startPercent: 18,
    endPercent: 32,
    mode: "vertical",
    theme: "temple-stairs",
    label: "신전 계단",
    emoji: "⬆️",
  },
  // 신전 출구 (32-35%)
  {
    id: "temple-exit",
    startPercent: 32,
    endPercent: 35,
    mode: "transition",
    theme: "temple-exit",
    label: "신전 출구",
    emoji: "🚪",
  },
  // 사막 (35-52%)
  {
    id: "desert",
    startPercent: 35,
    endPercent: 52,
    mode: "horizontal",
    theme: "desert",
    label: "사막길",
    emoji: "🏜️",
  },
  // 동굴 입구 (52-55%)
  {
    id: "cave-enter",
    startPercent: 52,
    endPercent: 55,
    mode: "transition",
    theme: "cave-entrance",
    label: "동굴 입구",
    emoji: "🕳️",
  },
  // 동굴 내부 (55-72%)
  {
    id: "cave",
    startPercent: 55,
    endPercent: 72,
    mode: "horizontal",
    theme: "cave",
    label: "동굴",
    emoji: "🦇",
  },
  // 설원 (72-90%)
  {
    id: "snow",
    startPercent: 72,
    endPercent: 90,
    mode: "horizontal",
    theme: "snow",
    label: "설원",
    emoji: "❄️",
  },
  // 정상 (90-100%)
  {
    id: "peak",
    startPercent: 90,
    endPercent: 100,
    mode: "horizontal",
    theme: "peak",
    label: "정상",
    emoji: "🌟",
  },
];

export function getCurrentSegment(progress: number): Segment {
  const segment = SEGMENTS.find(
    (s) => progress >= s.startPercent && progress < s.endPercent
  );
  return segment || SEGMENTS[SEGMENTS.length - 1];
}

export function getSegmentProgress(progress: number, segment: Segment): number {
  // 현재 구간 내에서의 진행률 (0-100)
  const range = segment.endPercent - segment.startPercent;
  const localProgress = progress - segment.startPercent;
  return Math.min(100, Math.max(0, (localProgress / range) * 100));
}
