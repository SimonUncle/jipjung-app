"use client";

import { useEffect, useState, useMemo } from "react";

interface DeckViewProps {
  progress: number;
  isPremium?: boolean;
}

// 갈매기 타입
interface Seagull {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: number;
  size: number;
}

// 물보라 타입
interface Splash {
  id: number;
  x: number;
  delay: number;
}

export function DeckView({ progress, isPremium = false }: DeckViewProps) {
  const [time, setTime] = useState(0);
  const [seagulls, setSeagulls] = useState<Seagull[]>([]);
  const [splashes, setSplashes] = useState<Splash[]>([]);

  // 애니메이션 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 갈매기 생성
  useEffect(() => {
    const createSeagull = () => {
      const fromRight = Math.random() > 0.5;
      const newSeagull: Seagull = {
        id: Date.now() + Math.random(),
        x: fromRight ? 110 : -10,
        y: 10 + Math.random() * 30,
        speed: 0.4 + Math.random() * 0.4,
        direction: fromRight ? -1 : 1,
        size: 0.8 + Math.random() * 0.5,
      };
      setSeagulls((prev) => [...prev.slice(-3), newSeagull]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.4) createSeagull();
    }, 4000 + Math.random() * 4000);

    setTimeout(createSeagull, 1500);
    return () => clearInterval(interval);
  }, []);

  // 물보라 생성
  useEffect(() => {
    const createSplash = () => {
      const newSplash: Splash = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
      };
      setSplashes((prev) => [...prev.slice(-4), newSplash]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.3) createSplash();
    }, 2000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  // 배 흔들림 - 회전 제거, 수평선만 움직임으로 표현
  const horizonOffset = useMemo(() => {
    return Math.sin(time * 0.6) * 8; // 수평선 Y 오프셋
  }, [time]);


  // 시간대
  const timeOfDay = isPremium ? "sunset" : "day";

  // 하늘 색상
  const skyColors = useMemo(() => {
    if (timeOfDay === "sunset") {
      return {
        top: "#0f0f23",
        middle: "#ff6b35",
        bottom: "#ffd93d",
      };
    }
    return {
      top: "#1e3a5f",
      middle: "#4a90d9",
      bottom: "#87ceeb",
    };
  }, [timeOfDay]);

  // 바다 색상
  const oceanColors = useMemo(() => {
    if (timeOfDay === "sunset") {
      return { top: "#1a3a5c", middle: "#0f2940", bottom: "#081825" };
    }
    return { top: "#1565c0", middle: "#0d47a1", bottom: "#0a3d62" };
  }, [timeOfDay]);

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-xl bg-slate-900">
      {/* 전체 씬 - 회전 없이 고정 */}
      <div className="absolute inset-0">
        {/* 하늘 - 수평선 움직임으로 배 흔들림 표현 */}
        <div
          className="absolute inset-x-0 transition-all duration-300"
          style={{
            top: `${-5 + horizonOffset}%`,
            height: "55%",
            background: `linear-gradient(to bottom,
              ${skyColors.top} 0%,
              ${skyColors.middle} 50%,
              ${skyColors.bottom} 100%)`,
          }}
        >
          {/* 태양/석양 */}
          <div
            className="absolute"
            style={{
              top: isPremium ? "30%" : "25%",
              right: "20%",
              width: isPremium ? "60px" : "50px",
              height: isPremium ? "60px" : "50px",
              borderRadius: "50%",
              background: isPremium
                ? "radial-gradient(circle, #ff6b35 0%, #ff4500 50%, transparent 75%)"
                : "radial-gradient(circle, #fff9c4 0%, #ffd54f 50%, transparent 75%)",
              filter: isPremium
                ? "blur(3px) drop-shadow(0 0 40px rgba(255, 100, 50, 0.9))"
                : "blur(2px) drop-shadow(0 0 30px rgba(255, 200, 50, 0.7))",
            }}
          />

          {/* 구름 */}
          {[...Array(4)].map((_, i) => (
            <svg
              key={i}
              className="absolute"
              style={{
                top: `${15 + i * 12}%`,
                left: `${((time * (0.3 + i * 0.1) * 15) % 150) - 25}%`,
                width: `${60 + i * 20}px`,
                height: `${30 + i * 10}px`,
                opacity: 0.5 - i * 0.1,
              }}
              viewBox="0 0 80 40"
            >
              <ellipse
                cx="40"
                cy="25"
                rx="35"
                ry="12"
                fill={isPremium ? "rgba(255,180,120,0.5)" : "rgba(255,255,255,0.6)"}
              />
              <ellipse
                cx="25"
                cy="20"
                rx="18"
                ry="12"
                fill={isPremium ? "rgba(255,180,120,0.5)" : "rgba(255,255,255,0.6)"}
              />
              <ellipse
                cx="55"
                cy="20"
                rx="18"
                ry="12"
                fill={isPremium ? "rgba(255,180,120,0.5)" : "rgba(255,255,255,0.6)"}
              />
            </svg>
          ))}

          {/* 갈매기들 */}
          {seagulls.map((seagull) => {
            const currentX = seagull.x + time * seagull.speed * 25 * seagull.direction;
            if (currentX < -15 || currentX > 115) return null;

            return (
              <div
                key={seagull.id}
                className="absolute"
                style={{
                  top: `${seagull.y}%`,
                  left: `${currentX}%`,
                  fontSize: `${20 * seagull.size}px`,
                  transform: `translateY(${Math.sin(time * 4 + seagull.id) * 6}px) scaleX(${seagull.direction})`,
                  opacity: 0.9,
                }}
              >
                🕊️
              </div>
            );
          })}
        </div>

        {/* 수평선 */}
        <div
          className="absolute left-0 right-0 transition-all duration-300"
          style={{
            top: `${45 + horizonOffset}%`,
            height: "3px",
            background: isPremium
              ? "linear-gradient(to right, transparent, rgba(255,180,100,0.5), transparent)"
              : "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)",
          }}
        />

        {/* 바다 */}
        <div
          className="absolute inset-x-0 transition-all duration-300"
          style={{
            top: `${45 + horizonOffset}%`,
            bottom: 0,
            background: `linear-gradient(to bottom,
              ${oceanColors.top} 0%,
              ${oceanColors.middle} 40%,
              ${oceanColors.bottom} 100%)`,
          }}
        >
          {/* 파도 레이어 */}
          {[0, 1, 2, 3].map((i) => {
            const bigWave = Math.sin(time * 0.2 + i * 1.2) > 0.5 ? 1.6 : 1;
            const waveAmplitude = (6 + Math.sin(time * 0.8 + i) * 4) * bigWave;

            return (
              <svg
                key={i}
                className="absolute left-0 w-[250%]"
                style={{
                  top: `${i * 18}%`,
                  height: `${50 * bigWave}px`,
                  opacity: 0.6 - i * 0.12,
                  transform: `translateX(${-50 + Math.sin(time * (0.5 + i * 0.15)) * 15}%)`,
                  transition: "height 0.5s ease-out",
                }}
                viewBox="0 0 1500 40"
                preserveAspectRatio="none"
              >
                <path
                  d={`
                    M 0 20
                    Q 187.5 ${20 - waveAmplitude} 375 20
                    Q 562.5 ${20 + waveAmplitude} 750 20
                    Q 937.5 ${20 - waveAmplitude} 1125 20
                    Q 1312.5 ${20 + waveAmplitude} 1500 20
                    L 1500 40 L 0 40 Z
                  `}
                  fill={isPremium ? "rgba(255, 150, 80, 0.25)" : "rgba(150, 200, 255, 0.25)"}
                />
              </svg>
            );
          })}

          {/* 물보라/스프레이 */}
          {splashes.map((splash) => {
            const splashTime = (time - splash.delay) % 3;
            if (splashTime < 0 || splashTime > 1.5) return null;

            return (
              <div
                key={splash.id}
                className="absolute"
                style={{
                  left: `${splash.x}%`,
                  top: `${10 - splashTime * 15}%`,
                  opacity: Math.max(0, 0.6 - splashTime * 0.4),
                }}
              >
                💨
              </div>
            );
          })}

          {/* 반짝이는 물결 */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white rounded-full"
              style={{
                top: `${10 + (i % 4) * 20}%`,
                left: `${10 + i * 11}%`,
                opacity: Math.abs(Math.sin(time * 3 + i * 0.9)) * 0.7,
                transform: `scale(${0.5 + Math.abs(Math.sin(time * 2.5 + i)) * 0.8})`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 갑판 난간 (고정, 흔들림 없음) */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%] pointer-events-none">
        {/* 난간 기둥들 */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-24 rounded-t"
              style={{
                background: "linear-gradient(to right, #5c4a32 0%, #8b7355 50%, #5c4a32 100%)",
                boxShadow: "2px 0 4px rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>

        {/* 상단 레일 */}
        <div
          className="absolute bottom-24 left-0 right-0 h-4"
          style={{
            background: "linear-gradient(to bottom, #8b7355 0%, #6b5a42 50%, #5c4a32 100%)",
            boxShadow: "0 3px 6px rgba(0,0,0,0.4)",
          }}
        />

        {/* 중간 레일 */}
        <div
          className="absolute bottom-14 left-0 right-0 h-3"
          style={{
            background: "linear-gradient(to bottom, #7a6548 0%, #5c4a32 100%)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        />

        {/* 갑판 바닥 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8"
          style={{
            background: "linear-gradient(to bottom, #4a3c2a 0%, #3d3224 100%)",
            borderTop: "2px solid #5c4a32",
          }}
        >
          {/* 갑판 나무 줄무늬 */}
          <div className="absolute inset-0 flex">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-amber-900/30"
                style={{
                  background: i % 2 === 0
                    ? "linear-gradient(to bottom, #4a3c2a, #3d3224)"
                    : "linear-gradient(to bottom, #3d3224, #352b1e)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 프리미엄 뱃지 */}
      {isPremium && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-20">
          DECK VIEW
        </div>
      )}

      {/* 일반 뱃지 */}
      {!isPremium && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-20">
          DECK VIEW
        </div>
      )}
    </div>
  );
}
