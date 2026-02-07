// 해금 관련 업데이터

import { ClimbFocusData, VoyageTicket } from "@/types";
import { getData, saveData } from "./core";
import { getUnlockedPortIds } from "../portUnlocks";

/**
 * 장비 해금 추가
 */
export function addGear(gearId: string): ClimbFocusData {
  const prev = getData();
  if (prev.unlocks.gears.includes(gearId)) return prev;

  const updated: ClimbFocusData = {
    ...prev,
    unlocks: {
      ...prev.unlocks,
      gears: [...prev.unlocks.gears, gearId],
    },
    lastActivity: new Date().toISOString(),
  };
  saveData(updated);
  return updated;
}

/**
 * 업적 추가
 */
export function addAchievement(achievementId: string): ClimbFocusData {
  const prev = getData();
  if (prev.unlocks.achievements.includes(achievementId)) return prev;

  const updated: ClimbFocusData = {
    ...prev,
    unlocks: {
      ...prev.unlocks,
      achievements: [...prev.unlocks.achievements, achievementId],
    },
    lastActivity: new Date().toISOString(),
  };
  saveData(updated);
  return updated;
}

/**
 * 업적 일괄 추가
 */
export function addAchievements(achievementIds: string[]): ClimbFocusData {
  const prev = getData();
  const newIds = achievementIds.filter(
    (id) => !prev.unlocks.achievements.includes(id)
  );
  if (newIds.length === 0) return prev;

  const updated: ClimbFocusData = {
    ...prev,
    unlocks: {
      ...prev.unlocks,
      achievements: [...prev.unlocks.achievements, ...newIds],
    },
    lastActivity: new Date().toISOString(),
  };
  saveData(updated);
  return updated;
}

/**
 * 항구 해금 업데이트 (집중 시간 기반)
 */
export function updatePortUnlocks(totalMinutes: number): ClimbFocusData {
  const prev = getData();
  const newUnlockedPorts = getUnlockedPortIds(totalMinutes);

  if (
    newUnlockedPorts.length === prev.unlocks.ports.length &&
    newUnlockedPorts.every((id) => prev.unlocks.ports.includes(id))
  ) {
    return prev;
  }

  const updated: ClimbFocusData = {
    ...prev,
    unlocks: {
      ...prev.unlocks,
      ports: newUnlockedPorts,
    },
    lastActivity: new Date().toISOString(),
  };
  saveData(updated);
  return updated;
}

/**
 * 방문 항구 추가
 */
export function addVisitedPort(portId: string): ClimbFocusData {
  const prev = getData();
  if (prev.visitedPorts.includes(portId)) return prev;

  const updated: ClimbFocusData = {
    ...prev,
    visitedPorts: [...prev.visitedPorts, portId],
    lastActivity: new Date().toISOString(),
  };
  saveData(updated);
  return updated;
}

/**
 * 항해 티켓 추가
 */
export function addVoyageTicket(ticket: VoyageTicket): ClimbFocusData {
  const prev = getData();
  const updated: ClimbFocusData = {
    ...prev,
    voyageHistory: [...prev.voyageHistory, ticket],
    lastActivity: new Date().toISOString(),
  };
  saveData(updated);
  return updated;
}
