// 잠수함 이벤트 엔진 — 타입, 이벤트 카탈로그, 수치 계산

// --- 잠항 페이즈 ---
export type JourneyPhase = "departure" | "open_ocean" | "arrival";

export function getPhase(progress: number): JourneyPhase {
  if (progress <= 15) return "departure";
  if (progress >= 85) return "arrival";
  return "open_ocean";
}

// --- 이벤트 타입 ---
export type EventScope = "map" | "periscope" | "underwater" | "all";

export interface SubmarineEvent {
  id: string;
  type: string;
  titleKo: string;
  icon: string;
  scope: EventScope;
  minProgress: number;
  maxProgress: number;
  duration: number; // progress 단위 (1 progress = 500ms)
  priority: number; // 1=흔함, 5=레어
  phaseAffinity?: JourneyPhase[];
}

export interface ActiveEvent {
  event: SubmarineEvent;
  startedAt: number;
  expiresAt: number;
  data: { x: number; y: number; size: number };
}

export interface SubmarineAlert {
  id: string;
  message: string;
  icon: string;
  timestamp: number;
}

// --- 이벤트 카탈로그 (16종) ---
export const EVENT_CATALOG: SubmarineEvent[] = [
  // 마일스톤
  { id: "departure_horn", type: "departure", titleKo: "출항합니다!", icon: "🚀", scope: "all", minProgress: 0, maxProgress: 3, duration: 5, priority: 1 },
  { id: "halfway", type: "halfway", titleKo: "잠항 절반 완료", icon: "⚓", scope: "all", minProgress: 48, maxProgress: 52, duration: 5, priority: 1 },
  { id: "approaching_dest", type: "approaching", titleKo: "목적지 근접", icon: "🏁", scope: "all", minProgress: 90, maxProgress: 95, duration: 8, priority: 1 },

  // 잠망경
  { id: "storm_approach", type: "storm", titleKo: "폭풍 접근 중", icon: "🌊", scope: "periscope", minProgress: 20, maxProgress: 80, duration: 15, priority: 3, phaseAffinity: ["open_ocean"] },
  { id: "sunset", type: "sunset", titleKo: "석양이 지고 있다", icon: "🌅", scope: "periscope", minProgress: 40, maxProgress: 70, duration: 20, priority: 2, phaseAffinity: ["open_ocean"] },
  { id: "cargo_ship", type: "cargo_ship", titleKo: "대형 화물선 통과", icon: "🤿", scope: "periscope", minProgress: 5, maxProgress: 95, duration: 12, priority: 1, phaseAffinity: ["departure", "arrival"] },
  { id: "land_sighting", type: "land_sighting", titleKo: "육지 발견!", icon: "🏝️", scope: "periscope", minProgress: 80, maxProgress: 100, duration: 20, priority: 3, phaseAffinity: ["arrival"] },

  // 해저
  { id: "deep_trench", type: "deep_trench", titleKo: "해구 통과 중...", icon: "🕳️", scope: "underwater", minProgress: 30, maxProgress: 70, duration: 20, priority: 4, phaseAffinity: ["open_ocean"] },
  { id: "underwater_volcano", type: "volcano_glow", titleKo: "해저 화산 감지!", icon: "🌋", scope: "underwater", minProgress: 35, maxProgress: 65, duration: 15, priority: 5, phaseAffinity: ["open_ocean"] },
  { id: "ancient_ruins", type: "ruins", titleKo: "고대 유적 발견", icon: "🏛️", scope: "underwater", minProgress: 40, maxProgress: 60, duration: 18, priority: 5, phaseAffinity: ["open_ocean"] },
  { id: "submarine_cable", type: "cable", titleKo: "해저 케이블 통과", icon: "🔌", scope: "underwater", minProgress: 10, maxProgress: 90, duration: 8, priority: 1, phaseAffinity: ["departure", "arrival"] },
  { id: "giant_squid", type: "giant_squid", titleKo: "대왕 오징어 접근!", icon: "🦑", scope: "underwater", minProgress: 35, maxProgress: 65, duration: 10, priority: 5, phaseAffinity: ["open_ocean"] },
  { id: "jellyfish_bloom", type: "jellyfish_bloom", titleKo: "해파리 무리 통과", icon: "🪸", scope: "underwater", minProgress: 15, maxProgress: 85, duration: 12, priority: 2 },

  // 양쪽 뷰
  { id: "whale_breach", type: "whale_breach", titleKo: "고래 발견!", icon: "🐋", scope: "all", minProgress: 20, maxProgress: 80, duration: 8, priority: 4, phaseAffinity: ["open_ocean"] },
  { id: "dolphin_pod", type: "dolphin_pod", titleKo: "돌고래 떼와 조우", icon: "🐬", scope: "all", minProgress: 10, maxProgress: 90, duration: 10, priority: 2 },

  // 지도
  { id: "sonar_large_contact", type: "sonar_contact", titleKo: "대형 소나 반응!", icon: "📡", scope: "map", minProgress: 15, maxProgress: 85, duration: 10, priority: 3 },
];

// --- 수심 계산 ---
export function calculateDepth(progress: number): number {
  const phase = getPhase(progress);
  let baseDepth: number;

  if (phase === "departure") {
    baseDepth = 50 + (progress / 15) * 150;
  } else if (phase === "arrival") {
    baseDepth = 200 - ((progress - 85) / 15) * 150;
  } else {
    const oceanProgress = (progress - 15) / 70;
    baseDepth = 200 + Math.sin(oceanProgress * Math.PI) * 150;
  }

  const wobble = Math.sin(progress * 0.7) * 15 + Math.cos(progress * 1.3) * 10;
  return Math.round(Math.max(30, baseDepth + wobble));
}

// --- 속도 계산 ---
export function calculateSpeed(progress: number, isPaused: boolean): number {
  if (isPaused) return 0;
  const phase = getPhase(progress);
  if (phase === "departure") return 8 + Math.round(progress * 0.4);
  if (phase === "arrival") return 14 - Math.round((progress - 85) * 0.5);
  return Math.round(12 + Math.sin(progress * 0.2) * 4);
}

// --- 산소 게이지 ---
export function calculateOxygen(progress: number): number {
  return Math.max(60, Math.round(100 - progress * 0.35 + Math.sin(progress * 0.1) * 5));
}

// --- 배터리 게이지 ---
export function calculateBattery(progress: number): number {
  return Math.max(45, Math.round(100 - progress * 0.5 + Math.cos(progress * 0.15) * 3));
}

// --- seeded random (deterministic) ---
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}
