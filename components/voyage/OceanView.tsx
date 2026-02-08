"use client";

import { useEffect, useState, useMemo } from "react";

interface OceanViewProps {
  progress: number;
  isPremium?: boolean; // 프리미엄 객실은 선셋 뷰
}

// 물방울 타입
interface WaterDrop {
  id: number;
  x: number;
  startY: number;
  speed: number;
  size: number;
}

// 갈매기 타입
interface Seagull {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: number; // 1 = right, -1 = left
}

export function OceanView({ progress, isPremium = false }: OceanViewProps) {
  const [time, setTime] = useState(0);
  const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);
  const [seagulls, setSeagulls] = useState<Seagull[]>([]);

  // 애니메이션 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 물방울 생성 (프리미엄 전용)
  useEffect(() => {
    if (!isPremium) return;

    const createDrop = () => {
      const newDrop: WaterDrop = {
        id: Date.now() + Math.random(),
        x: 15 + Math.random() * 70,
        startY: -5,
        speed: 0.6 + Math.random() * 0.5,
        size: 2 + Math.random() * 2,
      };
      setWaterDrops((prev) => [...prev.slice(-4), newDrop]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.5) createDrop();
    }, 4000 + Math.random() * 4000);

    setTimeout(createDrop, 2000);
    return () => clearInterval(interval);
  }, [isPremium]);

  // 갈매기 더 자주 생성
  useEffect(() => {
    const createSeagull = () => {
      const fromRight = Math.random() > 0.5;
      const newSeagull: Seagull = {
        id: Date.now() + Math.random(),
        x: fromRight ? 110 : -10,
        y: 15 + Math.random() * 25,
        speed: 0.3 + Math.random() * 0.3,
        direction: fromRight ? -1 : 1,
      };
      setSeagulls((prev) => [...prev.slice(-2), newSeagull]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.3) createSeagull();
    }, 6000 + Math.random() * 6000);

    setTimeout(createSeagull, 3000);
    return () => clearInterval(interval);
  }, []);

  // 배 흔들림 계산
  const shipRock = useMemo(() => {
    const rollAngle = Math.sin(time * 0.7) * 1.2;
    const pitchAngle = Math.sin(time * 0.4 + 0.5) * 0.6;
    return {
      transform: `rotate(${rollAngle}deg) perspective(600px) rotateX(${pitchAngle}deg)`,
    };
  }, [time]);

  // 시간대 결정 (프리미엄은 선셋)
  const timeOfDay = isPremium ? "sunset" : "day";

  // 하늘 색상
  const skyColors = useMemo(() => {
    switch (timeOfDay) {
      case "sunset":
        return {
          top: "#1a1a2e",
          middle: "#ff6b35",
          bottom: "#ffd93d",
        };
      default:
        return {
          top: "#4a90d9",
          middle: "#87ceeb",
          bottom: "#b0e0e6",
        };
    }
  }, [timeOfDay]);

  // 바다 색상
  const oceanColors = useMemo(() => {
    switch (timeOfDay) {
      case "sunset":
        return { top: "#1e3a5f", bottom: "#0c1929" };
      default:
        return { top: "#1e6091", bottom: "#0a3d62" };
    }
  }, [timeOfDay]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl bg-slate-900">
      {/* 선실 배경 (어두운 나무 느낌) */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #2d1f10 0%, #1a1209 100%)",
        }}
      />

      {/* 창문 프레임 with ship rocking */}
      <div
        className="absolute inset-3 rounded-lg overflow-hidden border-4 border-amber-900 transition-transform duration-200"
        style={{
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.8)",
          ...shipRock,
        }}
      >
        {/* 창문 안 - 바다 풍경 */}
        <div className="relative w-full h-full overflow-hidden">
          {/* 하늘 */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom,
                ${skyColors.top} 0%,
                ${skyColors.middle} 35%,
                ${skyColors.bottom} 50%)`,
              height: "55%",
            }}
          />

          {/* 태양/석양 */}
          <div
            className="absolute"
            style={{
              top: isPremium ? "20%" : "15%",
              right: "25%",
              width: isPremium ? "50px" : "40px",
              height: isPremium ? "50px" : "40px",
              borderRadius: "50%",
              background: isPremium
                ? "radial-gradient(circle, #ff6b35 0%, #ff4500 50%, transparent 70%)"
                : "radial-gradient(circle, #fff9c4 0%, #ffd54f 50%, transparent 70%)",
              filter: isPremium
                ? "blur(2px) drop-shadow(0 0 30px rgba(255, 100, 50, 0.8))"
                : "blur(1px) drop-shadow(0 0 20px rgba(255, 200, 50, 0.6))",
            }}
          />

          {/* 구름 */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${10 + i * 8}%`,
                left: `${((time * (0.5 + i * 0.2) * 15) % 140) - 20}%`,
                fontSize: `${18 + i * 4}px`,
                opacity: 0.7 - i * 0.15,
                filter: "blur(0.5px)",
              }}
            >
              ☁️
            </div>
          ))}

          {/* 수평선 */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: "50%",
              height: "2px",
              background: isPremium
                ? "linear-gradient(to right, transparent, rgba(255,180,100,0.4), transparent)"
                : "linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)",
            }}
          />

          {/* 바다 */}
          <div
            className="absolute left-0 right-0 bottom-0"
            style={{
              top: "50%",
              background: `linear-gradient(to bottom, ${oceanColors.top}, ${oceanColors.bottom})`,
            }}
          >
            {/* 파도 - 더 역동적으로 */}
            {[0, 1, 2].map((i) => {
              const bigWaveMultiplier = Math.sin(time * 0.25 + i * 1.5) > 0.6 ? 1.5 : 1;
              const waveHeight = (5 + Math.sin(time + i) * 8) * bigWaveMultiplier;

              return (
                <svg
                  key={i}
                  className="absolute left-0 w-[200%]"
                  style={{
                    top: `${5 + i * 25}%`,
                    height: `${48 * bigWaveMultiplier}px`,
                    opacity: (0.5 - i * 0.12) * (bigWaveMultiplier > 1 ? 1.3 : 1),
                    transform: `translateX(${-25 + Math.sin(time * (0.8 + i * 0.3)) * 10}%)`,
                    transition: "height 0.6s ease-out",
                  }}
                  viewBox="0 0 1200 30"
                  preserveAspectRatio="none"
                >
                  <path
                    d={`
                      M 0 15
                      Q 150 ${waveHeight} 300 15
                      Q 450 ${30 - waveHeight} 600 15
                      Q 750 ${waveHeight} 900 15
                      Q 1050 ${30 - waveHeight} 1200 15
                      L 1200 30 L 0 30 Z
                    `}
                    fill={isPremium ? "rgba(255, 180, 100, 0.3)" : "rgba(255, 255, 255, 0.3)"}
                  />
                </svg>
              );
            })}

            {/* 반짝이는 물결 */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: `${15 + (i % 3) * 25}%`,
                  left: `${15 + i * 14}%`,
                  opacity: Math.abs(Math.sin(time * 2.5 + i * 0.8)) * 0.7,
                  transform: `scale(${0.6 + Math.abs(Math.sin(time * 2 + i)) * 0.8})`,
                }}
              />
            ))}
          </div>

          {/* 갈매기들 (더 자주, 다양한 궤적) */}
          {seagulls.map((seagull) => {
            const currentX = seagull.x + (time * seagull.speed * 20 * seagull.direction);
            // 화면 밖으로 나가면 표시 안함
            if (currentX < -10 || currentX > 110) return null;

            return (
              <div
                key={seagull.id}
                className="absolute text-lg"
                style={{
                  top: `${seagull.y}%`,
                  left: `${currentX}%`,
                  transform: `translateY(${Math.sin(time * 3 + seagull.id) * 4}px) scaleX(${seagull.direction})`,
                  opacity: 0.85,
                }}
              >
                🕊️
              </div>
            );
          })}

          {/* 먼 배 (가끔) */}
          {progress > 30 && progress < 70 && (
            <div
              className="absolute text-sm"
              style={{
                top: "48%",
                left: `${70 + Math.sin(time * 0.1) * 5}%`,
                opacity: 0.4,
              }}
            >
              ⛵
            </div>
          )}
        </div>

        {/* 창문 반사 효과 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
          }}
        />

        {/* 물방울 (프리미엄 전용) */}
        {isPremium && waterDrops.map((drop) => (
          <div
            key={drop.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${drop.x}%`,
              top: `${drop.startY + ((time * drop.speed * 25) % 110)}%`,
              width: `${drop.size}px`,
              height: `${drop.size * 1.8}px`,
              background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.5) 0%, rgba(180,200,255,0.3) 50%, transparent 70%)",
              opacity: 0.6,
              filter: "blur(0.4px)",
            }}
          />
        ))}
      </div>

      {/* 창문 가로 칸막이 (선실 창문 느낌) */}
      <div
        className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-2 bg-amber-900 z-10"
        style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
      />

      {/* 창틀 장식 - 상단 */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-amber-800 to-amber-900" />

      {/* 창틀 장식 - 하단 */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-amber-800 to-amber-900" />

      {/* 커튼 (좌우) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-6"
        style={{
          background: "linear-gradient(to right, #8b0000 0%, #a52a2a 70%, transparent 100%)",
          opacity: 0.9,
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-6"
        style={{
          background: "linear-gradient(to left, #8b0000 0%, #a52a2a 70%, transparent 100%)",
          opacity: 0.9,
        }}
      />

      {/* 프리미엄 뱃지 */}
      {isPremium && (
        <div className="absolute top-1 right-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-20">
          SUNSET VIEW
        </div>
      )}

      {/* 테이블/음료 (하단 장식) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-3 z-20">
        <div className="text-2xl" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
          {isPremium ? "🍷" : "☕"}
        </div>
      </div>
    </div>
  );
}
