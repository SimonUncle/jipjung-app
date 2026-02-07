import { Gear } from "@/types";
import { GEARS } from "./constants";

export function getUnlockedGears(
  totalMinutes: number,
  alreadyUnlocked: string[]
): Gear[] {
  return GEARS.filter(
    (gear) =>
      gear.requiredMinutes <= totalMinutes &&
      alreadyUnlocked.includes(gear.id)
  );
}

export function getNewUnlocks(
  totalMinutes: number,
  alreadyUnlocked: string[]
): Gear[] {
  return GEARS.filter(
    (gear) =>
      gear.requiredMinutes <= totalMinutes &&
      !alreadyUnlocked.includes(gear.id)
  );
}

export function getNextUnlock(
  totalMinutes: number,
  alreadyUnlocked: string[]
): Gear | null {
  const locked = GEARS.filter((gear) => !alreadyUnlocked.includes(gear.id)).sort(
    (a, b) => a.requiredMinutes - b.requiredMinutes
  );

  return locked[0] || null;
}

export function getProgressToNextUnlock(
  totalMinutes: number,
  alreadyUnlocked: string[]
): { gear: Gear; progress: number } | null {
  const next = getNextUnlock(totalMinutes, alreadyUnlocked);
  if (!next) return null;

  const progress = Math.min(100, (totalMinutes / next.requiredMinutes) * 100);
  return { gear: next, progress };
}
