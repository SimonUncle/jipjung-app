// 설정 관련 업데이터

import { ClimbFocusData, TimeMode } from "@/types";
import { getData, saveData } from "./core";

/**
 * 사운드 토글
 */
export function toggleSound(): ClimbFocusData {
  const prev = getData();
  const updated: ClimbFocusData = {
    ...prev,
    settings: {
      ...prev.settings,
      soundEnabled: !prev.settings.soundEnabled,
    },
  };
  saveData(updated);
  return updated;
}

/**
 * 진동 토글
 */
export function toggleVibration(): ClimbFocusData {
  const prev = getData();
  const updated: ClimbFocusData = {
    ...prev,
    settings: {
      ...prev.settings,
      vibrationEnabled: !prev.settings.vibrationEnabled,
    },
  };
  saveData(updated);
  return updated;
}

/**
 * 알림 토글
 */
export function toggleNotifications(): ClimbFocusData {
  const prev = getData();
  const updated: ClimbFocusData = {
    ...prev,
    settings: {
      ...prev.settings,
      notificationsEnabled: !prev.settings.notificationsEnabled,
    },
  };
  saveData(updated);
  return updated;
}

/**
 * 목표 설정
 */
export function setGoals(dailyMinutes: number, weeklyMinutes: number): ClimbFocusData {
  const prev = getData();
  const updated: ClimbFocusData = {
    ...prev,
    goals: {
      dailyMinutes,
      weeklyMinutes,
    },
    lastActivity: new Date().toISOString(),
  };
  saveData(updated);
  return updated;
}

/**
 * 시간대 모드 설정
 */
export function setTimeMode(mode: TimeMode): ClimbFocusData {
  const prev = getData();
  const updated: ClimbFocusData = {
    ...prev,
    settings: {
      ...prev.settings,
      timeMode: mode,
    },
    lastActivity: new Date().toISOString(),
  };
  saveData(updated);
  return updated;
}
