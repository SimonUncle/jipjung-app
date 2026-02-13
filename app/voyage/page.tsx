"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { PeriscopeView } from "@/components/submarine/PeriscopeView";
import { UnderwaterView } from "@/components/submarine/UnderwaterView";
import { SubmarineIcon } from "@/components/submarine/SubmarineIcon";
import { useSubmarineEvents } from "@/hooks/useSubmarineEvents";
import { useAnalytics } from "@/hooks/useAnalytics";
import { syncUserStats } from "@/lib/supabaseSync";
import { useAuthContext } from "@/components/auth/AuthProvider";

// Dynamic import for map component (SSR 방지)
const SubmarineMap = dynamic(
  () => import("@/components/submarine/SubmarineMap"),
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
import { Anchor, ArrowRight, Map, Eye, Waves } from "lucide-react";

type ViewMode = "map" | "periscope" | "underwater";

export default function VoyagePage() {
  const router = useRouter();
  const { recordComplete, recordFail, data } = useLocalStorage();
  const { user } = useAuthContext();
  const { track } = useAnalytics();
  const {
    play,
    stopAll,
    playUnderwaterSounds,
    stopUnderwaterSounds,
    playSurfaceSounds,
    stopSurfaceSounds,
    playDiveHorn,
  } = useSound();
  const soundsStarted = useRef(false);

  const {
    status,
    departurePort,
    arrivalPort,
    selectedDuration,
    cabinNumber,
    focusPurpose,
    customPurposeText,
    isPaused,
    pauseUsed,
    seaRoute,
    tick,
    togglePause,
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
  const vibrationEnabled = data.settings?.vibrationEnabled ?? true;

  // 잠수함 이벤트 엔진
  const { phase, depth, speed, oxygen, battery, activeEvents } =
    useSubmarineEvents(progress, isPaused, status);

  // 이벤트 필터링
  const mapEvents = activeEvents.filter(
    (e) => e.event.scope === "map" || e.event.scope === "all"
  );
  const periscopeEvents = activeEvents.filter(
    (e) => e.event.scope === "periscope" || e.event.scope === "all"
  );
  const underwaterEvents = activeEvents.filter(
    (e) => e.event.scope === "underwater" || e.event.scope === "all"
  );

  // Start voyage sounds on mount (해저 소리)
  // soundManager 내부에서 enabled 체크하므로 data.settings 의존 불필요
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (status === "sailing" && !soundsStarted.current) {
      soundsStarted.current = true;
      playDiveHorn();
      timer = setTimeout(() => {
        playUnderwaterSounds();
      }, 1500);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (soundsStarted.current) {
        stopAll();
        soundsStarted.current = false;
      }
    };
  }, [status, playUnderwaterSounds, stopAll, playDiveHorn]);

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

      stopAll();
      playDiveHorn();
      play("complete");

      if (vibrationEnabled) vibrateSuccess();
      recordComplete(selectedDuration);
      completeVoyage(addVisitedPort);

      if (typeof document !== "undefined" && document.hidden && arrivalPort) {
        notifyVoyageComplete(arrivalPort.nameKo);
      }

      setTimeout(() => {
        router.push("/arrival");
      }, 2000);
    }
  }, [status, showComplete, selectedDuration, recordComplete, completeVoyage, addVisitedPort, router, play, vibrationEnabled, stopAll, playDiveHorn, arrivalPort]);

  // Tab visibility detection — 3초 유예 시간
  const handleVisibilityHidden = useCallback(() => {
    if (status === "sailing" && !isPaused) {
      stopAll();
      play("fail");
      if (vibrationEnabled) vibrateFail();
      recordFail();
      failVoyage();

      // Supabase 동기화 + 이벤트 트래킹
      track("voyage_fail", {
        from: departurePort?.id,
        to: arrivalPort?.id,
      });
      if (user?.id) {
        setTimeout(() => {
          const freshData = JSON.parse(localStorage.getItem("climb-focus-data") || "{}");
          if (freshData.stats) syncUserStats(user.id, freshData).catch(() => {});
        }, 200);
      }

      router.push("/fail");
    }
  }, [status, isPaused, failVoyage, recordFail, router, stopAll, play, vibrationEnabled, track, departurePort, arrivalPort, user]);

  const handleVisibilityReturn = useCallback(() => {
    // Returned within grace period — resume sounds
    if (status === "sailing" && !isPaused) {
      playUnderwaterSounds();
    }
  }, [status, isPaused, playUnderwaterSounds]);

  const { isInGracePeriod, graceRemaining } = useVisibility({
    onHidden: handleVisibilityHidden,
    onVisible: handleVisibilityReturn,
    enabled: status === "sailing" && !isPaused,
    gracePeriodMs: 3000,
  });

  // Redirect if no session
  useEffect(() => {
    if (status === "idle" || !departurePort || !arrivalPort) {
      router.push("/");
    }
  }, [status, departurePort, arrivalPort, router]);

  // Pause handler — 사운드 전환을 클릭 핸들러 안에서 (유저 제스처 컨텍스트)
  const handlePause = () => {
    if (vibrationEnabled) vibratePause();

    if (!isPaused) {
      // 잠항 → 부상
      stopUnderwaterSounds();
      playSurfaceSounds();
    } else {
      // 부상 → 재잠항
      stopSurfaceSounds();
      playUnderwaterSounds();
    }

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
      <div className="flex-1 p-4 min-h-0 relative">
        <div className="w-full h-full rounded-xl overflow-hidden isolate">
          {viewMode === "map" ? (
            <SubmarineMap
              progress={progress}
              seaRoute={seaRoute}
              activeEvents={mapEvents}
              phase={phase}
            />
          ) : viewMode === "periscope" ? (
            <PeriscopeView
              progress={progress}
              phase={phase}
              activeEvents={periscopeEvents}
            />
          ) : (
            <UnderwaterView
              progress={progress}
              phase={phase}
              depth={depth}
              activeEvents={underwaterEvents}
            />
          )}
        </div>

        {/* 부상하기 버튼 — overflow-hidden 밖, 맵 위에 오버레이 */}
        {status === "sailing" && !showComplete && !isPaused && !pauseUsed && (
          <div className="absolute top-7 left-1/2 -translate-x-1/2 z-50">
            <button
              onClick={handlePause}
              className="px-5 py-3 min-h-[44px] bg-black/40 text-white/90 rounded-full text-sm border border-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-black/60 flex items-center gap-2"
            >
              <Anchor className="w-4 h-4" />
              부상하기 (1회)
            </button>
          </div>
        )}
      </div>

      {/* Bottom section - Tabs + Progress */}
      <div className="px-4 pb-4 shrink-0 safe-area-bottom">
        {/* View toggle tabs (3탭) */}
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
            onClick={() => setViewMode("periscope")}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-all
              ${viewMode === "periscope"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
          >
            <Eye className="w-4 h-4" />
            잠망경
          </button>
          <button
            onClick={() => setViewMode("underwater")}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-all
              ${viewMode === "underwater"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
          >
            <Waves className="w-4 h-4" />
            해저
          </button>
        </div>

        {/* 잠수함 상태 미니 패널 */}
        <div className="flex gap-2 mb-3 text-xs">
          <div className={`flex-1 bg-black/30 rounded-lg px-2 py-1.5 text-center transition-colors ${
            depth > 250 ? "text-indigo-400" : depth > 150 ? "text-blue-400" : "text-cyan-400"
          }`}>
            <span className="text-white/50">수심 </span>{depth}m
          </div>
          <div className="flex-1 bg-black/30 rounded-lg px-2 py-1.5 text-center text-white/80">
            <span className="text-white/50">속도 </span>{speed}kn
          </div>
          <div className={`flex-1 bg-black/30 rounded-lg px-2 py-1.5 text-center ${
            oxygen < 70 ? "text-amber-400" : "text-cyan-400"
          }`}>
            <span className="text-white/50">O2 </span>{oxygen}%
          </div>
          <div className={`flex-1 bg-black/30 rounded-lg px-2 py-1.5 text-center ${
            battery < 60 ? "text-amber-400" : "text-green-400"
          }`}>
            <span className="text-white/50">BAT </span>{battery}%
          </div>
        </div>

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

      {/* Pause overlay - 부상 장면 */}
      {isPaused && (
        <div className="fixed inset-0 z-30 bg-gradient-to-b from-slate-900/95 via-blue-950/95 to-slate-900/95 flex items-start justify-center overflow-y-auto pt-20">
          <div className="text-center space-y-6 px-8">
            {/* 해저 배경 */}
            <div className="relative w-64 h-40 mx-auto overflow-hidden rounded-2xl bg-gradient-to-b from-cyan-900 to-blue-950">
              {/* 기포 애니메이션 */}
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-cyan-300/30 rounded-full animate-ping"
                    style={{
                      left: `${10 + (i * 7) % 80}%`,
                      bottom: `${10 + (i * 13) % 60}%`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: "2s",
                    }}
                  />
                ))}
              </div>

              {/* 부상 중인 잠수함 */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
                <SubmarineIcon size={64} />
              </div>

              {/* 수면 빛 */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-cyan-400/20 to-transparent" />
            </div>

            {/* 부상 메시지 */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <SubmarineIcon size={24} />
                <h2 className="text-2xl font-bold text-white">부상 중...</h2>
              </div>
              <p className="text-blue-200/70 text-sm">
                잠시 부상합니다. 준비되면 잠항을 재개합니다.
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
              className="px-8 py-4 min-h-[52px] bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-cyan-500/30 transition-all duration-200 hover:from-cyan-400 hover:to-blue-400 active:scale-95 flex items-center gap-3 mx-auto"
            >
              <SubmarineIcon size={24} />
              잠항 재개
            </button>
          </div>
        </div>
      )}

      {/* Grace period warning overlay */}
      {isInGracePeriod && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-red-950/90 backdrop-blur-sm">
          <div className="text-center space-y-4 px-8">
            <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-400 animate-pulse">
              <span className="text-4xl font-bold text-red-400">{graceRemaining}</span>
            </div>
            <h2 className="text-2xl font-bold text-white">돌아와주세요!</h2>
            <p className="text-red-200/80 text-sm">
              {graceRemaining}초 안에 돌아오지 않으면 잠항이 실패합니다
            </p>
          </div>
        </div>
      )}

      {/* Completion overlay */}
      {showComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center">
              <SubmarineIcon size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white">
              잠항 완료!
            </h2>
            <p className="text-xl text-cyan-400">
              {arrivalPort.countryFlag} {arrivalPort.nameKo} 도착
            </p>
            <p className="text-blue-200/60">잠시 후 도착합니다...</p>
          </div>
        </div>
      )}
    </div>
  );
}
