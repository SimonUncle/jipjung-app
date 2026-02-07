"use client";

import { useEffect, useState } from "react";

interface ClimbingTowerProps {
  progress: number; // 0-100
}

export function ClimbingTower({ progress }: ClimbingTowerProps) {
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [checkpointLevel, setCheckpointLevel] = useState(0);

  // 체크포인트 감지 (20, 40, 100)
  useEffect(() => {
    const checkpoints = [20, 40, 100];
    const currentCheckpoint = checkpoints.find(
      (cp) => progress >= cp && progress < cp + 2
    );

    if (currentCheckpoint && currentCheckpoint !== checkpointLevel) {
      setCheckpointLevel(currentCheckpoint);
      setShowCheckpoint(true);
      const timer = setTimeout(() => setShowCheckpoint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [progress, checkpointLevel]);

  // 배경 스크롤 오프셋 (progress에 따라 아래로 이동 = 올라가는 느낌)
  const bgScrollY = progress * 2;

  // 배경색 (고도에 따라 변화)
  const getBgGradient = () => {
    if (progress < 30) return "linear-gradient(180deg, #2c3e50 0%, #1a252f 100%)";
    if (progress < 60) return "linear-gradient(180deg, #34495e 0%, #2c3e50 100%)";
    if (progress < 85) return "linear-gradient(180deg, #5d6d7e 0%, #34495e 100%)";
    return "linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)";
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden transition-all duration-1000"
      style={{ background: getBgGradient() }}
    >
      {/* 배경 레이어 (스크롤됨) */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{ transform: `translateY(${bgScrollY}px)` }}
      >
        {/* 먼 산 실루엣 */}
        <div className="absolute bottom-[20%] left-0 right-0 h-40 opacity-20">
          <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
            <path d="M0 100 L50 40 L100 70 L150 20 L200 50 L250 30 L300 60 L350 25 L400 55 L400 100 Z" fill="#1a1a2e" />
          </svg>
        </div>

        {/* 별 (80% 이상) */}
        {progress >= 80 && <Stars />}
      </div>

      {/* 고도 게이지 (왼쪽) */}
      <AltitudeGauge progress={progress} />

      {/* 체크포인트 연출 */}
      {showCheckpoint && <CheckpointCelebration level={checkpointLevel} />}
    </div>
  );
}

// 고도 게이지
function AltitudeGauge({ progress }: { progress: number }) {
  const getZoneLabel = () => {
    if (progress < 20) return "🌲 숲";
    if (progress < 40) return "⛰️ 산";
    if (progress < 60) return "🏔️ 고산";
    if (progress < 80) return "☁️ 구름";
    return "🌌 우주";
  };

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
      {/* 게이지 바 */}
      <div className="relative w-3 h-56 bg-black/30 rounded-full overflow-hidden">
        {/* 채워진 부분 */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500 ease-out"
          style={{
            height: `${progress}%`,
            background: "linear-gradient(to top, #27ae60, #f1c40f, #e74c3c)",
          }}
        />
        {/* 현재 위치 마커 */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full border-2 border-yellow-400 shadow-lg transition-all duration-500"
          style={{ bottom: `calc(${progress}% - 10px)` }}
        />
      </div>

      {/* 높이 숫자 */}
      <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
        <div className="text-white text-xl font-bold">{Math.round(progress)}m</div>
        <div className="text-white/50 text-xs">{getZoneLabel()}</div>
      </div>
    </div>
  );
}

// 별 (우주 구간)
function Stars() {
  const stars = [
    { x: 15, y: 10 }, { x: 30, y: 20 }, { x: 50, y: 8 }, { x: 70, y: 25 }, { x: 85, y: 15 },
    { x: 20, y: 40 }, { x: 45, y: 35 }, { x: 65, y: 45 }, { x: 80, y: 30 }, { x: 10, y: 55 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${i * 0.2}s`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}

// 체크포인트 연출
function CheckpointCelebration({ level }: { level: number }) {
  const messages: Record<number, string> = {
    20: "🎉 20% 도달!",
    40: "🔥 40% 돌파!",
    100: "🏆 정상 도달!",
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* 밝아지는 오버레이 */}
      <div className="absolute inset-0 bg-white/10 animate-pulse" />

      {/* 메시지 */}
      <div className="bg-black/60 backdrop-blur-md rounded-2xl px-8 py-6 text-center animate-bounce">
        <div className="text-3xl mb-2">{messages[level]?.split(" ")[0]}</div>
        <div className="text-white text-xl font-bold">{messages[level]?.split(" ").slice(1).join(" ")}</div>
      </div>

      {/* 파티클 */}
      <Particles />
    </div>
  );
}

// 파티클 효과
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-ping"
          style={{
            left: `${20 + (i * 5)}%`,
            top: `${30 + (i % 4) * 10}%`,
            backgroundColor: ["#f1c40f", "#e74c3c", "#3498db", "#2ecc71"][i % 4],
            animationDelay: `${i * 0.1}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );
}
