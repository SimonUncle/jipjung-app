"use client";

import { supabase, isSupabaseConfigured } from "./supabase";
import { VoyageTicket, ClimbFocusData } from "@/types";

/** 잠항 완료 시 voyage 레코드를 Supabase에 저장 */
export async function syncVoyage(userId: string, ticket: VoyageTicket) {
  if (!isSupabaseConfigured) return;

  try {
    await supabase.from("voyages").upsert({
      id: ticket.id,
      user_id: userId,
      departure_port: ticket.departurePortId,
      arrival_port: ticket.arrivalPortId,
      duration: ticket.duration,
      distance: ticket.distance,
      cabin_number: ticket.cabinNumber || null,
      focus_purpose: ticket.focusPurposeText || ticket.focusPurposeId || null,
      completed_at: ticket.date,
    });
  } catch (e) {
    console.error("[sync] voyage error:", e);
  }
}

/** 유저 통계를 Supabase에 upsert */
export async function syncUserStats(userId: string, data: ClimbFocusData) {
  if (!isSupabaseConfigured) return;

  try {
    await supabase.from("user_stats").upsert({
      user_id: userId,
      total_focus_minutes: data.stats.totalFocusMinutes,
      completed_sessions: data.stats.completedSessions,
      failed_sessions: data.stats.failedSessions,
      longest_session: data.stats.longestSession,
      current_streak: data.streak?.currentStreak || 0,
      longest_streak: data.streak?.longestStreak || 0,
      last_active_date: data.streak?.lastActiveDate || null,
      updated_at: new Date().toISOString(),
    });

    // users.last_synced_at 업데이트
    await supabase
      .from("users")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", userId);
  } catch (e) {
    console.error("[sync] stats error:", e);
  }
}

/** 로그인 시 미동기화 잠항 기록 전체 동기화 */
export async function fullSync(userId: string, data: ClimbFocusData) {
  if (!isSupabaseConfigured || !data.voyageHistory?.length) return;

  try {
    // 이미 동기화된 voyage ID 목록 가져오기
    const { data: existing } = await supabase
      .from("voyages")
      .select("id")
      .eq("user_id", userId);

    const existingIds = new Set((existing || []).map((v: { id: string }) => v.id));

    // 미동기화 잠항만 필터링
    const newVoyages = data.voyageHistory.filter((t) => !existingIds.has(t.id));

    if (newVoyages.length > 0) {
      const rows = newVoyages.map((t) => ({
        id: t.id,
        user_id: userId,
        departure_port: t.departurePortId,
        arrival_port: t.arrivalPortId,
        duration: t.duration,
        distance: t.distance,
        cabin_number: t.cabinNumber || null,
        focus_purpose: t.focusPurposeText || t.focusPurposeId || null,
        completed_at: t.date,
      }));

      await supabase.from("voyages").upsert(rows);
    }

    // 통계도 동기화
    await syncUserStats(userId, data);
  } catch (e) {
    console.error("[sync] full sync error:", e);
  }
}
