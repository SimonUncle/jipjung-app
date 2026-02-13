"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ClimbFocusData, VoyageTicket } from "@/types";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { WeeklyChart } from "@/components/stats/WeeklyChart";
import { CategoryChart } from "@/components/stats/CategoryChart";
import { AchievementGrid } from "@/components/stats/AchievementGrid";
import { PortUnlockProgress } from "@/components/stats/PortUnlockProgress";
import { TicketCard } from "@/components/collection/TicketCard";
import { ArrowLeft, BarChart3, MapPin, Clock, Flame, Share2, Ticket, Trophy, User, Lock } from "lucide-react";
import { SubmarineIcon } from "@/components/submarine/SubmarineIcon";
import { shareStats } from "@/lib/shareUtils";

type TabType = "stats" | "history" | "achievements";

export default function StatsPage() {
  const router = useRouter();
  const { data, isLoaded } = useLocalStorage();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabType>("stats");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleShare = async () => {
    await shareStats(
      data.stats?.completedSessions || 0,
      data.stats?.totalFocusMinutes || 0,
      data.visitedPorts?.length || 1,
      data.streak?.longestStreak || 0
    );
  };

  if (!isLoaded || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 비로그인 사용자에게 로그인 유도 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
        {/* 헤더 */}
        <header className="sticky top-0 z-10 bg-black/30 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => router.push("/")}
              className="p-2.5 -ml-2 rounded-full hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              내 기록
            </h1>
            <div className="w-9" />
          </div>
        </header>

        {/* 로그인 유도 화면 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-white/30" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">로그인이 필요합니다</h2>
          <p className="text-blue-300/60 text-center mb-8 max-w-xs">
            잠항 기록, 통계, 업적을 확인하려면 로그인하세요.
            로그인하면 모든 기록이 안전하게 저장됩니다.
          </p>

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2
                bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:from-blue-400 hover:to-cyan-400"
            >
              <User className="w-5 h-5" />
              로그인
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-xl font-medium text-blue-200/70
                bg-white/10 border border-white/20
                hover:bg-white/20 hover:text-white transition-all"
            >
              홈으로 돌아가기
            </button>
          </div>

          {/* 게스트 기능 안내 */}
          <div className="mt-12 bg-white/5 rounded-xl p-4 border border-white/10 max-w-xs">
            <p className="text-xs text-blue-300/60 text-center mb-3">
              게스트로도 잠항은 가능해요!
            </p>
            <div className="flex justify-center gap-4 text-center">
              <div>
                <SubmarineIcon size={24} className="text-cyan-400 mx-auto mb-1" />
                <p className="text-xs text-white/60">잠항하기</p>
              </div>
              <div className="text-white/20">→</div>
              <div>
                <BarChart3 className="w-6 h-6 text-white/30 mx-auto mb-1" />
                <p className="text-xs text-white/30">기록 저장</p>
              </div>
            </div>
          </div>
        </div>

        {/* 로그인 모달 */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
    );
  }

  const totalHours = Math.floor((data.stats?.totalFocusMinutes || 0) / 60);
  const totalMinutes = (data.stats?.totalFocusMinutes || 0) % 60;
  const tickets = [...(data.voyageHistory || [])].reverse(); // 최신순

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.push("/")}
            className="p-2.5 -ml-2 rounded-full hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            내 기록
          </h1>
          <button
            onClick={handleShare}
            className="p-2.5 -mr-2 rounded-full hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex px-4 pb-2 gap-2">
          <TabButton
            active={activeTab === "stats"}
            onClick={() => setActiveTab("stats")}
            icon={<BarChart3 className="w-4 h-4" />}
            label="통계"
          />
          <TabButton
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
            icon={<Ticket className="w-4 h-4" />}
            label="잠항기록"
            badge={tickets.length > 0 ? tickets.length : undefined}
          />
          <TabButton
            active={activeTab === "achievements"}
            onClick={() => setActiveTab("achievements")}
            icon={<Trophy className="w-4 h-4" />}
            label="업적"
          />
        </div>
      </header>

      {/* 탭 컨텐츠 */}
      <div className="px-4 py-4">
        {activeTab === "stats" && (
          <StatsTab
            data={data}
            totalHours={totalHours}
            totalMinutes={totalMinutes}
          />
        )}
        {activeTab === "history" && (
          <HistoryTab tickets={tickets} router={router} />
        )}
        {activeTab === "achievements" && (
          <AchievementsTab data={data} />
        )}
      </div>
    </div>
  );
}

// 탭 버튼 컴포넌트
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function TabButton({ active, onClick, icon, label, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all min-h-[44px]
        ${active
          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
          : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10"
        }`}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && (
        <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
          active ? "bg-cyan-400/30" : "bg-white/20"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// 통계 탭
interface StatsTabProps {
  data: ClimbFocusData;
  totalHours: number;
  totalMinutes: number;
}

function StatsTab({ data, totalHours, totalMinutes }: StatsTabProps) {
  return (
    <div className="space-y-4">
      {/* 주요 통계 */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<SubmarineIcon size={20} />}
          label="총 잠항"
          value={data.stats?.completedSessions || 0}
          unit="회"
          color="cyan"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="총 집중 시간"
          value={totalHours}
          unit={`시간 ${totalMinutes}분`}
          color="blue"
        />
        <StatCard
          icon={<MapPin className="w-5 h-5" />}
          label="방문 항구"
          value={data.visitedPorts?.length || 1}
          unit="곳"
          color="green"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="최장 연속"
          value={data.streak?.longestStreak || 0}
          unit="일"
          color="orange"
        />
      </div>

      {/* 주간 차트 */}
      <WeeklyChart weeklyFocus={data.weeklyFocus || []} />

      {/* 카테고리별 통계 */}
      <CategoryChart tickets={data.voyageHistory || []} />

      {/* 추가 통계 */}
      <div className="bg-black/20 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white/80 mb-3">상세 통계</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">현재 연속 기록</span>
            <span className="text-white">{data.streak?.currentStreak || 0}일</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">실패한 잠항</span>
            <span className="text-white">{data.stats?.failedSessions || 0}회</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">최장 단일 집중</span>
            <span className="text-white">{data.stats?.longestSession || 0}분</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">해금된 항구</span>
            <span className="text-white">{data.unlocks?.ports?.length || 3}개</span>
          </div>
        </div>
      </div>

      {/* 항구 해금 진행률 */}
      <PortUnlockProgress data={data} />
    </div>
  );
}

// 잠항기록 탭
interface HistoryTabProps {
  tickets: VoyageTicket[];
  router: ReturnType<typeof useRouter>;
}

function HistoryTab({ tickets, router }: HistoryTabProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-16">
        <SubmarineIcon size={64} className="text-white/20 mx-auto mb-4" />
        <p className="text-white/50 mb-2">아직 잠항 기록이 없습니다</p>
        <p className="text-white/30 text-sm">첫 잠항을 시작해보세요!</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-6 py-2 bg-cyan-500 text-white rounded-full font-medium
                   hover:bg-cyan-400 transition-colors"
        >
          잠항 시작하기
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}

// 업적 탭
interface AchievementsTabProps {
  data: ClimbFocusData;
}

function AchievementsTab({ data }: AchievementsTabProps) {
  return (
    <div className="space-y-4">
      <AchievementGrid data={data} />
    </div>
  );
}

// StatCard 컴포넌트
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: "cyan" | "blue" | "green" | "orange";
}

function StatCard({ icon, label, value, unit, color }: StatCardProps) {
  const colorClasses = {
    cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-400/30 text-cyan-400",
    blue: "from-blue-500/20 to-blue-600/20 border-blue-400/30 text-blue-400",
    green: "from-green-500/20 to-green-600/20 border-green-400/30 text-green-400",
    orange: "from-orange-500/20 to-orange-600/20 border-orange-400/30 text-orange-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4`}
    >
      <div className={`${colorClasses[color].split(" ").pop()} mb-2`}>{icon}</div>
      <div className="text-xs text-white/60 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">
        {value}
        <span className="text-sm font-normal text-white/60 ml-1">{unit}</span>
      </div>
    </div>
  );
}
