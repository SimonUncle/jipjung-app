import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabaseServer";
import { ADMIN_EMAILS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  // 1. 인증 확인: 쿠키에서 세션 읽어 admin 이메일 체크
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const supabaseAuth = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  // 2. Service role client (RLS 우회)
  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "service client not configured" }, { status: 503 });
  }

  // 3. 기간 파라미터
  const days = parseInt(request.nextUrl.searchParams.get("days") || "7", 10);
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString();

  try {
    // ---- Traffic ----
    const { data: events } = await supabase
      .from("analytics_events")
      .select("session_id, event_data, created_at")
      .eq("event_type", "page_view")
      .gte("created_at", sinceStr);

    const allRows = events || [];

    // /admin 페이지 분리
    const userRows = allRows.filter((e: { event_data: Record<string, string> }) => e.event_data?.page !== "/admin");
    const adminRows = allRows.filter((e: { event_data: Record<string, string> }) => e.event_data?.page === "/admin");

    const sessionIds = new Set(userRows.map((e: { session_id: string }) => e.session_id).filter(Boolean));
    const pageViews = userRows.length;

    const pageCounts: Record<string, number> = {};
    userRows.forEach((e: { event_data: Record<string, string> }) => {
      const page = e.event_data?.page || "unknown";
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    const pageBreakdown = Object.entries(pageCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count);

    const traffic = { visitors: sessionIds.size, pageViews, pageBreakdown };

    // 어드민 활동
    const adminActivity = {
      visits: adminRows.length,
      lastVisit: adminRows.length > 0
        ? adminRows.sort((a: { created_at: string }, b: { created_at: string }) => b.created_at.localeCompare(a.created_at))[0].created_at
        : null,
    };

    // ---- Voyages (analytics_events 기반) ----
    const { data: completeEvents } = await supabase
      .from("analytics_events")
      .select("id, event_data")
      .eq("event_type", "voyage_complete")
      .gte("created_at", sinceStr);

    const { data: failEvents } = await supabase
      .from("analytics_events")
      .select("id")
      .eq("event_type", "voyage_fail")
      .gte("created_at", sinceStr);

    const completed = completeEvents?.length || 0;
    const failed = failEvents?.length || 0;
    const total = completed + failed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // event_data에서 duration, route, purpose 추출
    const avgDuration = completed > 0
      ? Math.round((completeEvents || []).reduce((sum: number, e: { event_data: Record<string, unknown> }) => sum + (Number(e.event_data?.duration) || 0), 0) / completed)
      : 0;

    const routeCounts: Record<string, number> = {};
    (completeEvents || []).forEach((e: { event_data: Record<string, unknown> }) => {
      const from = e.event_data?.from as string;
      const to = e.event_data?.to as string;
      if (from && to) {
        const key = `${from}→${to}`;
        routeCounts[key] = (routeCounts[key] || 0) + 1;
      }
    });
    const popularRoutes = Object.entries(routeCounts)
      .map(([route, count]) => {
        const [from, to] = route.split("→");
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const purposeCounts: Record<string, number> = {};
    (completeEvents || []).forEach((e: { event_data: Record<string, unknown> }) => {
      const purpose = e.event_data?.focusPurpose as string;
      if (purpose) {
        purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
      }
    });
    const popularPurposes = Object.entries(purposeCounts)
      .map(([purpose, count]) => ({ purpose, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const voyageStats = { completed, failed, completionRate, avgDuration, popularRoutes, popularPurposes };

    // ---- Users (auth.admin.listUsers로 직접 조회) ----
    const { data: { users: authUsers }, error: authUsersError } = await supabase.auth.admin.listUsers();
    if (authUsersError) console.error("[admin] listUsers error:", authUsersError.message);

    const allAuthUsers = (authUsers || []).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // user_stats 조인 (있으면 통계 표시, 없으면 0)
    const authUserIds = allAuthUsers.map(u => u.id);
    const { data: stats } = authUserIds.length > 0
      ? await supabase.from("user_stats").select("user_id, total_focus_minutes, completed_sessions, current_streak").in("user_id", authUserIds)
      : { data: [] };

    const statsMap = new Map((stats || []).map((s: { user_id: string }) => [s.user_id, s]));

    const userList = allAuthUsers.map(u => {
      const s = statsMap.get(u.id) as { total_focus_minutes?: number; completed_sessions?: number; current_streak?: number } | undefined;
      return {
        id: u.id,
        email: u.email || null,
        nickname: u.user_metadata?.nickname || null,
        created_at: u.created_at,
        last_synced_at: null,
        total_focus_minutes: s?.total_focus_minutes || 0,
        completed_sessions: s?.completed_sessions || 0,
        current_streak: s?.current_streak || 0,
      };
    });

    // User counts
    const now = new Date();
    const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStr = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthStr = new Date(now.getTime() - 30 * 86400000).toISOString();

    const userCounts = {
      total: allAuthUsers.length,
      today: allAuthUsers.filter(u => u.created_at >= todayStr).length,
      week: allAuthUsers.filter(u => u.created_at >= weekStr).length,
      month: allAuthUsers.filter(u => u.created_at >= monthStr).length,
    };

    return NextResponse.json({ traffic, voyageStats, users: userList, userCounts, adminActivity });
  } catch (e) {
    console.error("[admin] data fetch error:", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
