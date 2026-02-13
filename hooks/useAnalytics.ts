"use client";

import { useCallback, useRef, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";

function getSessionId(): string {
  if (typeof sessionStorage === "undefined") return "";
  let id = sessionStorage.getItem("analytics_sid");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("analytics_sid", id);
  }
  return id;
}

export function useAnalytics() {
  const { user } = useAuthContext();
  const sessionId = useRef("");

  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  const track = useCallback(
    (eventType: string, eventData?: Record<string, unknown>) => {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          eventData,
          sessionId: sessionId.current,
          userId: user?.id ?? null,
        }),
      }).catch(() => {});
    },
    [user?.id]
  );

  return { track };
}
