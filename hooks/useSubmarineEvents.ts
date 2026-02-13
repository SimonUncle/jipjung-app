"use client";

// 잠수함 이벤트 엔진 훅 — progress 기반 이벤트 발동 + 동적 수치

import { useState, useEffect, useRef, useCallback } from "react";
import {
  EVENT_CATALOG,
  getPhase,
  calculateDepth,
  calculateSpeed,
  calculateOxygen,
  calculateBattery,
  seededRandom,
  type JourneyPhase,
  type ActiveEvent,
  type SubmarineEvent,
} from "@/lib/submarineEvents";

interface UseSubmarineEventsReturn {
  phase: JourneyPhase;
  depth: number;
  speed: number;
  oxygen: number;
  battery: number;
  activeEvents: ActiveEvent[];
}

export function useSubmarineEvents(
  progress: number,
  isPaused: boolean,
  status: string,
  onEventFired?: (event: SubmarineEvent) => void,
): UseSubmarineEventsReturn {
  const [activeEvents, setActiveEvents] = useState<ActiveEvent[]>([]);
  const firedEventsRef = useRef<Set<string>>(new Set());
  const lastProgressRef = useRef<number>(-1);
  const prevStatusRef = useRef<string>(status);

  const phase = getPhase(progress);
  const depth = calculateDepth(progress);
  const speed = calculateSpeed(progress, isPaused);
  const oxygen = calculateOxygen(progress);
  const battery = calculateBattery(progress);

  // 새 잠항 시작 시 이벤트 초기화
  useEffect(() => {
    if (status === "sailing" && prevStatusRef.current !== "sailing") {
      firedEventsRef.current.clear();
      setActiveEvents([]);
      lastProgressRef.current = -1;
    }
    prevStatusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (isPaused) return;
    if (progress === lastProgressRef.current) return;
    lastProgressRef.current = progress;

    // 만료된 이벤트 제거
    setActiveEvents((prev) => prev.filter((ae) => ae.expiresAt > progress));

    // 카탈로그 순회
    EVENT_CATALOG.forEach((event) => {
      if (firedEventsRef.current.has(event.id)) return;
      if (progress < event.minProgress || progress > event.maxProgress) return;

      // 마일스톤 (좁은 범위)은 항상 발동
      const isMilestone = event.maxProgress - event.minProgress <= 10;

      if (!isMilestone) {
        const seed =
          progress +
          event.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
        const roll = seededRandom(seed);
        const hasAffinity = event.phaseAffinity?.includes(phase) ?? false;
        const threshold = hasAffinity ? 0.92 : 0.97;
        if (roll < threshold) return;
      }

      // 이벤트 발동
      firedEventsRef.current.add(event.id);

      const newActive: ActiveEvent = {
        event,
        startedAt: progress,
        expiresAt: Math.min(100, progress + event.duration),
        data: {
          x: seededRandom(progress * 7 + 1) * 80 + 10,
          y: seededRandom(progress * 13 + 2) * 60 + 20,
          size: seededRandom(progress * 17 + 3) * 0.5 + 0.75,
        },
      };

      setActiveEvents((prev) => [...prev, newActive]);

      // 이벤트 효과음 콜백
      onEventFired?.(event);
    });
  }, [progress, isPaused, phase, onEventFired]);

  // progress 리셋 시 초기화 (안전장치)
  useEffect(() => {
    if (progress <= 1) {
      firedEventsRef.current.clear();
      setActiveEvents([]);
    }
  }, [progress]);

  return {
    phase,
    depth,
    speed,
    oxygen,
    battery,
    activeEvents,
  };
}
