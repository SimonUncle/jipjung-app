export interface Level {
  id: string;
  theme: string;
  width: number; // 레벨 너비 (world 좌표)
  mode: "horizontal" | "vertical";
  label: string;
  emoji: string;
}

export const LEVELS: Level[] = [
  {
    id: "forest",
    theme: "forest",
    width: 1000,
    mode: "horizontal",
    label: "숲길",
    emoji: "🌲",
  },
  {
    id: "temple-entrance",
    theme: "temple-entrance",
    width: 300,
    mode: "horizontal",
    label: "신전 입구",
    emoji: "🏛️",
  },
  {
    id: "temple-interior",
    theme: "temple-interior",
    width: 800,
    mode: "horizontal",
    label: "신전 내부",
    emoji: "🏛️",
  },
  {
    id: "temple-exit",
    theme: "temple-exit",
    width: 300,
    mode: "horizontal",
    label: "신전 출구",
    emoji: "🚪",
  },
  {
    id: "desert",
    theme: "desert",
    width: 1200,
    mode: "horizontal",
    label: "사막길",
    emoji: "🏜️",
  },
  {
    id: "cave-entrance",
    theme: "cave-entrance",
    width: 300,
    mode: "horizontal",
    label: "동굴 입구",
    emoji: "🕳️",
  },
  {
    id: "cave",
    theme: "cave",
    width: 1000,
    mode: "horizontal",
    label: "동굴",
    emoji: "🦇",
  },
  {
    id: "snow",
    theme: "snow",
    width: 1200,
    mode: "horizontal",
    label: "설원",
    emoji: "❄️",
  },
  {
    id: "peak",
    theme: "peak",
    width: 600,
    mode: "horizontal",
    label: "정상",
    emoji: "🌟",
  },
];

export function getCurrentLevel(levelIndex: number): Level {
  return LEVELS[Math.min(levelIndex, LEVELS.length - 1)];
}

export function getTotalWorldWidth(): number {
  return LEVELS.reduce((sum, level) => sum + level.width, 0);
}

// 초당 이동 속도 계산 (전체 레벨을 duration 내에 완료하기 위해)
export function calculateMoveSpeed(durationMinutes: number): number {
  const totalWidth = getTotalWorldWidth();
  const totalSeconds = durationMinutes * 60;
  return totalWidth / totalSeconds;
}
