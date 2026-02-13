"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /collection → /stats (잠항기록 탭)으로 리다이렉트
export default function CollectionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/stats");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
