"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DistanceDisplay } from "@/components/climb/DistanceDisplay";
import { CheckpointAlert } from "@/components/timer/CheckpointAlert";
import { PixelJourney } from "@/components/climb/PixelJourney";
import { UnlockBadge } from "@/components/unlock/UnlockBadge";
import { useSessionStore, getProgress } from "@/stores/sessionStore";
import { useWorldStore, getTotalProgress } from "@/stores/worldStore";
import { calculateMoveSpeed } from "@/lib/levels";
import { useVisibility } from "@/hooks/useVisibility";
import { useCheckpoint } from "@/hooks/useCheckpoint";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSound } from "@/hooks/useSound";
import { getNewUnlocks } from "@/lib/unlocks";
import { calculateDistance, getJourneyInfo } from "@/lib/distance";
import { vibrateCheckpoint, vibrateSuccess, vibrateFail, vibratePause } from "@/lib/vibration";
import { Gear } from "@/types";

export default function ClimbPage() {
  const router = useRouter();
  const { recordComplete, recordFail, addGear, data } = useLocalStorage();
  const { playClimbingSounds, stopClimbingSounds, play } = useSound();

  const {
    status,
    selectedDuration,
    tick,
    failSession,
    startRest,
    isPaused,
    pauseUsed,
    togglePause,
  } = useSessionStore();

  const progress = getProgress(useSessionStore.getState());
  const [showComplete, setShowComplete] = useState(false);
  const [newUnlockedGear, setNewUnlockedGear] = useState<Gear | null>(null);

  // World Store
  const movePlayer = useWorldStore((state) => state.movePlayer);
  const resetWorld = useWorldStore((state) => state.resetWorld);
  const worldProgress = getTotalProgress(useWorldStore.getState());

  // 이동 속도 (초당 이동 거리)
  const moveSpeedRef = useRef(calculateMoveSpeed(selectedDuration));

  // 월드 초기화 여부 추적 (한 번만 리셋하기 위함)
  const worldInitializedRef = useRef(false);

  const vibrationEnabled = data.settings?.vibrationEnabled ?? true;

  // 체크포인트 훅 (world progress 기반)
  const { currentAlert, dismissAlert } = useCheckpoint(worldProgress, {
    onCheckpoint: () => {
      play("checkpoint");
      if (vibrationEnabled) vibrateCheckpoint();
    },
  });

  // 등반 사운드 시작/정지
  useEffect(() => {
    if (status === "climbing" && !isPaused) {
      playClimbingSounds();
    } else {
      stopClimbingSounds();
    }

    return () => stopClimbingSounds();
  }, [status, isPaused, playClimbingSounds, stopClimbingSounds]);

  // 세션 시작 시 월드 리셋 (한 번만!)
  useEffect(() => {
    if (status === "climbing" && !worldInitializedRef.current) {
      worldInitializedRef.current = true;
      resetWorld();
      moveSpeedRef.current = calculateMoveSpeed(selectedDuration);
    }

    // 세션이 끝나면 초기화 플래그 리셋
    if (status !== "climbing") {
      worldInitializedRef.current = false;
    }
  }, [status, resetWorld, selectedDuration]);

  // 타이머 틱 + 플레이어 이동
  useEffect(() => {
    if (status !== "climbing" || isPaused) return;

    const interval = setInterval(() => {
      tick();
      // 플레이어 이동 (초당 moveSpeed만큼)
      movePlayer(moveSpeedRef.current);
    }, 1000);

    return () => clearInterval(interval);
  }, [status, isPaused, tick, movePlayer]);

  // 완료 처리
  useEffect(() => {
    if (status === "completed" && !showComplete) {
      setShowComplete(true);
      stopClimbingSounds();
      play("complete");
      if (vibrationEnabled) vibrateSuccess();

      // 통계 업데이트
      recordComplete(selectedDuration);

      // 새 해금 확인
      const newTotal = data.stats.totalFocusMinutes + selectedDuration;
      const newUnlocks = getNewUnlocks(newTotal, data.unlocks.gears);

      if (newUnlocks.length > 0) {
        setNewUnlockedGear(newUnlocks[0]);
        newUnlocks.forEach((gear) => addGear(gear.id));

        setTimeout(() => {
          setNewUnlockedGear(null);
          startRest();
          router.push("/rest");
        }, 4500);
      } else {
        setTimeout(() => {
          startRest();
          router.push("/rest");
        }, 2000);
      }
    }
  }, [
    status,
    showComplete,
    selectedDuration,
    recordComplete,
    data,
    addGear,
    startRest,
    router,
    stopClimbingSounds,
    play,
    vibrationEnabled,
  ]);

  // 탭 이탈 감지
  const handleVisibilityHidden = useCallback(() => {
    if (status === "climbing" && !isPaused) {
      stopClimbingSounds();
      play("fail");
      if (vibrationEnabled) vibrateFail();
      recordFail();
      failSession();
      router.push("/fail");
    }
  }, [status, isPaused, failSession, recordFail, router, stopClimbingSounds, play, vibrationEnabled]);

  useVisibility({
    onHidden: handleVisibilityHidden,
    enabled: status === "climbing" && !isPaused,
  });

  // 세션이 없으면 홈으로
  useEffect(() => {
    if (status === "idle") {
      router.push("/");
    }
  }, [status, router]);

  // 일시정지 핸들러
  const handlePause = () => {
    if (vibrationEnabled) vibratePause();
    togglePause();
  };

  // 현재 진행률 및 거리 계산
  const currentProgress = getProgress(useSessionStore.getState());
  const currentDistance = calculateDistance(currentProgress, selectedDuration);
  const journeyInfo = getJourneyInfo(selectedDuration);

  if (status === "idle") {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-bg">
      {/* 이동 거리 표시 */}
      <div className="pt-6 pb-2 z-10">
        <DistanceDisplay
          distance={currentDistance}
          selectedDuration={selectedDuration}
        />
      </div>

      {/* 픽셀 아트 베이스캠프 여정 */}
      <PixelJourney progress={currentProgress} />

      {/* 일시정지 버튼 (1회만 사용 가능) */}
      {status === "climbing" && !showComplete && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          {isPaused ? (
            <button
              onClick={handlePause}
              className="px-6 py-3 bg-accent-primary text-white rounded-full font-medium
                         shadow-lg shadow-accent-primary/30 transition-all duration-200
                         hover:bg-accent-primary/90 active:scale-95"
            >
              계속하기
            </button>
          ) : !pauseUsed ? (
            <button
              onClick={handlePause}
              className="px-5 py-2.5 bg-dark-surface/80 text-dark-muted rounded-full text-sm
                         border border-dark-border backdrop-blur-sm transition-all duration-200
                         hover:bg-dark-surface hover:text-white hover:border-dark-muted"
            >
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                일시정지 (1회)
              </span>
            </button>
          ) : (
            <div className="px-4 py-2 text-xs text-dark-muted/50">
              일시정지 사용 완료
            </div>
          )}
        </div>
      )}

      {/* 일시정지 오버레이 */}
      {isPaused && (
        <div className="fixed inset-0 z-30 bg-black/60 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-5xl opacity-50">⏸️</div>
            <h2 className="text-xl font-semibold text-white">일시정지</h2>
            <p className="text-dark-muted text-sm">
              계속하려면 아래 버튼을 누르세요
            </p>
          </div>
        </div>
      )}

      {/* 체크포인트 알림 */}
      {currentAlert && (
        <CheckpointAlert checkpoint={currentAlert} onDismiss={dismissAlert} />
      )}

      {/* 완료 메시지 */}
      {showComplete && !newUnlockedGear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="text-center space-y-4">
            <span className="text-6xl">🎉</span>
            <h2 className="text-2xl font-bold text-white">
              탐험 완료!
            </h2>
            <p className="text-accent-primary text-lg">
              {journeyInfo.journeyName} {journeyInfo.maxDistance}km
            </p>
            <p className="text-dark-muted mt-2">쉼터로 이동합니다...</p>
          </div>
        </div>
      )}

      {/* 해금 알림 */}
      {newUnlockedGear && (
        <UnlockBadge
          gear={newUnlockedGear}
          onDismiss={() => setNewUnlockedGear(null)}
        />
      )}
    </div>
  );
}
