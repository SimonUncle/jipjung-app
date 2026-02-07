// 항구 해금 시스템

export interface PortUnlockTier {
  requiredMinutes: number;
  portIds: string[];
}

// 집중 시간에 따른 항구 해금 티어 (50% 감소된 조건)
export const PORT_UNLOCK_TIERS: PortUnlockTier[] = [
  { requiredMinutes: 0, portIds: ["busan", "osaka", "tokyo"] },
  { requiredMinutes: 15, portIds: ["shanghai", "hongkong"] },
  { requiredMinutes: 30, portIds: ["singapore", "bangkok"] },
  { requiredMinutes: 60, portIds: ["sydney", "auckland"] },
  { requiredMinutes: 90, portIds: ["honolulu", "sanfrancisco"] },
  { requiredMinutes: 150, portIds: ["losangeles", "vancouver"] },
  { requiredMinutes: 240, portIds: ["newyork", "miami"] },
  { requiredMinutes: 300, portIds: ["lisbon", "barcelona"] },
  { requiredMinutes: 450, portIds: ["marseille", "venice", "athens"] },
  { requiredMinutes: 600, portIds: ["istanbul", "amsterdam", "london"] },
  { requiredMinutes: 750, portIds: ["copenhagen", "dubai"] },
  { requiredMinutes: 1000, portIds: ["capetown", "rio", "buenosaires"] },
];

// 총 집중 시간에 따라 해금된 항구 ID 목록 반환
export function getUnlockedPortIds(totalMinutes: number): string[] {
  const unlocked: string[] = [];

  for (const tier of PORT_UNLOCK_TIERS) {
    if (totalMinutes >= tier.requiredMinutes) {
      unlocked.push(...tier.portIds);
    }
  }

  return unlocked;
}

// 새로 해금된 항구 ID 목록 반환
export function getNewlyUnlockedPorts(
  oldMinutes: number,
  newMinutes: number
): string[] {
  const oldUnlocked = getUnlockedPortIds(oldMinutes);
  const newUnlocked = getUnlockedPortIds(newMinutes);

  return newUnlocked.filter((id) => !oldUnlocked.includes(id));
}

// 다음 해금까지 남은 시간 정보
export function getNextUnlockInfo(totalMinutes: number): {
  nextTier: PortUnlockTier | null;
  minutesRemaining: number;
  progress: number;
} {
  // 현재 티어 찾기
  let currentTierIndex = -1;
  for (let i = PORT_UNLOCK_TIERS.length - 1; i >= 0; i--) {
    if (totalMinutes >= PORT_UNLOCK_TIERS[i].requiredMinutes) {
      currentTierIndex = i;
      break;
    }
  }

  // 다음 티어
  const nextTierIndex = currentTierIndex + 1;
  if (nextTierIndex >= PORT_UNLOCK_TIERS.length) {
    return { nextTier: null, minutesRemaining: 0, progress: 100 };
  }

  const nextTier = PORT_UNLOCK_TIERS[nextTierIndex];
  const currentTier = PORT_UNLOCK_TIERS[currentTierIndex];
  const previousRequired = currentTier?.requiredMinutes || 0;
  const minutesRemaining = nextTier.requiredMinutes - totalMinutes;
  const tierRange = nextTier.requiredMinutes - previousRequired;
  const tierProgress = totalMinutes - previousRequired;
  const progress = Math.min(100, (tierProgress / tierRange) * 100);

  return { nextTier, minutesRemaining, progress };
}

// 항구가 어느 티어에서 해금되는지 확인
export function getPortUnlockTier(portId: string): PortUnlockTier | undefined {
  return PORT_UNLOCK_TIERS.find((tier) => tier.portIds.includes(portId));
}

// 특정 항구가 해금되었는지 확인
export function isPortUnlocked(portId: string, totalMinutes: number): boolean {
  const tier = getPortUnlockTier(portId);
  if (!tier) return false;
  return totalMinutes >= tier.requiredMinutes;
}
