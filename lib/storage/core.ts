// 코어 스토리지 기능 - 읽기/쓰기/마이그레이션

import { ClimbFocusData } from "@/types";
import { DEFAULT_DATA, STORAGE_KEY, INITIAL_UNLOCKED_PORTS, getDefaultData } from "../constants";

// v2 -> v3 마이그레이션
function migrateData(data: ClimbFocusData): ClimbFocusData {
  if (data.version >= 3) return data;

  const migrated: ClimbFocusData = {
    ...data,
    version: 3,
    unlocks: {
      gears: data.unlocks?.gears || [],
      ports: data.unlocks?.ports || INITIAL_UNLOCKED_PORTS,
      achievements: data.unlocks?.achievements || [],
    },
    settings: {
      soundEnabled: data.settings?.soundEnabled ?? true,
      vibrationEnabled: data.settings?.vibrationEnabled ?? true,
      notificationsEnabled: data.settings?.notificationsEnabled ?? false,
      timeMode: (data.settings as { timeMode?: "voyage" | "realtime" | "manual" })?.timeMode ?? "voyage",
    },
    voyageHistory: data.voyageHistory || [],
    weeklyFocus: data.weeklyFocus || [],
    visitedPorts: data.visitedPorts || ["busan"],
  };

  return migrated;
}

export function getData(): ClimbFocusData {
  if (typeof window === "undefined") return DEFAULT_DATA;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultData = getDefaultData();
      saveData(defaultData);
      return defaultData;
    }
    const parsed = JSON.parse(raw) as ClimbFocusData;

    if (parsed.version < 3) {
      const migrated = migrateData(parsed);
      saveData(migrated);
      return migrated;
    }

    return parsed;
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: ClimbFocusData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data:", error);
  }
}

// 헬퍼: 오늘 날짜 문자열 (YYYY-MM-DD)
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}
