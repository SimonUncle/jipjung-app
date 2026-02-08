"use client";

import { useEffect, useCallback, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CabinView, TimeOfDay } from "@/components/voyage/CabinView";
import { TimeMode } from "@/types";
import { DeckView } from "@/components/voyage/DeckView";

// Dynamic imports for map components to avoid SSR issues
const LeafletMap = dynamic(
  () => import("@/components/voyage/LeafletMap").then((mod) => mod.LeafletMap),
  { ssr: false, loading: () => <MapLoading /> }
);

const ChaseMapView = dynamic(
  () => import("@/components/voyage/ChaseMapView").then((mod) => mod.ChaseMapView),
  { ssr: false, loading: () => <MapLoading /> }
);

function MapLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-xl">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
import {
  useVoyageStore,
  getProgress,
  getRemainingSeconds,
  getTraveledDistance,
  getRemainingDistance,
} from "@/stores/voyageStore";
import { useUnlockStore } from "@/stores/unlockStore";
import { useVisibility } from "@/hooks/useVisibility";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSound } from "@/hooks/useSound";
import { vibrateSuccess, vibrateFail, vibratePause } from "@/lib/vibration";
import { notifyVoyageComplete } from "@/lib/notifications";
import { Ship, Anchor, ArrowRight, Map, Eye, Navigation } from "lucide-react";

type ViewMode = "map" | "chase" | "cabin" | "deck";

export default function VoyagePage() {
  const router = useRouter();
  const { recordComplete, recordFail, data, setTimeMode } = useLocalStorage();
  const { play, stopVoyageSounds, playVoyageSounds, playShipHorn } = useSound();
  const soundsStarted = useRef(false);

  const {
    status,
    departurePort,
    arrivalPort,
    selectedDuration,
    cabinNumber,
    focusPurpose,
    customPurposeText,
    mapZoom,
    isPaused,
    pauseUsed,
    currentPosition,
    positionHistory,
    seaRoute,
    tick,
    togglePause,
    zoomIn,
    zoomOut,
    completeVoyage,
    failVoyage,
  } = useVoyageStore();

  const { addVisitedPort } = useUnlockStore();

  const state = useVoyageStore.getState();
  const progress = getProgress(state);
  const remainingSeconds = getRemainingSeconds(state);
  const traveledDistance = getTraveledDistance(state);
  const remainingDistance = getRemainingDistance(state);

  const [showComplete, setShowComplete] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [manualTimeOfDay, setManualTimeOfDay] = useState<TimeOfDay | null>(null);
  const [showTimeModeMenu, setShowTimeModeMenu] = useState(false);
  const vibrationEnabled = data.settings?.vibrationEnabled ?? true;
  const timeMode: TimeMode = data.settings?.timeMode ?? "voyage";

  // Get current hour for realtime mode
  const currentHour = new Date().getHours();

  // Auto time of day based on selected mode
  const autoTimeOfDay = useMemo((): TimeOfDay => {
    if (timeMode === "voyage") {
      // 항해 진행률 기반 (0-40% day, 40-70% sunset, 70-100% night)
      if (progress < 40) return "day";
      if (progress < 70) return "sunset";
      return "night";
    } else if (timeMode === "realtime") {
      // 실제 시간 기반 (6-17시 낮, 17-20시 저녁, 20-6시 밤)
      if (currentHour >= 6 && currentHour < 17) return "day";
      if (currentHour >= 17 && currentHour < 20) return "sunset";
      return "night";
    }
    // manual 모드: 기본값 day (수동 선택 시 manualTimeOfDay 사용)
    return "day";
  }, [progress, timeMode, currentHour]);

  // Current time of day (manual override or auto)
  const timeOfDay = manualTimeOfDay ?? autoTimeOfDay;

  // 모드별 설명 텍스트
  const timeModeDescription = useMemo(() => {
    switch (timeMode) {
      case "voyage": return "항해 진행에 따라 시간이 흐릅니다";
      case "realtime": return "실제 시간에 맞춰 변경됩니다";
      case "manual": return "직접 선택한 시간대가 유지됩니다";
    }
  }, [timeMode]);

  // Start voyage sounds on mount
  useEffect(() => {
    if (status === "sailing" && !soundsStarted.current && data.settings?.soundEnabled) {
      soundsStarted.current = true;
      // Play ship horn on departure
      playShipHorn();
      // Start ambient sounds after horn
      setTimeout(() => {
        playVoyageSounds();
      }, 1500);
    }

    // Cleanup on unmount
    return () => {
      if (soundsStarted.current) {
        stopVoyageSounds();
      }
    };
  }, [status, playVoyageSounds, stopVoyageSounds, playShipHorn, data.settings?.soundEnabled]);

  // Pause/resume sounds
  useEffect(() => {
    if (!soundsStarted.current) return;

    if (isPaused) {
      stopVoyageSounds();
    } else if (status === "sailing") {
      playVoyageSounds();
    }
  }, [isPaused, status, playVoyageSounds, stopVoyageSounds]);

  // Timer tick
  useEffect(() => {
    if (status !== "sailing" || isPaused) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [status, isPaused, tick]);

  // Arrival handling
  useEffect(() => {
    if (status === "arriving" && !showComplete) {
      setShowComplete(true);

      // Stop voyage sounds and play arrival horn
      stopVoyageSounds();
      playShipHorn();
      play("complete");

      if (vibrationEnabled) vibrateSuccess();
      recordComplete(selectedDuration);
      completeVoyage(addVisitedPort);

      // Send notification if tab is hidden
      if (typeof document !== "undefined" && document.hidden && arrivalPort) {
        notifyVoyageComplete(arrivalPort.nameKo);
      }

      setTimeout(() => {
        router.push("/arrival");
      }, 2000);
    }
  }, [status, showComplete, selectedDuration, recordComplete, completeVoyage, addVisitedPort, router, play, vibrationEnabled, stopVoyageSounds, playShipHorn, arrivalPort]);

  // Tab visibility detection
  const handleVisibilityHidden = useCallback(() => {
    if (status === "sailing" && !isPaused) {
      stopVoyageSounds();
      play("fail");
      if (vibrationEnabled) vibrateFail();
      recordFail();
      failVoyage();
      router.push("/fail");
    }
  }, [status, isPaused, failVoyage, recordFail, router, stopVoyageSounds, play, vibrationEnabled]);

  useVisibility({
    onHidden: handleVisibilityHidden,
    enabled: status === "sailing" && !isPaused,
  });

  // Redirect if no session
  useEffect(() => {
    if (status === "idle" || !departurePort || !arrivalPort) {
      router.push("/");
    }
  }, [status, departurePort, arrivalPort, router]);

  // Pause handler
  const handlePause = () => {
    if (vibrationEnabled) vibratePause();
    togglePause();
  };

  // Time format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Focus purpose text
  const purposeText = focusPurpose?.id === "custom" && customPurposeText
    ? customPurposeText
    : focusPurpose?.labelKo ?? "";

  if (!departurePort || !arrivalPort) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-900 to-blue-950">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-900 to-blue-950 overflow-hidden">
      {/* Header - Route info */}
      <header className="px-4 py-3 bg-black/20 shrink-0 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{departurePort.countryFlag}</span>
            <span className="text-white font-medium text-sm">{departurePort.nameKo}</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <span className="text-xl">{arrivalPort.countryFlag}</span>
            <span className="text-white font-medium text-sm">{arrivalPort.nameKo}</span>
          </div>

          {/* Remaining time */}
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-white">
              {formatTime(remainingSeconds)}
            </p>
          </div>
        </div>

        {/* Focus purpose and cabin */}
        {(purposeText || cabinNumber) && (
          <div className="flex items-center gap-3 mt-2 text-xs">
            {purposeText && (
              <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                {purposeText}
              </span>
            )}
            {cabinNumber && (
              <span className="bg-white/10 text-white/70 px-2 py-1 rounded-full">
                Cabin {cabinNumber}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Main content - Full screen view */}
      <div className="flex-1 p-4 min-h-0">
        <div className="w-full h-full">
          {viewMode === "map" ? (
            <LeafletMap
              departurePort={departurePort}
              arrivalPort={arrivalPort}
              progress={progress}
              zoom={mapZoom}
              seaRoute={seaRoute}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
            />
          ) : viewMode === "chase" ? (
            <ChaseMapView
              departurePort={departurePort}
              arrivalPort={arrivalPort}
              currentPosition={currentPosition}
              positionHistory={positionHistory}
              seaRoute={seaRoute}
              progress={progress}
            />
          ) : viewMode === "cabin" ? (
            <CabinView
              progress={progress}
              timeOfDay={timeOfDay}
            />
          ) : (
            <DeckView
              progress={progress}
              timeOfDay={timeOfDay}
            />
          )}
        </div>
      </div>

      {/* Bottom section - Tabs + Progress */}
      <div className="px-4 pb-4 shrink-0 safe-area-bottom">
        {/* View toggle tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setViewMode("map")}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-all
              ${viewMode === "map"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
          >
            <Map className="w-4 h-4" />
            지도
          </button>
          <button
            onClick={() => setViewMode("chase")}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-all
              ${viewMode === "chase"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
          >
            <Navigation className="w-4 h-4" />
            추적
          </button>
          <button
            onClick={() => setViewMode("cabin")}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-all
              ${viewMode === "cabin"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
          >
            <Eye className="w-4 h-4" />
            선실
          </button>
          <button
            onClick={() => setViewMode("deck")}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-all
              ${viewMode === "deck"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
          >
            <Ship className="w-4 h-4" />
            갑판
          </button>
        </div>

        {/* Time of day toggle (only for cabin/deck views) */}
        {(viewMode === "cabin" || viewMode === "deck") && (
          <div className="mb-3">
            {/* 모드 설명 + 설정 버튼 */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/50">{timeModeDescription}</p>
              <div className="relative">
                <button
                  onClick={() => setShowTimeModeMenu(!showTimeModeMenu)}
                  className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-all text-xs"
                >
                  ⚙️
                </button>
                {/* 모드 선택 메뉴 */}
                {showTimeModeMenu && (
                  <div className="absolute right-0 bottom-full mb-1 w-40 bg-slate-800 rounded-lg shadow-lg border border-white/10 overflow-hidden z-10">
                    <button
                      onClick={() => { setTimeMode("voyage"); setShowTimeModeMenu(false); setManualTimeOfDay(null); }}
                      className={`w-full px-3 py-2 text-left text-xs transition-all ${timeMode === "voyage" ? "bg-cyan-500/30 text-cyan-300" : "text-white/70 hover:bg-white/10"}`}
                    >
                      🚢 항해 시간
                    </button>
                    <button
                      onClick={() => { setTimeMode("realtime"); setShowTimeModeMenu(false); setManualTimeOfDay(null); }}
                      className={`w-full px-3 py-2 text-left text-xs transition-all ${timeMode === "realtime" ? "bg-cyan-500/30 text-cyan-300" : "text-white/70 hover:bg-white/10"}`}
                    >
                      🕐 실제 시간
                    </button>
                    <button
                      onClick={() => { setTimeMode("manual"); setShowTimeModeMenu(false); }}
                      className={`w-full px-3 py-2 text-left text-xs transition-all ${timeMode === "manual" ? "bg-cyan-500/30 text-cyan-300" : "text-white/70 hover:bg-white/10"}`}
                    >
                      ✋ 수동
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 시간대 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => setManualTimeOfDay(manualTimeOfDay === "day" ? null : "day")}
                className={`flex-1 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1
                  ${timeOfDay === "day"
                    ? "bg-sky-500/30 text-sky-200 border border-sky-400/50"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
              >
                ☀️ 낮
                {timeMode !== "manual" && manualTimeOfDay === null && autoTimeOfDay === "day" && (
                  <span className="text-[10px] opacity-60">(자동)</span>
                )}
              </button>
              <button
                onClick={() => setManualTimeOfDay(manualTimeOfDay === "sunset" ? null : "sunset")}
                className={`flex-1 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1
                  ${timeOfDay === "sunset"
                    ? "bg-orange-500/30 text-orange-200 border border-orange-400/50"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
              >
                🌅 저녁
                {timeMode !== "manual" && manualTimeOfDay === null && autoTimeOfDay === "sunset" && (
                  <span className="text-[10px] opacity-60">(자동)</span>
                )}
              </button>
              <button
                onClick={() => setManualTimeOfDay(manualTimeOfDay === "night" ? null : "night")}
                className={`flex-1 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1
                  ${timeOfDay === "night"
                    ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/50"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
              >
                🌙 밤
                {timeMode !== "manual" && manualTimeOfDay === null && autoTimeOfDay === "night" && (
                  <span className="text-[10px] opacity-60">(자동)</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white">
              {traveledDistance.toLocaleString()}km 이동
            </span>
            <span className="text-sm text-blue-300">
              남은 거리: {remainingDistance.toLocaleString()}km
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pause button - 정박하기 버튼 (1회만 사용 가능) */}
      {status === "sailing" && !showComplete && !isPaused && !pauseUsed && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={handlePause}
            className="px-5 py-3 min-h-[44px] bg-white/10 text-white/80 rounded-full text-sm
                     border border-white/20 backdrop-blur-sm transition-all duration-200
                     hover:bg-white/20 flex items-center gap-2"
          >
            <Anchor className="w-4 h-4" />
            정박하기 (1회)
          </button>
        </div>
      )}

      {/* Pause overlay - 정박 장면 */}
      {isPaused && (
        <div className="fixed inset-0 z-30 bg-gradient-to-b from-slate-900/95 via-blue-950/95 to-slate-900/95 flex items-center justify-center">
          <div className="text-center space-y-6 px-8">
            {/* 바다 배경 */}
            <div className="relative w-64 h-40 mx-auto overflow-hidden rounded-2xl bg-gradient-to-b from-blue-900 to-blue-950">
              {/* 파도 애니메이션 */}
              <div className="absolute bottom-0 left-0 right-0">
                <div className="flex">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="text-3xl animate-bounce"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: "2s",
                      }}
                    >
                      🌊
                    </div>
                  ))}
                </div>
              </div>

              {/* 정박한 배 */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <span className="text-6xl block animate-pulse" style={{ animationDuration: "3s" }}>
                    🚢
                  </span>
                  {/* 닻 */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                    <Anchor className="w-8 h-8 text-amber-400 animate-bounce" style={{ animationDuration: "2s" }} />
                  </div>
                </div>
              </div>

              {/* 달/별 */}
              <div className="absolute top-2 right-4">
                <span className="text-2xl">🌙</span>
              </div>
              <div className="absolute top-4 left-4">
                <span className="text-sm animate-pulse">✨</span>
              </div>
              <div className="absolute top-6 left-12">
                <span className="text-xs animate-pulse" style={{ animationDelay: "0.5s" }}>✨</span>
              </div>
            </div>

            {/* 정박 메시지 */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Anchor className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">정박 중...</h2>
              </div>
              <p className="text-blue-200/70 text-sm">
                잠시 쉬어가세요. 준비되면 항해를 재개합니다.
              </p>
            </div>

            {/* 진행 상황 표시 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-xs mx-auto">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blue-200/60">진행률</span>
                <span className="text-cyan-400 font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-blue-200/50 mt-2">
                남은 시간: {formatTime(remainingSeconds)}
              </p>
            </div>

            {/* 재개 버튼 */}
            <button
              onClick={handlePause}
              className="px-8 py-4 min-h-[52px] bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold text-lg
                       shadow-lg shadow-cyan-500/30 transition-all duration-200
                       hover:from-cyan-400 hover:to-blue-400 active:scale-95 flex items-center gap-3 mx-auto"
            >
              <Ship className="w-6 h-6" />
              항해 재개
            </button>
          </div>
        </div>
      )}

      {/* Completion overlay */}
      {showComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center">
              <Ship className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              항해 완료!
            </h2>
            <p className="text-xl text-cyan-400">
              {arrivalPort.countryFlag} {arrivalPort.nameKo} 도착
            </p>
            <p className="text-blue-200/60">잠시 후 항구로 이동합니다...</p>
          </div>
        </div>
      )}
    </div>
  );
}
