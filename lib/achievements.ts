// 업적 시스템

import { Achievement, ClimbFocusData } from "@/types";
import { PORTS } from "./ports";

// 지역별 항구 분류
export const PORT_REGIONS: Record<string, string[]> = {
  asia: ["busan", "osaka", "tokyo", "shanghai", "hongkong", "singapore", "bangkok"],
  oceania: ["sydney", "auckland"],
  northamerica: ["honolulu", "sanfrancisco", "losangeles", "vancouver", "newyork", "miami"],
  europe: ["lisbon", "barcelona", "marseille", "venice", "athens", "istanbul", "amsterdam", "london", "copenhagen"],
  middleeast: ["dubai"],
  africa: ["capetown"],
  southamerica: ["rio", "buenosaires"],
};

// 전체 업적 목록
export const ACHIEVEMENTS: Achievement[] = [
  // 항해 횟수
  {
    id: "first_voyage",
    name: "First Voyage",
    nameKo: "첫 항해",
    descriptionKo: "첫 번째 항해를 완료하세요",
    icon: "⛵",
    category: "voyage",
    condition: { type: "voyages", value: 1 },
  },
  {
    id: "navigator",
    name: "Navigator",
    nameKo: "항해사",
    descriptionKo: "항해 10회 완료",
    icon: "🧭",
    category: "voyage",
    condition: { type: "voyages", value: 10 },
  },
  {
    id: "captain",
    name: "Captain",
    nameKo: "선장",
    descriptionKo: "항해 50회 완료",
    icon: "👨‍✈️",
    category: "voyage",
    condition: { type: "voyages", value: 50 },
  },
  {
    id: "admiral",
    name: "Admiral",
    nameKo: "제독",
    descriptionKo: "항해 100회 완료",
    icon: "⚓",
    category: "voyage",
    condition: { type: "voyages", value: 100 },
  },

  // 집중 시간
  {
    id: "hour_focus",
    name: "Hour Focus",
    nameKo: "1시간 집중",
    descriptionKo: "총 1시간 집중",
    icon: "⏰",
    category: "focus",
    condition: { type: "focus_minutes", value: 60 },
  },
  {
    id: "day_focus",
    name: "Day Focus",
    nameKo: "24시간 집중",
    descriptionKo: "총 24시간 집중",
    icon: "📅",
    category: "focus",
    condition: { type: "focus_minutes", value: 1440 },
  },
  {
    id: "week_focus",
    name: "Week Focus",
    nameKo: "일주일 집중",
    descriptionKo: "총 168시간 집중",
    icon: "📆",
    category: "focus",
    condition: { type: "focus_minutes", value: 10080 },
  },

  // 탐험
  {
    id: "globe_trotter",
    name: "Globe Trotter",
    nameKo: "여행가",
    descriptionKo: "10개 항구 방문",
    icon: "🌍",
    category: "exploration",
    condition: { type: "ports_visited", value: 10 },
  },
  {
    id: "world_traveler",
    name: "World Traveler",
    nameKo: "세계일주",
    descriptionKo: "24개 항구 방문",
    icon: "🗺️",
    category: "exploration",
    condition: { type: "ports_visited", value: 24 },
  },

  // 연속
  {
    id: "streak_7",
    name: "Streak Master",
    nameKo: "7일 연속",
    descriptionKo: "7일 연속 항해",
    icon: "🔥",
    category: "streak",
    condition: { type: "streak", value: 7 },
  },
  {
    id: "streak_30",
    name: "Month Streak",
    nameKo: "30일 연속",
    descriptionKo: "30일 연속 항해",
    icon: "💎",
    category: "streak",
    condition: { type: "streak", value: 30 },
  },

  // 지역 정복
  {
    id: "asia_complete",
    name: "Asia Complete",
    nameKo: "아시아 정복",
    descriptionKo: "아시아 7개 항구 모두 방문",
    icon: "🏯",
    category: "exploration",
    condition: { type: "region", value: 1, region: "asia" },
  },
  {
    id: "europe_complete",
    name: "Europe Complete",
    nameKo: "유럽 정복",
    descriptionKo: "유럽 9개 항구 모두 방문",
    icon: "🏰",
    category: "exploration",
    condition: { type: "region", value: 1, region: "europe" },
  },
  {
    id: "americas_complete",
    name: "Americas Complete",
    nameKo: "아메리카 정복",
    descriptionKo: "북미 6개 항구 모두 방문",
    icon: "🗽",
    category: "exploration",
    condition: { type: "region", value: 1, region: "northamerica" },
  },
];

// 업적 ID로 업적 찾기
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// 지역의 모든 항구를 방문했는지 확인
function isRegionComplete(region: string, visitedPorts: string[]): boolean {
  const regionPorts = PORT_REGIONS[region];
  if (!regionPorts) return false;
  return regionPorts.every((portId) => visitedPorts.includes(portId));
}

// 업적 달성 조건 확인
export function checkAchievementCondition(
  achievement: Achievement,
  data: ClimbFocusData
): boolean {
  const { condition } = achievement;

  switch (condition.type) {
    case "voyages":
      return data.stats.completedSessions >= condition.value;

    case "focus_minutes":
      return data.stats.totalFocusMinutes >= condition.value;

    case "ports_visited":
      return data.visitedPorts.length >= condition.value;

    case "streak":
      return data.streak.longestStreak >= condition.value;

    case "region":
      if (!condition.region) return false;
      return isRegionComplete(condition.region, data.visitedPorts);

    default:
      return false;
  }
}

// 새로 달성한 업적 목록 반환
export function getNewlyUnlockedAchievements(
  data: ClimbFocusData
): Achievement[] {
  const unlockedIds = data.unlocks.achievements;
  const newAchievements: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // 이미 달성한 업적은 스킵
    if (unlockedIds.includes(achievement.id)) continue;

    // 조건 달성 확인
    if (checkAchievementCondition(achievement, data)) {
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}

// 업적 달성 진행률 계산
export function getAchievementProgress(
  achievement: Achievement,
  data: ClimbFocusData
): number {
  const { condition } = achievement;

  switch (condition.type) {
    case "voyages":
      return Math.min(100, (data.stats.completedSessions / condition.value) * 100);

    case "focus_minutes":
      return Math.min(100, (data.stats.totalFocusMinutes / condition.value) * 100);

    case "ports_visited":
      return Math.min(100, (data.visitedPorts.length / condition.value) * 100);

    case "streak":
      return Math.min(100, (data.streak.longestStreak / condition.value) * 100);

    case "region":
      if (!condition.region) return 0;
      const regionPorts = PORT_REGIONS[condition.region];
      if (!regionPorts) return 0;
      const visitedInRegion = regionPorts.filter((id) =>
        data.visitedPorts.includes(id)
      ).length;
      return Math.min(100, (visitedInRegion / regionPorts.length) * 100);

    default:
      return 0;
  }
}

// 카테고리별 업적 그룹화
export function getAchievementsByCategory(): Record<string, Achievement[]> {
  const grouped: Record<string, Achievement[]> = {
    voyage: [],
    focus: [],
    exploration: [],
    streak: [],
  };

  for (const achievement of ACHIEVEMENTS) {
    grouped[achievement.category].push(achievement);
  }

  return grouped;
}
