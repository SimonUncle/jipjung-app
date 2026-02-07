"use client";

import { useEffect, useState, useCallback } from "react";
import { PixelCharacter } from "./PixelCharacter";
import { PixelBackground } from "./PixelBackground";
import { PixelEvents } from "./PixelEvents";
import { DebugOverlay } from "./DebugOverlay";
import {
  useWorldStore,
  getScreenX,
  getStageProgress,
  getTotalProgress,
} from "@/stores/worldStore";
import { getCurrentLevel, LEVELS } from "@/lib/levels";

interface PixelJourneyProps {
  progress: number; // 0-100 (기존 호환성 유지 - 내부적으로는 worldStore 사용)
}

export function PixelJourney({ progress }: PixelJourneyProps) {
  const [isWalking, setIsWalking] = useState(true);
  const [characterState, setCharacterState] = useState<
    "normal" | "resting" | "struggling"
  >("normal");

  // World Store에서 좌표 가져오기
  const worldX = useWorldStore((state) => state.worldX);
  const cameraX = useWorldStore((state) => state.cameraX);
  const currentLevelIndex = useWorldStore((state) => state.currentLevelIndex);
  const screenWidth = useWorldStore((state) => state.screenWidth);

  // 현재 레벨 정보
  const currentLevel = getCurrentLevel(currentLevelIndex);
  const levelWidth = currentLevel.width;
  const characterMode = currentLevel.mode === "vertical" ? "vertical" : "horizontal";

  // 파생값 계산
  const screenX = worldX - cameraX;
  const stageProgress = getStageProgress(useWorldStore.getState());
  const totalProgress = getTotalProgress(useWorldStore.getState());

  // 스크린 크기 설정 (resize 대응)
  const setScreenWidth = useWorldStore((state) => state.setScreenWidth);

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    updateScreenWidth();
    window.addEventListener("resize", updateScreenWidth);
    return () => window.removeEventListener("resize", updateScreenWidth);
  }, [setScreenWidth]);

  // worldX 변경 시 walking 애니메이션
  useEffect(() => {
    if (worldX > 0) {
      setIsWalking(true);
    }
  }, [worldX]);

  // Event handlers
  const handleEventStart = useCallback((event: string) => {
    if (event === "oasis") {
      setIsWalking(false);
      setCharacterState("resting");
    } else if (event === "snowstorm" || event === "sandstorm") {
      setCharacterState("struggling");
    } else if (event === "arrival") {
      setIsWalking(false);
    }
  }, []);

  const handleEventEnd = useCallback((event: string) => {
    if (event === "oasis") {
      setIsWalking(true);
      setCharacterState("normal");
    } else if (event === "snowstorm" || event === "sandstorm") {
      setCharacterState("normal");
    }
  }, []);

  return (
    <div className="relative flex-1 w-full overflow-hidden bg-gray-900">
      {/* Background with parallax - cameraX 기준 */}
      <PixelBackground
        level={currentLevel}
        cameraX={cameraX}
        levelWidth={levelWidth}
      />

      {/* 디버그: groundLineY 빨간 선 */}
      <div
        className="absolute left-0 right-0 z-50 pointer-events-none"
        style={{
          bottom: "6rem",
          height: 2,
          background: "red",
          opacity: 0.8,
        }}
      />

      {/* Character - screenX 위치에 렌더링 */}
      {/* bottom을 calc(6rem - 8px)로 변경하여 GROUND_LINE_OFFSET 보정 */}
      <div
        className="absolute z-20 transition-all duration-500"
        style={{
          bottom: "calc(6rem - 8px)",
          // 캐릭터는 화면의 ~35% 위치에 고정 (카메라가 따라가므로)
          left: currentLevel.mode === "vertical" ? "50%" : `${Math.max(80, screenX)}px`,
          transform: currentLevel.mode === "vertical" ? "translateX(-50%)" : "none",
        }}
      >
        <PixelCharacter
          isWalking={isWalking}
          state={characterState}
          mode={characterMode}
        />
      </div>

      {/* Events overlay */}
      <PixelEvents
        progress={totalProgress}
        onEventStart={handleEventStart}
        onEventEnd={handleEventEnd}
      />

      {/* Progress bar at top */}
      <div className="absolute top-4 left-4 right-20 z-30">
        <div className="flex items-center gap-3">
          {/* Level icon */}
          <div className="text-2xl">{currentLevel.emoji}</div>

          {/* Progress bar - 현재 레벨 내 진행률 */}
          <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${stageProgress}%`,
                background: getProgressBarColor(currentLevel.theme),
              }}
            />
          </div>

          {/* Percentage */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-white font-bold text-sm">
              {Math.round(stageProgress)}%
            </span>
          </div>
        </div>

        {/* Level name */}
        <div className="mt-2 text-white/60 text-xs font-medium">
          {currentLevel.label} 구간
        </div>
      </div>

      {/* Level MiniMap (오른쪽 위) */}
      <div className="absolute top-4 right-4 z-30">
        <LevelMiniMap
          currentLevelIndex={currentLevelIndex}
          stageProgress={stageProgress}
        />
      </div>

      {/* 디버그 오버레이 */}
      <DebugOverlay
        worldX={worldX}
        screenX={screenX}
        cameraX={cameraX}
        levelWidth={levelWidth}
        currentLevel={currentLevel.id}
        currentLevelIndex={currentLevelIndex}
        totalProgress={totalProgress}
        isTransitioning={useWorldStore((state) => state.isTransitioning)}
        rightEdge={levelWidth - 50}
      />

      {/* Walking/Climbing indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-1">
        {isWalking && characterState === "normal" && (
          <>
            {currentLevel.mode === "vertical" ? (
              // Climbing indicator - vertical dots
              <div className="flex flex-col gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-amber-400/70 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            ) : (
              // Walking indicator - horizontal dots
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Progress bar color based on theme
function getProgressBarColor(theme: string): string {
  switch (theme) {
    case "forest":
      return "linear-gradient(90deg, #22c55e 0%, #4ade80 100%)";
    case "temple-stairs":
    case "temple-interior":
    case "temple-entrance":
    case "temple-exit":
      return "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)";
    case "desert":
      return "linear-gradient(90deg, #f97316 0%, #fb923c 100%)";
    case "cave":
    case "cave-entrance":
      return "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)";
    case "snow":
      return "linear-gradient(90deg, #38bdf8 0%, #7dd3fc 100%)";
    case "peak":
      return "linear-gradient(90deg, #fbbf24 0%, #fcd34d 100%)";
    default:
      return "linear-gradient(90deg, #27ae60 0%, #f1c40f 50%, #e74c3c 100%)";
  }
}

// Level-based mini map
function LevelMiniMap({
  currentLevelIndex,
  stageProgress,
}: {
  currentLevelIndex: number;
  stageProgress: number;
}) {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2">
      <div className="flex flex-col gap-1">
        {LEVELS.map((level, i) => {
          const isActive = i === currentLevelIndex;
          const isPast = i < currentLevelIndex;

          return (
            <div
              key={level.id}
              className={`flex items-center gap-2 px-2 py-0.5 rounded text-xs transition-all ${
                isActive
                  ? "bg-white/20 text-white"
                  : isPast
                  ? "text-white/60"
                  : "text-white/30"
              }`}
            >
              <span>{level.emoji}</span>
              <span className="hidden sm:inline">{level.label}</span>
              {isActive && (
                <span className="ml-auto text-[10px] text-amber-400">
                  {Math.round(stageProgress)}%
                </span>
              )}
              {isPast && <span className="ml-auto">✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
