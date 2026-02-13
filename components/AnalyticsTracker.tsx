"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const { track } = useAnalytics();
  const lastPath = useRef("");

  useEffect(() => {
    if (pathname && pathname !== lastPath.current) {
      lastPath.current = pathname;
      track("page_view", { page: pathname });
    }
  }, [pathname, track]);

  return null;
}
