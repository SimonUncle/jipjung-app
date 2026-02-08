"use client";

import { useEffect, useState, useMemo } from "react";

interface PortHoleViewProps {
  progress: number;
  isPremium?: boolean;
}

// 물방울 타입
interface WaterDrop {
  id: number;
  x: number;
  startY: number;
  speed: number;
  size: number;
  delay: number;
}

export function PortHoleView({ progress, isPremium = false }: PortHoleViewProps) {
  const [time, setTime] = useState(0);
  const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);

  // Animation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 물방울 생성 (모든 객실에 적용, 프리미엄은 더 자주)
  useEffect(() => {
    const createDrop = () => {
      const newDrop: WaterDrop = {
        id: Date.now() + Math.random(),
        x: 20 + Math.random() * 60, // 20~80% 위치
        startY: -5,
        speed: 0.8 + Math.random() * 0.4,
        size: 2 + Math.random() * 2,
        delay: 0,
      };
      setWaterDrops((prev) => [...prev.slice(-5), newDrop]); // 최대 6개 유지
    };

    // 프리미엄: 3~6초, 일반: 6~12초 마다 물방울 생성
    const baseInterval = isPremium ? 3000 : 6000;
    const randomRange = isPremium ? 3000 : 6000;

    const interval = setInterval(() => {
      if (Math.random() > 0.3) createDrop();
    }, baseInterval + Math.random() * randomRange);

    // 첫 물방울
    setTimeout(createDrop, 2000);

    return () => clearInterval(interval);
  }, [isPremium]);

  // 배 흔들림 계산 (roll + pitch)
  const shipRock = useMemo(() => {
    const rollAngle = Math.sin(time * 0.8) * 1.5; // 좌우 흔들림
    const pitchAngle = Math.sin(time * 0.5 + 1) * 0.8; // 앞뒤 흔들림
    return {
      transform: `rotate(${rollAngle}deg) perspective(500px) rotateX(${pitchAngle}deg)`,
    };
  }, [time]);

  // 바다 출렁임 (창문 밖 풍경)
  const oceanBob = useMemo(() => {
    const bobY = Math.sin(time * 0.7) * 3;
    return { transform: `translateY(${bobY}px)` };
  }, [time]);

  // Time of day based on premium
  const timeOfDay = isPremium ? "sunset" : "day";

  // Sky colors
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

  // Ocean colors
  const oceanColors = useMemo(() => {
    switch (timeOfDay) {
      case "sunset":
        return { top: "#1e3a5f", bottom: "#0c1929" };
      default:
        return { top: "#1e6091", bottom: "#0a3d62" };
    }
  }, [timeOfDay]);

  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl overflow-hidden">
      {/* Cabin interior background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #1a1209 0%, #0f0a05 100%)",
        }}
      />

      {/* 왼쪽 가구 - 빨간 벨벳 의자 팔걸이 */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-32 z-10">
        <div
          className="w-full h-full rounded-r-lg"
          style={{
            background: "linear-gradient(to right, #4a1c1c 0%, #8b2323 50%, #6b1a1a 100%)",
            boxShadow: "2px 0 8px rgba(0,0,0,0.4)",
          }}
        />
        {/* 팔걸이 상단 */}
        <div
          className="absolute top-0 left-0 right-0 h-4 rounded-tr-lg"
          style={{
            background: "linear-gradient(to bottom, #a52a2a, #8b2323)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        />
      </div>

      {/* 오른쪽 가구 - 램프 테이블 */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-28 z-10 flex flex-col items-center">
        {/* 램프 */}
        <div className="relative mb-2">
          <div
            className="w-6 h-8 rounded-t-full"
            style={{
              background: "radial-gradient(ellipse at center, #ffd700 0%, #daa520 60%, #b8860b 100%)",
              boxShadow: "0 0 15px rgba(255, 200, 50, 0.4)",
            }}
          />
          <div className="w-2 h-3 bg-amber-900 mx-auto" />
        </div>
        {/* 사이드 테이블 */}
        <div
          className="w-8 h-16 rounded-t"
          style={{
            background: "linear-gradient(to right, #3d2817 0%, #5c3d2e 50%, #3d2817 100%)",
            boxShadow: "2px 2px 8px rgba(0,0,0,0.5)",
          }}
        />
      </div>

      {/* 하단 선반/탁자 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-6 z-10">
        <div
          className="w-full h-full rounded-t"
          style={{
            background: "linear-gradient(to bottom, #5c3d2e 0%, #4a3222 100%)",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.3)",
          }}
        />
      </div>

      {/* Porthole frame with ship rocking - 크기 확대 */}
      <div
        className="relative w-[90%] aspect-square max-w-[320px] transition-transform duration-300 z-0"
        style={shipRock}
      >
        {/* Outer frame ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(145deg, #8b7355, #5c4a32)",
            padding: "8px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1)",
          }}
        >
          {/* Inner brass ring */}
          <div
            className="w-full h-full rounded-full"
            style={{
              background: "linear-gradient(145deg, #b8860b, #8b6914)",
              padding: "6px",
              boxShadow: "inset 0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            {/* Glass area */}
            <div className="relative w-full h-full rounded-full overflow-hidden">
              {/* Sky */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom,
                    ${skyColors.top} 0%,
                    ${skyColors.middle} 40%,
                    ${skyColors.bottom} 55%)`,
                  height: "55%",
                }}
              />

              {/* Sun */}
              <div
                className="absolute"
                style={{
                  top: isPremium ? "15%" : "12%",
                  right: "20%",
                  width: isPremium ? "40px" : "32px",
                  height: isPremium ? "40px" : "32px",
                  borderRadius: "50%",
                  background: isPremium
                    ? "radial-gradient(circle, #ff6b35 0%, #ff4500 60%, transparent 75%)"
                    : "radial-gradient(circle, #fff9c4 0%, #ffd54f 60%, transparent 75%)",
                  filter: isPremium
                    ? "blur(1px) drop-shadow(0 0 20px rgba(255, 100, 50, 0.8))"
                    : "blur(1px) drop-shadow(0 0 15px rgba(255, 200, 50, 0.6))",
                }}
              />

              {/* Clouds (SVG) */}
              {[...Array(3)].map((_, i) => (
                <svg
                  key={i}
                  className="absolute"
                  style={{
                    top: `${8 + i * 10}%`,
                    left: `${((time * (0.3 + i * 0.15) * 20) % 140) - 20}%`,
                    width: `${40 + i * 15}px`,
                    height: `${20 + i * 8}px`,
                    opacity: 0.6 - i * 0.15,
                  }}
                  viewBox="0 0 64 32"
                >
                  <ellipse
                    cx="32"
                    cy="20"
                    rx="28"
                    ry="10"
                    fill={isPremium ? "rgba(255,200,150,0.5)" : "rgba(255,255,255,0.7)"}
                  />
                  <ellipse
                    cx="20"
                    cy="16"
                    rx="14"
                    ry="10"
                    fill={isPremium ? "rgba(255,200,150,0.5)" : "rgba(255,255,255,0.7)"}
                  />
                  <ellipse
                    cx="44"
                    cy="16"
                    rx="14"
                    ry="10"
                    fill={isPremium ? "rgba(255,200,150,0.5)" : "rgba(255,255,255,0.7)"}
                  />
                </svg>
              ))}

              {/* Horizon line */}
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

              {/* Ocean - 출렁임 효과 */}
              <div
                className="absolute left-0 right-0 bottom-0 transition-transform duration-300"
                style={{
                  top: "48%",
                  background: `linear-gradient(to bottom, ${oceanColors.top}, ${oceanColors.bottom})`,
                  ...oceanBob,
                }}
              >
                {/* Waves - more dynamic with occasional large waves */}
                {[0, 1, 2].map((i) => {
                  // 가끔 큰 파도 (시간 기반으로 주기적)
                  const bigWaveMultiplier = Math.sin(time * 0.3 + i * 2) > 0.7 ? 1.4 : 1;
                  const waveHeight = (4 + Math.sin(time + i) * 6) * bigWaveMultiplier;

                  return (
                    <svg
                      key={i}
                      className="absolute left-0 w-[200%]"
                      style={{
                        top: `${10 + i * 28}%`,
                        height: `${32 * bigWaveMultiplier}px`,
                        opacity: (0.4 - i * 0.1) * (bigWaveMultiplier > 1 ? 1.2 : 1),
                        transform: `translateX(${-25 + Math.sin(time * (0.6 + i * 0.2)) * 8}%)`,
                        transition: "height 0.5s ease-out",
                      }}
                      viewBox="0 0 1200 24"
                      preserveAspectRatio="none"
                    >
                      <path
                        d={`
                          M 0 12
                          Q 150 ${waveHeight} 300 12
                          Q 450 ${24 - waveHeight} 600 12
                          Q 750 ${waveHeight} 900 12
                          Q 1050 ${24 - waveHeight} 1200 12
                          L 1200 24 L 0 24 Z
                        `}
                        fill={isPremium ? "rgba(255, 180, 100, 0.25)" : "rgba(255, 255, 255, 0.25)"}
                      />
                    </svg>
                  );
                })}

                {/* Sparkles on water */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      top: `${20 + (i % 3) * 25}%`,
                      left: `${15 + i * 16}%`,
                      opacity: Math.abs(Math.sin(time * 2 + i * 0.7)) * 0.6,
                      transform: `scale(${0.5 + Math.abs(Math.sin(time * 1.5 + i)) * 0.7})`,
                    }}
                  />
                ))}
              </div>

              {/* Glass reflection */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(ellipse 80% 50% at 30% 20%, rgba(255,255,255,0.12) 0%, transparent 50%),
                    radial-gradient(ellipse 60% 40% at 70% 80%, rgba(255,255,255,0.06) 0%, transparent 40%)
                  `,
                }}
              />

              {/* Water droplets (all cabins) */}
              {waterDrops.map((drop) => (
                <div
                  key={drop.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: `${drop.x}%`,
                    top: `${drop.startY + ((time * drop.speed * 30) % 120)}%`,
                    width: `${drop.size}px`,
                    height: `${drop.size * 1.5}px`,
                    background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.6) 0%, rgba(200,220,255,0.3) 50%, transparent 70%)",
                    opacity: 0.7,
                    filter: "blur(0.3px)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Porthole bolts */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <div
            key={angle}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: "linear-gradient(145deg, #8b7355, #5c4a32)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
              top: "50%",
              left: "50%",
              transform: `rotate(${angle}deg) translateY(-48%) translateX(-50%)`,
              transformOrigin: "center center",
            }}
          />
        ))}
      </div>

      {/* Premium badge */}
      {isPremium && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
          SUNSET VIEW
        </div>
      )}

      {/* Cabin ambient light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isPremium
            ? "radial-gradient(ellipse at center, rgba(255,150,50,0.05) 0%, transparent 70%)"
            : "radial-gradient(ellipse at center, rgba(100,150,255,0.03) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
