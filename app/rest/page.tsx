"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 휴식 페이지는 더 이상 사용하지 않음 - 홈으로 리다이렉트
export default function RestPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-900 to-blue-950">
      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
