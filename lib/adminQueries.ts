"use client";

import { supabase, isSupabaseConfigured } from "./supabase";

// ============================================
// 트래픽 개요
// ============================================

export interface TrafficOverview {
  visitors: number; // distinct session_id
  pageViews: number;
  pageBreakdown: { page: string; count: number }[];
}

export async function getTrafficOverview(days: number): Promise<TrafficOverview> {
  if (!isSupabaseConfigured) return { visitors: 0, pageViews: 0, pageBreakdown: [] };

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString();

  // 페이지뷰 이벤트 가져오기
  const { data: events } = await supabase
    .from("analytics_events")
    .select("session_id, event_data")
    .eq("event_type", "page_view")
    .gte("created_at", sinceStr);

  const rows = events || [];
  const sessionIds = new Set(rows.map((e) => e.session_id).filter(Boolean));
  const pageViews = rows.length;

  // 페이지별 카운트
  const pageCounts: Record<string, number> = {};
  rows.forEach((e) => {
    const page = (e.event_data as Record<string, string>)?.page || "unknown";
    pageCounts[page] = (pageCounts[page] || 0) + 1;
  });

  const pageBreakdown = Object.entries(pageCounts)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count);

  return { visitors: sessionIds.size, pageViews, pageBreakdown };
}

// ============================================
// 잠항 분석
// ============================================

export interface VoyageAnalytics {
  completed: number;
  failed: number;
  completionRate: number;
  avgDuration: number;
  popularRoutes: { from: string; to: string; count: number }[];
  popularPurposes: { purpose: string; count: number }[];
}

export async function getVoyageAnalytics(days: number): Promise<VoyageAnalytics> {
  if (!isSupabaseConfigured)
    return { completed: 0, failed: 0, completionRate: 0, avgDuration: 0, popularRoutes: [], popularPurposes: [] };

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString();

  // 완료된 잠항
  const { data: voyages } = await supabase
    .from("voyages")
    .select("departure_port, arrival_port, duration, focus_purpose")
    .gte("completed_at", sinceStr);

  const completed = voyages?.length || 0;

  // 실패 이벤트
  const { data: failEvents } = await supabase
    .from("analytics_events")
    .select("id")
    .eq("event_type", "voyage_fail")
    .gte("created_at", sinceStr);

  const failed = failEvents?.length || 0;
  const total = completed + failed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // 평균 집중 시간
  const avgDuration =
    completed > 0 ? Math.round(voyages!.reduce((sum, v) => sum + v.duration, 0) / completed) : 0;

  // 인기 항로
  const routeCounts: Record<string, number> = {};
  voyages?.forEach((v) => {
    const key = `${v.departure_port}→${v.arrival_port}`;
    routeCounts[key] = (routeCounts[key] || 0) + 1;
  });
  const popularRoutes = Object.entries(routeCounts)
    .map(([route, count]) => {
      const [from, to] = route.split("→");
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 인기 집중 목적
  const purposeCounts: Record<string, number> = {};
  voyages?.forEach((v) => {
    if (v.focus_purpose) {
      purposeCounts[v.focus_purpose] = (purposeCounts[v.focus_purpose] || 0) + 1;
    }
  });
  const popularPurposes = Object.entries(purposeCounts)
    .map(([purpose, count]) => ({ purpose, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { completed, failed, completionRate, avgDuration, popularRoutes, popularPurposes };
}

// ============================================
// 유저 관리
// ============================================

export interface UserRow {
  id: string;
  email: string | null;
  nickname: string | null;
  created_at: string;
  last_synced_at: string | null;
  total_focus_minutes: number;
  completed_sessions: number;
  current_streak: number;
}

export async function getUserList(): Promise<UserRow[]> {
  if (!isSupabaseConfigured) return [];

  const { data: users } = await supabase
    .from("users")
    .select("id, email, nickname, created_at, last_synced_at")
    .order("created_at", { ascending: false });

  if (!users?.length) return [];

  // user_stats 가져오기
  const userIds = users.map((u) => u.id);
  const { data: stats } = await supabase
    .from("user_stats")
    .select("user_id, total_focus_minutes, completed_sessions, current_streak")
    .in("user_id", userIds);

  const statsMap = new Map(stats?.map((s) => [s.user_id, s]) || []);

  return users.map((u) => {
    const s = statsMap.get(u.id);
    return {
      id: u.id,
      email: u.email,
      nickname: u.nickname,
      created_at: u.created_at,
      last_synced_at: u.last_synced_at,
      total_focus_minutes: s?.total_focus_minutes || 0,
      completed_sessions: s?.completed_sessions || 0,
      current_streak: s?.current_streak || 0,
    };
  });
}

// ============================================
// 총 유저 수
// ============================================

export async function getUserCounts(): Promise<{ total: number; today: number; week: number; month: number }> {
  if (!isSupabaseConfigured) return { total: 0, today: 0, week: 0, month: 0 };

  const now = new Date();
  const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStr = new Date(now.getTime() - 7 * 86400000).toISOString();
  const monthStr = new Date(now.getTime() - 30 * 86400000).toISOString();

  const { data: users } = await supabase
    .from("users")
    .select("created_at")
    .order("created_at", { ascending: false });

  const all = users || [];
  return {
    total: all.length,
    today: all.filter((u) => u.created_at >= todayStr).length,
    week: all.filter((u) => u.created_at >= weekStr).length,
    month: all.filter((u) => u.created_at >= monthStr).length,
  };
}
