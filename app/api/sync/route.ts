import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    // 1. 인증 확인 (쿠키에서 세션)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "not configured" }, { status: 503 });
    }

    const supabaseAuth = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    });

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 2. Service role client (RLS 우회)
    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "service client not configured" }, { status: 503 });
    }

    const body = await request.json();
    const { action } = body;

    // 3. users 행 보장
    const { error: userError } = await supabase.from("users").upsert(
      { id: user.id, email: user.email || null },
      { onConflict: "id" }
    );
    if (userError) console.error("[sync-api] ensureUser:", userError.message);

    // user_stats 행 보장
    await supabase.from("user_stats").upsert(
      { user_id: user.id },
      { onConflict: "user_id" }
    );

    // 4. 액션별 처리
    if (action === "voyage") {
      const { ticket } = body;
      if (ticket) {
        const { error } = await supabase.from("voyages").upsert({
          id: ticket.id,
          user_id: user.id,
          departure_port: ticket.departurePortId,
          arrival_port: ticket.arrivalPortId,
          duration: ticket.duration,
          distance: ticket.distance,
          cabin_number: ticket.cabinNumber || null,
          focus_purpose: ticket.focusPurposeText || ticket.focusPurposeId || null,
          completed_at: ticket.date,
        });
        if (error) console.error("[sync-api] voyage:", error.message);
      }
    }

    if (action === "stats") {
      const { stats, streak } = body;
      if (stats) {
        const { error } = await supabase.from("user_stats").upsert({
          user_id: user.id,
          total_focus_minutes: stats.totalFocusMinutes || 0,
          completed_sessions: stats.completedSessions || 0,
          failed_sessions: stats.failedSessions || 0,
          longest_session: stats.longestSession || 0,
          current_streak: streak?.currentStreak || 0,
          longest_streak: streak?.longestStreak || 0,
          last_active_date: streak?.lastActiveDate || null,
          updated_at: new Date().toISOString(),
        });
        if (error) console.error("[sync-api] stats:", error.message);

        await supabase.from("users")
          .update({ last_synced_at: new Date().toISOString() })
          .eq("id", user.id);
      }
    }

    if (action === "fullSync") {
      const { voyageHistory, stats, streak } = body;

      // 기존 voyage ID 조회
      const { data: existing } = await supabase
        .from("voyages").select("id").eq("user_id", user.id);
      const existingIds = new Set((existing || []).map((v: { id: string }) => v.id));

      // 미동기화 잠항 upsert
      const newVoyages = (voyageHistory || []).filter((t: { id: string }) => !existingIds.has(t.id));
      if (newVoyages.length > 0) {
        const rows = newVoyages.map((t: { id: string; departurePortId: string; arrivalPortId: string; duration: number; distance: number; cabinNumber?: string; focusPurposeText?: string; focusPurposeId?: string; date: string }) => ({
          id: t.id,
          user_id: user.id,
          departure_port: t.departurePortId,
          arrival_port: t.arrivalPortId,
          duration: t.duration,
          distance: t.distance,
          cabin_number: t.cabinNumber || null,
          focus_purpose: t.focusPurposeText || t.focusPurposeId || null,
          completed_at: t.date,
        }));
        const { error } = await supabase.from("voyages").upsert(rows);
        if (error) console.error("[sync-api] bulk voyages:", error.message);
      }

      // stats 동기화
      if (stats) {
        await supabase.from("user_stats").upsert({
          user_id: user.id,
          total_focus_minutes: stats.totalFocusMinutes || 0,
          completed_sessions: stats.completedSessions || 0,
          failed_sessions: stats.failedSessions || 0,
          longest_session: stats.longestSession || 0,
          current_streak: streak?.currentStreak || 0,
          longest_streak: streak?.longestStreak || 0,
          last_active_date: streak?.lastActiveDate || null,
          updated_at: new Date().toISOString(),
        });

        await supabase.from("users")
          .update({ last_synced_at: new Date().toISOString() })
          .eq("id", user.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[sync-api] error:", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
