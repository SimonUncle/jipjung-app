"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useVoyageStore, getTraveledDistance } from "@/stores/voyageStore";
import { useUnlockStore } from "@/stores/unlockStore";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { VoyageTicket, Achievement } from "@/types";
import { getNewlyUnlockedAchievements } from "@/lib/achievements";
import { shareVoyage } from "@/lib/shareUtils";
import { syncVoyage, syncUserStats } from "@/lib/supabaseSync";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AchievementUnlock } from "@/components/common/AchievementUnlock";
import { ShareButton } from "@/components/common/ShareButton";
import { User } from "lucide-react";

export default function ArrivalPage() {
  const router = useRouter();
  const {
    status,
    departurePort,
    arrivalPort,
    distance,
    selectedDuration,
    cabinNumber,
    focusPurpose,
    customPurposeText,
    resetVoyage,
  } = useVoyageStore();

  const { visitedPorts, addVisitedPort: addVisitedPortToStore } = useUnlockStore();

  const {
    data,
    addVoyageTicket,
    addVisitedPort,
    addAchievements,
  } = useLocalStorage();

  const { isAuthenticated, user } = useAuthContext();
  const { track } = useAnalytics();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [isNewPort, setIsNewPort] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [ticketSaved, setTicketSaved] = useState(false);

  useEffect(() => {
    if (!arrivalPort || !departurePort) {
      router.push("/");
      return;
    }

    // 티켓 저장 (한 번만)
    if (!ticketSaved) {
      setTicketSaved(true);

      // 티켓 생성 및 저장
      const ticket: VoyageTicket = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        departurePortId: departurePort.id,
        arrivalPortId: arrivalPort.id,
        duration: selectedDuration,
        distance: distance,
        cabinNumber: cabinNumber || "",
        focusPurposeId: focusPurpose?.id,
        focusPurposeText: focusPurpose?.id === "custom" ? customPurposeText || undefined : focusPurpose?.labelKo,
      };
      addVoyageTicket(ticket);

      // Supabase 동기화 + 이벤트 트래킹 (fire-and-forget)
      if (user?.id) {
        syncVoyage(user.id, ticket).catch(() => {});
        // stats는 addVoyageTicket 후 data가 업데이트되므로 약간 딜레이
        setTimeout(() => {
          const freshData = JSON.parse(localStorage.getItem("climb-focus-data") || "{}");
          if (freshData.stats) syncUserStats(user.id, freshData).catch(() => {});
        }, 200);
      }
      track("voyage_complete", {
        from: departurePort.id,
        to: arrivalPort.id,
        duration: selectedDuration,
        distance: distance,
      });

      // 방문 항구 추가
      if (!data.visitedPorts?.includes(arrivalPort.id)) {
        addVisitedPort(arrivalPort.id);
        setIsNewPort(true);
      }

      // 업적 확인 (약간의 딜레이 후)
      setTimeout(() => {
        const achievements = getNewlyUnlockedAchievements({
          ...data,
          visitedPorts: [...(data.visitedPorts || []), arrivalPort.id],
        });
        if (achievements.length > 0) {
          setNewAchievements(achievements);
          addAchievements(achievements.map((a) => a.id));
        }
      }, 100);
    }

    // 스탬프 애니메이션 시작
    setTimeout(() => {
      setShowStamp(true);
    }, 500);

    // 업적 표시 (스탬프 후)
    setTimeout(() => {
      if (newAchievements.length > 0 && !showAchievements) {
        setShowAchievements(true);
      }
    }, 1500);
  }, [arrivalPort, departurePort, router, ticketSaved, data, selectedDuration, distance, cabinNumber, focusPurpose, customPurposeText, addVoyageTicket, addVisitedPort, addAchievements, newAchievements.length, showAchievements]);

  const handleGoHome = () => {
    resetVoyage();
    router.push("/");
  };

  const handleNewVoyage = () => {
    resetVoyage();
    router.push("/");
  };

  const handleShare = useCallback(async () => {
    if (!arrivalPort || !departurePort) return false;

    const ticket: VoyageTicket = {
      id: "",
      date: new Date().toISOString(),
      departurePortId: departurePort.id,
      arrivalPortId: arrivalPort.id,
      duration: selectedDuration,
      distance: distance,
      cabinNumber: cabinNumber || "",
      focusPurposeText: focusPurpose?.id === "custom" ? customPurposeText || undefined : focusPurpose?.labelKo,
    };

    return shareVoyage({
      ticket,
      includeStats: true,
      totalVoyages: data.stats?.completedSessions || 0,
      totalFocusMinutes: data.stats?.totalFocusMinutes || 0,
    });
  }, [arrivalPort, departurePort, selectedDuration, distance, cabinNumber, focusPurpose, customPurposeText, data.stats]);

  const handleAchievementsClose = () => {
    setShowAchievements(false);
  };

  if (!arrivalPort || !departurePort) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-900 to-blue-950">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 min-h-screen">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 파티클 효과 */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* 도착 메시지 */}
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block animate-bounce">🎊</span>
          <h1 className="text-3xl font-bold text-white mb-2">
            환영합니다!
          </h1>
          <p className="text-blue-300/80">
            {arrivalPort.nameKo}에 무사히 도착했습니다
          </p>
        </div>

        {/* 스탬프 카드 */}
        <div
          className={`relative transition-all duration-700 transform ${
            showStamp ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl p-6 shadow-2xl border-4 border-amber-200">
            {/* 스탬프 헤더 */}
            <div className="text-center border-b-2 border-dashed border-amber-300 pb-4 mb-4">
              <p className="text-xs text-amber-600 uppercase tracking-wider">
                Arrival Stamp
              </p>
              <p className="text-lg font-bold text-amber-900">
                입항 스탬프
              </p>
            </div>

            {/* 국기 및 도시명 */}
            <div className="text-center mb-4">
              <span className="text-6xl block mb-2">{arrivalPort.countryFlag}</span>
              <h2 className="text-2xl font-bold text-slate-800">
                {arrivalPort.nameKo}
              </h2>
              <p className="text-sm text-slate-600">
                {arrivalPort.name}, {arrivalPort.country}
              </p>
            </div>

            {/* 랜드마크 */}
            {arrivalPort.landmark && (
              <div className="text-center mb-4">
                <p className="text-xs text-slate-500">명소</p>
                <p className="text-sm font-medium text-slate-700">
                  {arrivalPort.landmark}
                </p>
              </div>
            )}

            {/* 스탬프 효과 */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                         text-red-500/20 text-9xl font-bold transform rotate-[-15deg]
                         transition-all duration-500 ${showStamp ? "scale-100" : "scale-0"}`}
              style={{ fontFamily: "serif" }}
            >
              ✓
            </div>

            {/* 날짜 */}
            <div className="text-center border-t-2 border-dashed border-amber-300 pt-4 mt-4">
              <p className="text-xs text-amber-600">
                {new Date().toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* 새 항구 해금 뱃지 */}
          {isNewPort && (
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              NEW!
            </div>
          )}
        </div>

        {/* 잠항 요약 */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 w-full max-w-sm">
          <h3 className="text-center text-sm text-blue-300/80 mb-3">잠항 요약</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-blue-200/60">출발</p>
              <p className="text-2xl">{departurePort.countryFlag}</p>
              <p className="text-xs text-white">{departurePort.nameKo}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200/60">거리</p>
              <p className="text-lg font-bold text-cyan-400">
                {distance.toLocaleString()}km
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-200/60">시간</p>
              <p className="text-lg font-bold text-white">
                {selectedDuration}분
              </p>
            </div>
          </div>
        </div>

        {/* 방문 현황 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-blue-300/60">
            총 <span className="text-cyan-400 font-bold">{visitedPorts.length}</span>개 항구 방문
          </p>
        </div>

        {/* 로그인 유도 배너 - 게스트에게만 표시 */}
        {!isAuthenticated && (
          <div className="mt-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-cyan-400/30 w-full max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">
                  로그인하면 기록이 저장됩니다!
                </p>
                <p className="text-xs text-blue-300/60 mb-3">
                  통계, 업적, 잠항 기록을 안전하게 보관하세요
                </p>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  지금 로그인 →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="p-6 space-y-3">
        <button
          onClick={handleNewVoyage}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all
            bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:from-blue-400 hover:to-cyan-400"
        >
          바로 새 잠항 시작 🤿
        </button>

        <div className="flex gap-3">
          <ShareButton
            onShare={handleShare}
            label="공유"
            className="flex-1"
          />
          <button
            onClick={handleGoHome}
            className="flex-1 py-3 rounded-xl font-medium text-blue-200/70
                       bg-white/10 border border-white/20
                       hover:bg-white/20 hover:text-white transition-all"
          >
            홈으로
          </button>
        </div>
      </div>

      {/* 업적 달성 모달 */}
      {showAchievements && newAchievements.length > 0 && (
        <AchievementUnlock
          achievements={newAchievements}
          onClose={handleAchievementsClose}
        />
      )}

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
