"use client";

import { isSupabaseConfigured } from "./supabase";
import { VoyageTicket, ClimbFocusData } from "@/types";

/** 서버 API를 통해 동기화 (service role key로 RLS 우회) */
async function syncApi(body: Record<string, unknown>) {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[sync]", err.error || res.status);
  }
}

/** 잠항 완료 시 voyage 레코드를 Supabase에 저장 */
export async function syncVoyage(_userId: string, ticket: VoyageTicket, _email?: string | null) {
  if (!isSupabaseConfigured) return;
  try {
    await syncApi({ action: "voyage", ticket });
  } catch (e) {
    console.error("[sync] voyage error:", e);
  }
}

/** 유저 통계를 Supabase에 upsert */
export async function syncUserStats(_userId: string, data: ClimbFocusData, _email?: string | null) {
  if (!isSupabaseConfigured) return;
  try {
    await syncApi({ action: "stats", stats: data.stats, streak: data.streak });
  } catch (e) {
    console.error("[sync] stats error:", e);
  }
}

/** 로그인/세션 복원 시 미동기화 잠항 기록 전체 동기화 */
export async function fullSync(_userId: string, data: ClimbFocusData, _email?: string | null) {
  if (!isSupabaseConfigured) return;
  try {
    await syncApi({
      action: "fullSync",
      voyageHistory: data.voyageHistory || [],
      stats: data.stats,
      streak: data.streak,
    });
  } catch (e) {
    console.error("[sync] full sync error:", e);
  }
}
