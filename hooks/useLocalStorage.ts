"use client";

import { useState, useEffect, useCallback } from "react";
import { ClimbFocusData, VoyageTicket, DailyFocusRecord, TimeMode } from "@/types";
import { DEFAULT_DATA } from "@/lib/constants";
import { getNewlyUnlockedAchievements } from "@/lib/achievements";
import { getNewlyUnlockedPorts } from "@/lib/portUnlocks";
import {
  getData,
  saveData,
  recordComplete as storageRecordComplete,
  recordFail as storageRecordFail,
  updateStats as storageUpdateStats,
  updateWeeklyFocus as storageUpdateWeeklyFocus,
  addGear as storageAddGear,
  addAchievement as storageAddAchievement,
  addAchievements as storageAddAchievements,
  updatePortUnlocks as storageUpdatePortUnlocks,
  addVisitedPort as storageAddVisitedPort,
  addVoyageTicket as storageAddVoyageTicket,
  toggleSound as storageToggleSound,
  toggleVibration as storageToggleVibration,
  toggleNotifications as storageToggleNotifications,
  setGoals as storageSetGoals,
  setTimeMode as storageSetTimeMode,
} from "@/lib/storage";

export function useLocalStorage() {
  const [data, setData] = useState<ClimbFocusData>(DEFAULT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기 로드
  useEffect(() => {
    const stored = getData();
    setData(stored);
    setIsLoaded(true);
  }, []);

  // 데이터 업데이트 헬퍼
  const updateData = useCallback((update: Partial<ClimbFocusData>) => {
    setData((prev) => {
      const updated = { ...prev, ...update };
      saveData(updated);
      return updated;
    });
  }, []);

  // 통계 업데이트
  const updateStats = useCallback(
    (update: Partial<ClimbFocusData["stats"]>) => {
      const updated = storageUpdateStats(update);
      setData(updated);
    },
    []
  );

  // 장비 해금
  const addGear = useCallback((gearId: string) => {
    const updated = storageAddGear(gearId);
    setData(updated);
  }, []);

  // 세션 완료 기록
  const recordComplete = useCallback((durationMinutes: number) => {
    const updated = storageRecordComplete(durationMinutes);
    setData(updated);
  }, []);

  // 세션 실패 기록
  const recordFail = useCallback(() => {
    const updated = storageRecordFail();
    setData(updated);
  }, []);

  // 사운드 토글
  const toggleSound = useCallback(() => {
    const updated = storageToggleSound();
    setData(updated);
  }, []);

  // 진동 토글
  const toggleVibration = useCallback(() => {
    const updated = storageToggleVibration();
    setData(updated);
  }, []);

  // 알림 토글
  const toggleNotifications = useCallback(() => {
    const updated = storageToggleNotifications();
    setData(updated);
  }, []);

  // 잠항 티켓 추가
  const addVoyageTicket = useCallback((ticket: VoyageTicket) => {
    const updated = storageAddVoyageTicket(ticket);
    setData(updated);
  }, []);

  // 방문 항구 추가
  const addVisitedPort = useCallback((portId: string) => {
    const updated = storageAddVisitedPort(portId);
    setData(updated);
  }, []);

  // 항구 해금 업데이트
  const updatePortUnlocks = useCallback((totalMinutes: number) => {
    const updated = storageUpdatePortUnlocks(totalMinutes);
    setData(updated);
  }, []);

  // 업적 추가
  const addAchievement = useCallback((achievementId: string) => {
    const updated = storageAddAchievement(achievementId);
    setData(updated);
  }, []);

  // 업적 일괄 추가
  const addAchievements = useCallback((achievementIds: string[]) => {
    const updated = storageAddAchievements(achievementIds);
    setData(updated);
  }, []);

  // 주간 집중 기록 업데이트
  const updateWeeklyFocus = useCallback((record: DailyFocusRecord) => {
    const updated = storageUpdateWeeklyFocus(record);
    setData(updated);
  }, []);

  // 목표 설정
  const setGoals = useCallback((dailyMinutes: number, weeklyMinutes: number) => {
    const updated = storageSetGoals(dailyMinutes, weeklyMinutes);
    setData(updated);
  }, []);

  // 시간대 모드 설정
  const setTimeMode = useCallback((mode: TimeMode) => {
    const updated = storageSetTimeMode(mode);
    setData(updated);
  }, []);

  // 새로 달성한 업적 확인
  const checkNewAchievements = useCallback(() => {
    return getNewlyUnlockedAchievements(data);
  }, [data]);

  // 새로 해금된 항구 확인
  const checkNewPortUnlocks = useCallback(
    (oldMinutes: number, newMinutes: number) => {
      return getNewlyUnlockedPorts(oldMinutes, newMinutes);
    },
    []
  );

  return {
    data,
    isLoaded,
    updateData,
    updateStats,
    addGear,
    recordComplete,
    recordFail,
    toggleSound,
    toggleVibration,
    toggleNotifications,
    addVoyageTicket,
    addVisitedPort,
    updatePortUnlocks,
    addAchievement,
    addAchievements,
    updateWeeklyFocus,
    checkNewAchievements,
    checkNewPortUnlocks,
    setGoals,
    setTimeMode,
  };
}
