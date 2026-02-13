import { createClient } from "@supabase/supabase-js";

/** 서버사이드 전용 Supabase 클라이언트 (Service Role Key 사용) */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
