"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getTrafficOverview,
  getVoyageAnalytics,
  getUserList,
  getUserCounts,
  TrafficOverview,
  VoyageAnalytics,
  UserRow,
} from "@/lib/adminQueries";
import { BarChart3, Ship, Users, RefreshCw, ArrowLeft, Globe, Clock, Target, TrendingUp } from "lucide-react";

type Period = 1 | 7 | 30;

export default function AdminPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>(7);
  const [loading, setLoading] = useState(true);

  const [traffic, setTraffic] = useState<TrafficOverview | null>(null);
  const [voyageStats, setVoyageStats] = useState<VoyageAnalytics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userCounts, setUserCounts] = useState({ total: 0, today: 0, week: 0, month: 0 });

  const fetchData = async (days: Period) => {
    setLoading(true);
    try {
      const [t, v, u, uc] = await Promise.all([
        getTrafficOverview(days),
        getVoyageAnalytics(days),
        getUserList(),
        getUserCounts(),
      ]);
      setTraffic(t);
      setVoyageStats(v);
      setUsers(u);
      setUserCounts(uc);
    } catch (e) {
      console.error("Admin fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const maxPageCount = traffic?.pageBreakdown?.[0]?.count || 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="text-blue-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* 기간 선택 */}
            {([1, 7, 30] as Period[]).map((d) => (
              <button
                key={d}
                onClick={() => setPeriod(d)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  period === d
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-blue-300 hover:bg-white/20"
                }`}
              >
                {d === 1 ? "Today" : `${d}D`}
              </button>
            ))}
            <button
              onClick={() => fetchData(period)}
              className="ml-2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-blue-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* ============================================ */}
        {/* 섹션 1: 트래픽 개요 */}
        {/* ============================================ */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold">Traffic</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard
              icon={<Globe className="w-4 h-4" />}
              label="Visitors"
              value={traffic?.visitors ?? "-"}
              color="cyan"
            />
            <StatCard
              icon={<BarChart3 className="w-4 h-4" />}
              label="Page Views"
              value={traffic?.pageViews ?? "-"}
              color="blue"
            />
          </div>

          {/* 페이지별 방문 비율 */}
          {traffic && traffic.pageBreakdown.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-blue-300/60 mb-3">Pages</p>
              <div className="space-y-2">
                {traffic.pageBreakdown.map((p) => (
                  <div key={p.page} className="flex items-center gap-3">
                    <span className="text-xs text-blue-200/70 w-24 truncate">{p.page}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(p.count / maxPageCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60 w-8 text-right">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ============================================ */}
        {/* 섹션 2: 잠항 분석 */}
        {/* ============================================ */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Ship className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold">Voyages</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard
              icon={<Target className="w-4 h-4" />}
              label="Completed"
              value={voyageStats?.completed ?? "-"}
              color="green"
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Completion Rate"
              value={voyageStats ? `${voyageStats.completionRate}%` : "-"}
              color="blue"
            />
            <StatCard
              icon={<Clock className="w-4 h-4" />}
              label="Avg Duration"
              value={voyageStats ? `${voyageStats.avgDuration}m` : "-"}
              color="purple"
            />
            <StatCard
              icon={<Ship className="w-4 h-4" />}
              label="Failed"
              value={voyageStats?.failed ?? "-"}
              color="red"
            />
          </div>

          {/* 인기 항로 */}
          {voyageStats && voyageStats.popularRoutes.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-3">
              <p className="text-xs text-blue-300/60 mb-3">Popular Routes</p>
              <div className="space-y-2">
                {voyageStats.popularRoutes.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-blue-200/80">
                      {r.from} → {r.to}
                    </span>
                    <span className="text-cyan-400 font-medium">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 인기 집중 목적 */}
          {voyageStats && voyageStats.popularPurposes.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-blue-300/60 mb-3">Popular Purposes</p>
              <div className="space-y-2">
                {voyageStats.popularPurposes.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-blue-200/80">{p.purpose}</span>
                    <span className="text-cyan-400 font-medium">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ============================================ */}
        {/* 섹션 3: 유저 관리 */}
        {/* ============================================ */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold">Users</h2>
          </div>

          {/* 가입자 수 */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <MiniStat label="Total" value={userCounts.total} />
            <MiniStat label="Today" value={userCounts.today} />
            <MiniStat label="7D" value={userCounts.week} />
            <MiniStat label="30D" value={userCounts.month} />
          </div>

          {/* 유저 목록 */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-blue-300/60">
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Joined</th>
                    <th className="text-right p-3">Focus</th>
                    <th className="text-right p-3">Done</th>
                    <th className="text-right p-3">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3 text-blue-200/80 max-w-[160px] truncate">
                        {u.email || u.nickname || "Unknown"}
                      </td>
                      <td className="p-3 text-blue-200/50">
                        {new Date(u.created_at).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-3 text-right text-white">
                        {u.total_focus_minutes}m
                      </td>
                      <td className="p-3 text-right text-cyan-400">
                        {u.completed_sessions}
                      </td>
                      <td className="p-3 text-right text-amber-400">
                        {u.current_streak > 0 ? `${u.current_streak}d` : "-"}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-blue-300/40">
                        No users yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 하단 여백 */}
        <div className="h-8" />
      </div>
    </div>
  );
}

// ============================================
// 공통 컴포넌트
// ============================================

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
    green: "from-green-500/20 to-green-500/5 border-green-500/20",
    red: "from-red-500/20 to-red-500/5 border-red-500/20",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color] || colorMap.blue} rounded-xl p-4 border`}>
      <div className="flex items-center gap-2 mb-2 text-blue-300/60">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
      <p className="text-xs text-blue-300/60 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
