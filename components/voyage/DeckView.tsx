"use client";

import { useEffect, useState, useMemo } from "react";

export type TimeOfDay = "day" | "sunset" | "night";

interface DeckViewProps {
  progress: number;
  timeOfDay: TimeOfDay;
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

// 물고기 타입
interface Fish {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: number;
  type: "fish" | "school";
}

// 돌고래 타입
interface Dolphin {
  id: number;
  x: number;
  direction: number;
}

// 먼 배 타입
interface DistantBoat {
  id: number;
  x: number;
  speed: number;
  direction: number;
}

export function DeckView({ progress, timeOfDay }: DeckViewProps) {
  const [time, setTime] = useState(0);
  const [seagulls, setSeagulls] = useState<Seagull[]>([]);
  const [splashes, setSplashes] = useState<Splash[]>([]);
  const [fish, setFish] = useState<Fish[]>([]);
  const [dolphins, setDolphins] = useState<Dolphin[]>([]);
  const [distantBoats, setDistantBoats] = useState<DistantBoat[]>([]);

  // 애니메이션 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 갈매기 생성 (낮/저녁만)
  useEffect(() => {
    if (timeOfDay === "night") return;

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
  }, [timeOfDay]);

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

  // 물고기 생성
  useEffect(() => {
    const createFish = () => {
      const fromRight = Math.random() > 0.5;
      const newFish: Fish = {
        id: Date.now() + Math.random(),
        x: fromRight ? 110 : -10,
        y: 25 + Math.random() * 50,
        speed: 0.2 + Math.random() * 0.15,
        direction: fromRight ? -1 : 1,
        type: Math.random() > 0.7 ? "school" : "fish",
      };
      setFish((prev) => [...prev.slice(-4), newFish]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.4) createFish();
    }, 4000 + Math.random() * 4000);

    setTimeout(createFish, 2000);
    return () => clearInterval(interval);
  }, []);

  // 돌고래 생성 (드물게)
  useEffect(() => {
    const createDolphin = () => {
      const fromRight = Math.random() > 0.5;
      const newDolphin: Dolphin = {
        id: Date.now() + Math.random(),
        x: fromRight ? 110 : -10,
        direction: fromRight ? -1 : 1,
      };
      setDolphins((prev) => [...prev.slice(-1), newDolphin]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) createDolphin();
    }, 12000 + Math.random() * 8000);

    setTimeout(createDolphin, 6000);
    return () => clearInterval(interval);
  }, []);

  // 먼 배 생성
  useEffect(() => {
    const createBoat = () => {
      const fromRight = Math.random() > 0.5;
      const newBoat: DistantBoat = {
        id: Date.now() + Math.random(),
        x: fromRight ? 105 : -5,
        speed: 0.04 + Math.random() * 0.03,
        direction: fromRight ? -1 : 1,
      };
      setDistantBoats((prev) => [...prev.slice(-1), newBoat]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.6) createBoat();
    }, 18000 + Math.random() * 12000);

    setTimeout(createBoat, 4000);
    return () => clearInterval(interval);
  }, []);

  // 배 흔들림 - 회전 제거, 수평선만 움직임으로 표현
  const horizonOffset = useMemo(() => {
    return Math.sin(time * 0.6) * 8; // 수평선 Y 오프셋
  }, [time]);


  // 하늘 색상
  const skyColors = useMemo(() => {
    switch (timeOfDay) {
      case "sunset":
        return {
          top: "#0f0f23",
          middle: "#ff6b35",
          bottom: "#ffd93d",
        };
      case "night":
        return {
          top: "#050510",
          middle: "#0a0a1a",
          bottom: "#1a1a3a",
        };
      default: // day
        return {
          top: "#1e3a5f",
          middle: "#4a90d9",
          bottom: "#87ceeb",
        };
    }
  }, [timeOfDay]);

  // 바다 색상
  const oceanColors = useMemo(() => {
    switch (timeOfDay) {
      case "sunset":
        return { top: "#1a3a5c", middle: "#0f2940", bottom: "#081825" };
      case "night":
        return { top: "#0a1525", middle: "#060d15", bottom: "#030608" };
      default: // day
        return { top: "#1565c0", middle: "#0d47a1", bottom: "#0a3d62" };
    }
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
          {/* 태양/달 */}
          <div
            className="absolute"
            style={{
              top: timeOfDay === "night" ? "20%" : timeOfDay === "sunset" ? "30%" : "25%",
              right: "20%",
              width: timeOfDay === "night" ? "40px" : timeOfDay === "sunset" ? "60px" : "50px",
              height: timeOfDay === "night" ? "40px" : timeOfDay === "sunset" ? "60px" : "50px",
              borderRadius: "50%",
              background: timeOfDay === "night"
                ? "radial-gradient(circle, #e0e0e0 0%, #c0c0c0 50%, transparent 75%)"
                : timeOfDay === "sunset"
                ? "radial-gradient(circle, #ff6b35 0%, #ff4500 50%, transparent 75%)"
                : "radial-gradient(circle, #fff9c4 0%, #ffd54f 50%, transparent 75%)",
              filter: timeOfDay === "night"
                ? "blur(1px) drop-shadow(0 0 25px rgba(200, 200, 255, 0.5))"
                : timeOfDay === "sunset"
                ? "blur(3px) drop-shadow(0 0 40px rgba(255, 100, 50, 0.9))"
                : "blur(2px) drop-shadow(0 0 30px rgba(255, 200, 50, 0.7))",
            }}
          />

          {/* 별 (밤에만) */}
          {timeOfDay === "night" && [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${5 + Math.random() * 60}%`,
                left: `${5 + Math.random() * 90}%`,
                opacity: 0.3 + Math.sin(time * 2 + i) * 0.4,
                transform: `scale(${0.4 + Math.random() * 0.6})`,
              }}
            />
          ))}

          {/* 구름 (낮/저녁만) */}
          {timeOfDay !== "night" && [...Array(4)].map((_, i) => (
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
                fill={timeOfDay === "sunset" ? "rgba(255,180,120,0.5)" : "rgba(255,255,255,0.6)"}
              />
              <ellipse
                cx="25"
                cy="20"
                rx="18"
                ry="12"
                fill={timeOfDay === "sunset" ? "rgba(255,180,120,0.5)" : "rgba(255,255,255,0.6)"}
              />
              <ellipse
                cx="55"
                cy="20"
                rx="18"
                ry="12"
                fill={timeOfDay === "sunset" ? "rgba(255,180,120,0.5)" : "rgba(255,255,255,0.6)"}
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

        {/* 먼 배 (수평선 근처) */}
        {distantBoats.map((boat) => {
          const currentX = boat.x + time * boat.speed * 25 * boat.direction;
          if (currentX < -5 || currentX > 105) return null;
          return (
            <div
              key={boat.id}
              className="absolute text-sm z-10"
              style={{
                top: `${43 + horizonOffset}%`,
                left: `${currentX}%`,
                transform: `translateY(${Math.sin(time * 1.5) * 2}px) scaleX(${boat.direction})`,
                opacity: 0.7,
              }}
            >
              ⛵
            </div>
          );
        })}

        {/* 수평선 */}
        <div
          className="absolute left-0 right-0 transition-all duration-300"
          style={{
            top: `${45 + horizonOffset}%`,
            height: "3px",
            background: timeOfDay === "night"
              ? "linear-gradient(to right, transparent, rgba(100,100,150,0.3), transparent)"
              : timeOfDay === "sunset"
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
                  fill={
                    timeOfDay === "night"
                      ? "rgba(100, 120, 180, 0.2)"
                      : timeOfDay === "sunset"
                      ? "rgba(255, 150, 80, 0.25)"
                      : "rgba(150, 200, 255, 0.25)"
                  }
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

          {/* 물고기 */}
          {fish.map((f) => {
            const currentX = f.x + time * f.speed * 25 * f.direction;
            if (currentX < -10 || currentX > 110) return null;
            return (
              <div
                key={f.id}
                className="absolute"
                style={{
                  top: `${f.y}%`,
                  left: `${currentX}%`,
                  fontSize: f.type === "school" ? "16px" : "14px",
                  transform: `translateY(${Math.sin(time * 3 + f.id) * 4}px) scaleX(${f.direction})`,
                  opacity: 0.8,
                }}
              >
                {f.type === "school" ? "🐟🐟🐟" : "🐟"}
              </div>
            );
          })}

          {/* 돌고래 점프 */}
          {dolphins.map((dolphin) => {
            const currentX = dolphin.x + time * 0.6 * 25 * dolphin.direction;
            if (currentX < -15 || currentX > 115) return null;
            const jumpProgress = ((currentX - dolphin.x) * dolphin.direction) / 40;
            const jumpY = Math.sin(jumpProgress * Math.PI) * 35;
            return (
              <div
                key={dolphin.id}
                className="absolute text-xl"
                style={{
                  top: `${20 - jumpY}%`,
                  left: `${currentX}%`,
                  transform: `scaleX(${dolphin.direction}) rotate(${jumpY > 15 ? -35 : jumpY > 5 ? 0 : 35}deg)`,
                  opacity: 0.9,
                }}
              >
                🐬
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
                opacity: Math.abs(Math.sin(time * 3 + i * 0.9)) * (timeOfDay === "night" ? 0.4 : 0.7),
                transform: `scale(${0.5 + Math.abs(Math.sin(time * 2.5 + i)) * 0.8})`,
              }}
            />
          ))}

          {/* 달빛 반사 (밤에만) */}
          {timeOfDay === "night" && (
            <div
              className="absolute"
              style={{
                top: "5%",
                right: "18%",
                width: "35px",
                height: "80px",
                background: "linear-gradient(to bottom, rgba(200,200,255,0.25), transparent)",
                filter: "blur(10px)",
                transform: `scaleX(${0.8 + Math.sin(time * 2) * 0.2})`,
              }}
            />
          )}
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

      {/* 시간대 뱃지 */}
      <div
        className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold z-20"
        style={{
          background: timeOfDay === "night"
            ? "linear-gradient(to right, #1a1a3a, #2a2a4a)"
            : timeOfDay === "sunset"
            ? "linear-gradient(to right, #ff6b35, #ff8c42)"
            : "linear-gradient(to right, #4a90d9, #5aa0e9)",
          color: "white",
        }}
      >
        {timeOfDay === "night" ? "🌙 NIGHT" : timeOfDay === "sunset" ? "🌅 SUNSET" : "☀️ DAY"}
      </div>
    </div>
  );
}
