"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortSelector } from "@/components/voyage/PortSelector";
import { FocusPurposeModal } from "@/components/voyage/FocusPurposeModal";
import { CabinGrid } from "@/components/voyage/CabinGrid";
import { BoardingPass } from "@/components/voyage/BoardingPass";
import { useVoyageStore, StoredFocusPurpose } from "@/stores/voyageStore";
import { useBookingStore } from "@/stores/bookingStore";
import { useUnlockStore } from "@/stores/unlockStore";
import { Port, getPortById, DEFAULT_PORT } from "@/lib/ports";
import { getDistanceBetween, distanceToMinutes } from "@/lib/routes";
import { getSeaRoute } from "@/lib/seaRoutes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatMinutes } from "@/hooks/useTimer";
import { FocusPurpose } from "@/lib/focusPurposes";
import { Anchor, BarChart3, Clock, Settings, User, LogOut } from "lucide-react";
import { SubmarineIcon } from "@/components/submarine/SubmarineIcon";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { StreakBadge } from "@/components/home/StreakBadge";
import { GoalProgress } from "@/components/home/GoalProgress";
import { GoalSettingModal } from "@/components/home/GoalSettingModal";
import { QuickStart } from "@/components/home/QuickStart";

type BookingStep = "idle" | "purpose" | "cabin" | "confirm";

export default function HomePage() {
  const router = useRouter();
  const { data, isLoaded, setGoals } = useLocalStorage();
  const { user, isAuthenticated, signOut, isLoading: authLoading } = useAuthContext();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const {
    selectRoute,
    setCabinNumber,
    setFocusPurpose,
    setSeaRoute,
    startVoyage,
  } = useVoyageStore();

  // 예약 선택 상태 (페이지 이동해도 유지)
  const {
    bookingDeparturePort,
    bookingDestinationPort,
    bookingCustomMinutes,
    bookingIsCustomTime,
    setBookingDeparturePort,
    setBookingDestinationPort,
    setBookingCustomMinutes,
    setBookingIsCustomTime,
  } = useBookingStore();

  // 해금 상태
  const { initFromStorage } = useUnlockStore();

  // Use data from localStorage for persistence
  const unlockedPorts = data.unlocks?.ports || ["busan", "osaka", "tokyo"];
  const visitedPorts = data.visitedPorts || ["busan"];

  // Sync voyage store from localStorage on mount
  useEffect(() => {
    if (isLoaded) {
      initFromStorage();
    }
  }, [isLoaded, initFromStorage]);

  // 예약 선택 상태 (store에서 가져옴 - 페이지 이동해도 유지)
  const departurePort = bookingDeparturePort;
  const destinationPort = bookingDestinationPort;
  const isCustomTime = bookingIsCustomTime;
  const customMinutes = bookingCustomMinutes;

  // 거리 계산
  const distance = destinationPort && departurePort
    ? getDistanceBetween(departurePort.id, destinationPort.id)
    : 0;

  // 시간 계산 (거리 기반 or 커스텀)
  const calculatedDuration = distance > 0 ? distanceToMinutes(distance) : 25;
  const selectedDuration = isCustomTime ? customMinutes : calculatedDuration;

  // Booking flow state
  const [bookingStep, setBookingStep] = useState<BookingStep>("idle");
  const [selectedPurpose, setSelectedPurpose] = useState<StoredFocusPurpose | null>(null);
  const [customPurposeText, setCustomPurposeText] = useState<string | null>(null);
  const [selectedCabinNumber, setSelectedCabinNumber] = useState<string | null>(null);

  // 마지막 방문 항구를 기본 출발지로 설정 (출발 항구가 없을 때만)
  useEffect(() => {
    if (!bookingDeparturePort && visitedPorts.length > 0) {
      const lastVisited = visitedPorts[visitedPorts.length - 1];
      const port = getPortById(lastVisited);
      if (port && unlockedPorts.includes(port.id)) {
        setBookingDeparturePort(port);
      }
    }
  }, [visitedPorts, unlockedPorts, bookingDeparturePort, setBookingDeparturePort]);

  const handleStartBooking = () => {
    if (!destinationPort) return;
    setBookingStep("purpose");
  };

  const handleSelectPurpose = (purpose: FocusPurpose, customText?: string) => {
    setSelectedPurpose({ id: purpose.id, labelKo: purpose.labelKo });
    setCustomPurposeText(customText ?? null);
    setBookingStep("cabin");
  };

  const handleSelectCabin = (cabinNumber: string) => {
    setSelectedCabinNumber(cabinNumber);
    setBookingStep("confirm");
  };

  const handleConfirmVoyage = async () => {
    if (!destinationPort || !departurePort || !selectedPurpose || !selectedCabinNumber) return;

    // 바다 경로 계산
    const seaRoute = await getSeaRoute(departurePort, destinationPort);
    setSeaRoute(seaRoute);

    selectRoute(departurePort, destinationPort, selectedDuration, 0);
    setCabinNumber(selectedCabinNumber);
    setFocusPurpose(selectedPurpose, customPurposeText ?? undefined);
    startVoyage();
    router.push("/voyage");
  };

  const handleCancelBooking = () => {
    setBookingStep("idle");
    setSelectedPurpose(null);
    setCustomPurposeText(null);
    setSelectedCabinNumber(null);
  };

  const handleBackToPurpose = () => {
    setBookingStep("purpose");
    setSelectedCabinNumber(null);
  };

  const handleBackToCabin = () => {
    setBookingStep("cabin");
  };

  // 퀵스타트 핸들러 (마지막 잠항 설정으로 바로 출항)
  const handleQuickStart = async () => {
    const lastVoyage = data.voyageHistory?.[data.voyageHistory.length - 1];
    if (!lastVoyage || !departurePort) return;

    const lastDestination = getPortById(lastVoyage.arrivalPortId);
    if (!lastDestination) return;

    // 바다 경로 계산
    const seaRoute = await getSeaRoute(departurePort, lastDestination);
    setSeaRoute(seaRoute);

    // 마지막 설정 사용
    selectRoute(departurePort, lastDestination, lastVoyage.duration, 0);
    setCabinNumber(lastVoyage.cabinNumber || "A1");
    if (lastVoyage.focusPurposeId) {
      setFocusPurpose(
        { id: lastVoyage.focusPurposeId, labelKo: lastVoyage.focusPurposeText || "" },
        lastVoyage.focusPurposeText
      );
    }
    startVoyage();
    router.push("/voyage");
  };

  // 마지막 목적지 가져오기
  const lastVoyage = data.voyageHistory?.[data.voyageHistory.length - 1];
  const lastDestination = lastVoyage ? getPortById(lastVoyage.arrivalPortId) : null;

  // 주간 집중 시간 계산
  const weeklyMinutes = data.weeklyFocus?.reduce((sum, r) => sum + r.focusMinutes, 0) || 0;

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-900 to-blue-950">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 min-h-screen">
      {/* Header */}
      <header className="pt-8 pb-4 px-4 sm:px-6 safe-area-top">
        {/* 로그인 버튼 */}
        <div className="flex justify-end mb-2">
          {isAuthenticated ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-sm text-white/70 hover:text-white bg-white/10 rounded-full transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="max-w-[100px] truncate">{user?.email?.split("@")[0]}</span>
              <LogOut className="w-3 h-3 ml-1" />
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-sm text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 rounded-full transition-colors"
            >
              <User className="w-4 h-4" />
              로그인
            </button>
          )}
        </div>

        {/* 타이틀 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <SubmarineIcon size={28} className="text-cyan-400" />
            <h1 className="text-3xl font-bold">
              <span className="text-white">Focus</span>
              <span className="text-cyan-400"> Submarine</span>
            </h1>
          </div>
          {/* 스트릭 배지 */}
          <StreakBadge currentStreak={data.streak?.currentStreak || 0} />
        </div>
      </header>

      {/* 목표 진행률 */}
      <div className="px-4 sm:px-6 mb-4">
        <GoalProgress
          todayMinutes={data.todayStats?.focusMinutes || 0}
          dailyGoal={data.goals?.dailyMinutes || 60}
          weeklyMinutes={weeklyMinutes}
          weeklyGoal={data.goals?.weeklyMinutes || 300}
          onEditGoal={() => setShowGoalModal(true)}
        />
      </div>

      {/* 출발 항구 선택 */}
      <div className="px-4 sm:px-6 mb-4">
        <PortSelector
          label="출발 항구"
          selectedPort={departurePort}
          unlockedPorts={unlockedPorts}
          excludePort={destinationPort}
          totalFocusMinutes={data.stats.totalFocusMinutes}
          onSelect={setBookingDeparturePort}
        />
      </div>

      {/* Route selection */}
      <div className="flex-1 px-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* 목적지 선택 */}
        <PortSelector
          label="목적지"
          selectedPort={destinationPort}
          unlockedPorts={unlockedPorts}
          excludePort={departurePort}
          totalFocusMinutes={data.stats.totalFocusMinutes}
          onSelect={setBookingDestinationPort}
        />

        {/* 잠항 정보 - 거리 & 시간 */}
        {destinationPort && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <Anchor className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-300/60">잠항 거리</p>
                  <p className="text-lg font-semibold text-white">
                    {distance.toLocaleString()} km
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-300/60">집중 시간</p>
                  <p className="text-lg font-semibold text-white">
                    {selectedDuration}분
                  </p>
                </div>
              </div>
            </div>

            {/* 커스텀 시간 토글 */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-300/60" />
                <span className="text-sm text-blue-300/60">직접 시간 설정</span>
              </div>
              <button
                onClick={() => setBookingIsCustomTime(!isCustomTime)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  isCustomTime ? "bg-cyan-500" : "bg-white/20"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    isCustomTime ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* 커스텀 시간 입력 */}
            {isCustomTime && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <label className="text-xs text-blue-300/60 block mb-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  집중 시간 (분)
                </label>
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setBookingCustomMinutes(Math.max(0.5, Math.min(180, parseFloat(e.target.value) || 0.5)))}
                  min={0.5}
                  max={180}
                  step={0.5}
                  className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-center text-lg"
                />
                <p className="text-xs text-blue-300/40 text-center mt-1">
                  0.5분(30초) ~ 180분
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Quick Start & Book button */}
      <div className="px-4 sm:px-6 pb-2 space-y-3">
        {/* 퀵스타트 버튼 (이전 잠항이 있을 때만 표시) */}
        {lastDestination && (
          <QuickStart
            lastDestination={lastDestination}
            onQuickStart={handleQuickStart}
          />
        )}

        {/* 승선권 발권 버튼 */}
        <button
          onClick={handleStartBooking}
          disabled={!destinationPort}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2
            ${
              destinationPort
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:from-blue-400 hover:to-cyan-400"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
        >
          <SubmarineIcon size={20} />
          {destinationPort ? "탑승권 발권" : "목적지를 선택하세요"}
        </button>
      </div>

      {/* Stats - 로그인 사용자에게만 표시 */}
      <div className="px-4 sm:px-6 py-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          {isAuthenticated ? (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-blue-300/60 mb-1">총 집중</p>
                <p className="font-semibold text-white">
                  {formatMinutes(data.stats.totalFocusMinutes)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-300/60 mb-1">잠항 완료</p>
                <p className="font-semibold text-white">
                  {data.stats.completedSessions}회
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-300/60 mb-1">방문 항구</p>
                <p className="font-semibold text-white">
                  {visitedPorts.length}곳
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-blue-300/60 hover:text-cyan-400 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">로그인하여 기록 확인</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation link */}
      <div className="px-4 sm:px-6 pb-8 safe-area-bottom">
        <button
          onClick={() => router.push("/stats")}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 min-h-[44px] rounded-xl
                   bg-white/5 border border-white/10 text-white/70
                   hover:bg-white/10 hover:text-white transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm">내 기록</span>
        </button>
      </div>

      {/* Focus Purpose Modal */}
      <FocusPurposeModal
        isOpen={bookingStep === "purpose"}
        cabinNumber={null}
        onSelect={handleSelectPurpose}
        onClose={handleCancelBooking}
      />

      {/* Cabin Selection Modal */}
      <CabinGrid
        isOpen={bookingStep === "cabin"}
        onSelect={handleSelectCabin}
        onClose={handleBackToPurpose}
      />

      {/* Boarding Pass Modal */}
      {bookingStep === "confirm" && destinationPort && departurePort && (
        <BoardingPass
          departurePort={departurePort}
          arrivalPort={destinationPort}
          duration={selectedDuration}
          cabinNumber={selectedCabinNumber}
          focusPurpose={selectedPurpose}
          customPurposeText={customPurposeText}
          onConfirm={handleConfirmVoyage}
          onCancel={handleBackToCabin}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Goal Setting Modal */}
      <GoalSettingModal
        isOpen={showGoalModal}
        currentDailyGoal={data.goals?.dailyMinutes || 60}
        currentWeeklyGoal={data.goals?.weeklyMinutes || 300}
        onSave={setGoals}
        onClose={() => setShowGoalModal(false)}
      />
    </div>
  );
}
