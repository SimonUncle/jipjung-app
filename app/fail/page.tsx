"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVoyageStore } from "@/stores/voyageStore";

export default function FailPage() {
  const router = useRouter();
  const { status, departurePort, arrivalPort, resetVoyage } = useVoyageStore();
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // 애니메이션 후 버튼 표시
    setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
  }, []);

  // 실패 상태가 아니면 홈으로
  useEffect(() => {
    if (status !== "failed") {
      const timer = setTimeout(() => {
        if (useVoyageStore.getState().status !== "failed") {
          router.push("/");
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const handleRetry = () => {
    resetVoyage();
    router.push("/");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-8 bg-gradient-to-b from-slate-900 via-red-950/30 to-slate-900 min-h-screen">
      {/* 침몰 애니메이션 */}
      <div className="relative h-48 w-full max-w-xs">
        {/* 파도 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-900 to-blue-800/50 rounded-t-full" />

        {/* 잠수함 긴급 부상 */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-6xl transition-all duration-[2000ms]"
          style={{
            bottom: showAnimation ? "30%" : "70%",
            opacity: showAnimation ? 1 : 0.3,
            transform: `translateX(-50%) rotate(${showAnimation ? 0 : -15}deg)`,
          }}
        >
          🤿
        </div>

        {/* 파도 효과 */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400/50 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.5s",
              }}
            />
          ))}
        </div>

        {/* SOS 신호 */}
        {showAnimation && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-red-400 text-sm font-bold animate-pulse">
            SOS
          </div>
        )}
      </div>

      {/* 메시지 */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">
          잠항이 중단되었어요
        </h1>
        <p className="text-blue-200/60">
          잠수함에서 눈을 떼면 잠항을 계속할 수 없어요
        </p>
        {departurePort && arrivalPort && (
          <p className="text-sm text-blue-300/40">
            {departurePort.nameKo} → {arrivalPort.nameKo} 잠항 실패
          </p>
        )}
        <p className="text-sm text-blue-200/50">
          다음엔 끝까지 함께 잠항해요!
        </p>
      </div>

      {/* 재시도 버튼 */}
      <button
        onClick={handleRetry}
        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500
                   text-white font-semibold shadow-lg shadow-blue-500/30
                   hover:from-blue-400 hover:to-cyan-400 transition-all
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        다시 잠항하기
      </button>
    </div>
  );
}
