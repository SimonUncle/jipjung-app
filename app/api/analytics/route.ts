import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "not configured" }, { status: 503 });
    }

    const body = await request.json();
    const { eventType, eventData, sessionId, userId } = body;

    if (!eventType) {
      return NextResponse.json({ error: "eventType required" }, { status: 400 });
    }

    await supabase.from("analytics_events").insert({
      user_id: userId || null,
      event_type: eventType,
      event_data: eventData || {},
      session_id: sessionId || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
