"use client";

import { useEffect, useState } from "react";
import { PixelCharacter } from "./PixelCharacter";

interface FallAnimationProps {
  onComplete?: () => void;
}

export function FallAnimationGOIT({ onComplete }: FallAnimationProps) {
  const [phase, setPhase] = useState<"falling" | "bouncing" | "landed">("falling");
  const [fallProgress, setFallProgress] = useState(0);

  useEffect(() => {
    const fallInterval = setInterval(() => {
      setFallProgress((prev) => {
        if (prev >= 100) {
          clearInterval(fallInterval);
          setPhase("bouncing");
          return 100;
        }
        return prev + 4;
      });
    }, 50);

    return () => clearInterval(fallInterval);
  }, []);

  useEffect(() => {
    if (phase === "bouncing") {
      setTimeout(() => setPhase("landed"), 500);
    }
    if (phase === "landed") {
      setTimeout(() => onComplete?.(), 1000);
    }
  }, [phase, onComplete]);

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-xl">
      {/* 배경 - 숲 속 언덕 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a2a] via-[#2d5a3d] to-[#1a2a1a]" />

      {/* 먼 산 실루엣 */}
      <svg
        className="absolute bottom-0 left-0 w-full h-full opacity-30"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 200 L0 100 Q50 60 100 80 Q150 50 200 70 Q250 40 300 60 Q350 45 400 65 L400 200 Z"
          fill="#0a1a0a"
        />
      </svg>

      {/* 지형 - 풀과 흙 */}
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* 흙 언덕 */}
        <path
          d="M0 200 L0 140
             Q50 120 100 145
             L120 135 Q180 115 230 140
             Q280 125 330 145
             L400 130 L400 200 Z"
          fill="#5a4a3a"
        />
        <path
          d="M0 200 L0 160
             Q100 150 200 165
             Q300 155 400 175
             L400 200 Z"
          fill="#3a2a1a"
        />

        {/* 풀 */}
        {Array.from({ length: 30 }, (_, i) => (
          <path
            key={i}
            d={`M${10 + i * 13} 165 L${12 + i * 13} ${155 + (i % 3) * 3} L${14 + i * 13} 165`}
            fill="#2d5a3d"
          />
        ))}

        {/* 돌 */}
        <ellipse cx="80" cy="178" rx="20" ry="10" fill="#4a4a4a" />
        <ellipse cx="280" cy="175" rx="25" ry="12" fill="#3a3a3a" />
        <circle cx="170" cy="185" r="6" fill="#5a5a5a" />
      </svg>

      {/* 나무들 */}
      <div className="absolute bottom-20 left-8">
        <TreeSilhouette />
      </div>
      <div className="absolute bottom-24 right-12">
        <TreeSilhouette />
      </div>

      {/* 떨어지는 캐릭터 */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 transition-all ${
          phase === "bouncing" ? "animate-bounce" : ""
        }`}
        style={{
          top: phase === "landed" ? "55%" : `${5 + fallProgress * 0.5}%`,
          transform: `translateX(-50%) rotate(${
            phase === "falling" ? Math.sin(fallProgress * 0.2) * 25 : 0
          }deg) ${phase === "landed" ? "scaleY(0.8)" : ""}`,
          transition: phase === "falling" ? "none" : "all 0.3s ease-out",
        }}
      >
        <PixelCharacter isWalking={false} state="struggling" />

        {/* 낙하 모션 라인 */}
        {phase === "falling" && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-60">
            <div className="w-0.5 h-8 bg-gradient-to-b from-white/50 to-transparent" />
            <div className="w-0.5 h-4 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        )}
      </div>

      {/* 착지 먼지 이펙트 */}
      {phase === "landed" && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-4">
          <div className="w-10 h-10 bg-amber-800/30 rounded-full animate-ping" />
          <div
            className="w-8 h-8 bg-amber-800/20 rounded-full animate-ping"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-6 h-6 bg-amber-800/10 rounded-full animate-ping"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      )}

      {/* 충격 효과 */}
      {phase === "bouncing" && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-3xl">
          <span className="animate-ping">💫</span>
        </div>
      )}

      {/* 낙엽 이펙트 */}
      {phase === "falling" && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute text-lg animate-bounce"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (fallProgress * 0.5) + (i * 5)}%`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0.6,
              }}
            >
              🍂
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 나무 실루엣
function TreeSilhouette() {
  return (
    <svg width="40" height="60" viewBox="0 0 40 60">
      <path
        d="M20 0 L5 25 L10 25 L0 45 L15 45 L15 60 L25 60 L25 45 L40 45 L30 25 L35 25 Z"
        fill="#1a3020"
        opacity="0.7"
      />
    </svg>
  );
}
