"use client";

import { useEffect, useState, useRef } from "react";
import { ClimbingTower } from "./terrain/ClimbingTower";
import { LottieCharacter } from "./LottieCharacter";

interface GettingOverItSceneProps {
  progress: number; // 0-100
}

export function GettingOverItScene({ progress }: GettingOverItSceneProps) {
  const [isClimbing, setIsClimbing] = useState(false);
  const lastProgressRef = useRef(progress);

  // progress 증가시 climbing 애니메이션 트리거
  useEffect(() => {
    if (progress > lastProgressRef.current) {
      setIsClimbing(true);
      const timer = setTimeout(() => setIsClimbing(false), 500);
      lastProgressRef.current = progress;
      return () => clearTimeout(timer);
    }
    lastProgressRef.current = progress;
  }, [progress]);

  return (
    <div className="relative flex-1 w-full overflow-hidden">
      {/* 배경 + 고도 게이지 */}
      <ClimbingTower progress={progress} />

      {/* 캐릭터 + Ledge (하단 고정) */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
        {/* 캐릭터 */}
        <div className="scale-150">
          <LottieCharacter isClimbing={isClimbing} />
        </div>

        {/* Ledge (바위/지면) - 캐릭터가 서있는 곳 */}
        <Ledge progress={progress} />
      </div>
    </div>
  );
}

// Ledge 컴포넌트 (캐릭터가 서있는 바위)
function Ledge({ progress }: { progress: number }) {
  // 구간별 ledge 색상
  const getLedgeColor = () => {
    if (progress < 20) return "#4a7c3f"; // 풀
    if (progress < 40) return "#8b7355"; // 흙
    if (progress < 60) return "#6b7280"; // 바위
    if (progress < 80) return "#e5e7eb"; // 구름/눈
    return "#fbbf24"; // 황금
  };

  return (
    <div className="relative mt-2">
      {/* 메인 ledge */}
      <div
        className="w-40 h-6 rounded-xl shadow-lg transition-colors duration-500"
        style={{
          background: `linear-gradient(to bottom, ${getLedgeColor()}, ${getLedgeColor()}aa)`,
          boxShadow: "0 6px 12px rgba(0,0,0,0.4)",
        }}
      />
      {/* ledge 아래 그림자 */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-3 rounded-full bg-black/30 blur-md"
      />
    </div>
  );
}
