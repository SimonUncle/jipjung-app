"use client";

import { useEffect, useState, useMemo } from "react";

export type TimeOfDay = "day" | "sunset" | "night";

interface CabinViewProps {
  progress: number;
  timeOfDay: TimeOfDay;
}

interface WaterDrop {
  id: number;
  x: number;
  startY: number;
  speed: number;
  size: number;
}

interface Seagull {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: number;
}

export function CabinView({ progress, timeOfDay }: CabinViewProps) {
  const [time, setTime] = useState(0);
  const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);
  const [seagulls, setSeagulls] = useState<Seagull[]>([]);

  // Animation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Water drops
  useEffect(() => {
    const createDrop = () => {
      const newDrop: WaterDrop = {
        id: Date.now() + Math.random(),
        x: 15 + Math.random() * 70,
        startY: -5,
        speed: 0.5 + Math.random() * 0.4,
        size: 2 + Math.random() * 2,
      };
      setWaterDrops((prev) => [...prev.slice(-4), newDrop]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.4) createDrop();
    }, 5000 + Math.random() * 5000);

    setTimeout(createDrop, 3000);
    return () => clearInterval(interval);
  }, []);

  // Seagulls (day/sunset only)
  useEffect(() => {
    if (timeOfDay === "night") return;

    const createSeagull = () => {
      const fromRight = Math.random() > 0.5;
      const newSeagull: Seagull = {
        id: Date.now() + Math.random(),
        x: fromRight ? 110 : -10,
        y: 15 + Math.random() * 20,
        speed: 0.3 + Math.random() * 0.2,
        direction: fromRight ? -1 : 1,
      };
      setSeagulls((prev) => [...prev.slice(-2), newSeagull]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.4) createSeagull();
    }, 6000 + Math.random() * 6000);

    setTimeout(createSeagull, 2000);
    return () => clearInterval(interval);
  }, [timeOfDay]);

  // Ocean bobbing effect
  const oceanBob = useMemo(() => {
    const bobY = Math.sin(time * 0.6) * 3;
    return { transform: `translateY(${bobY}px)` };
  }, [time]);

  // Colors based on time of day
  const colors = useMemo(() => {
    switch (timeOfDay) {
      case "sunset":
        return {
          sky: { top: "#1a1a2e", middle: "#ff6b35", bottom: "#ffd93d" },
          ocean: { top: "#1e3a5f", bottom: "#0c1929" },
          sun: { color: "#ff6b35", glow: "rgba(255, 100, 50, 0.8)" },
          accent: "rgba(255, 180, 100, 0.3)",
          ambient: "rgba(255, 150, 50, 0.08)",
        };
      case "night":
        return {
          sky: { top: "#0a0a1a", middle: "#1a1a3a", bottom: "#2a2a4a" },
          ocean: { top: "#0a1525", bottom: "#050a12" },
          sun: { color: "#e0e0e0", glow: "rgba(200, 200, 255, 0.4)" }, // moon
          accent: "rgba(150, 150, 200, 0.2)",
          ambient: "rgba(100, 100, 200, 0.05)",
        };
      default: // day
        return {
          sky: { top: "#4a90d9", middle: "#87ceeb", bottom: "#b0e0e6" },
          ocean: { top: "#1e6091", bottom: "#0a3d62" },
          sun: { color: "#ffd54f", glow: "rgba(255, 200, 50, 0.6)" },
          accent: "rgba(255, 255, 255, 0.25)",
          ambient: "rgba(100, 150, 255, 0.05)",
        };
    }
  }, [timeOfDay]);

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-xl">
      {/* Cabin wall background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #3d2817 0%, #2a1a0f 50%, #1a1209 100%)",
        }}
      />

      {/* Wood panel texture */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px"
            style={{
              top: `${12.5 * i}%`,
              background: "linear-gradient(to right, transparent, rgba(139,90,43,0.4), transparent)",
            }}
          />
        ))}
      </div>

      {/* Wall lamp (left) */}
      <div className="absolute left-4 top-1/4 z-10">
        <div
          className="w-4 h-6 rounded-t-full"
          style={{
            background: timeOfDay === "night"
              ? "radial-gradient(ellipse at center, #ffcc66 0%, #cc9933 70%)"
              : "linear-gradient(to bottom, #b8860b, #8b6914)",
            boxShadow: timeOfDay === "night" ? "0 0 20px rgba(255, 200, 100, 0.5)" : "none",
          }}
        />
        <div className="w-2 h-3 bg-amber-900 mx-auto" />
      </div>

      {/* Window frame */}
      <div
        className="absolute left-6 right-6 top-6 bottom-16 rounded-lg overflow-hidden border-4 border-amber-900"
        style={{
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        {/* Window content */}
        <div className="relative w-full h-full overflow-hidden">
          {/* Sky */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom,
                ${colors.sky.top} 0%,
                ${colors.sky.middle} 40%,
                ${colors.sky.bottom} 55%)`,
              height: "55%",
            }}
          />

          {/* Sun/Moon */}
          <div
            className="absolute"
            style={{
              top: timeOfDay === "night" ? "12%" : "18%",
              right: "22%",
              width: timeOfDay === "night" ? "35px" : "45px",
              height: timeOfDay === "night" ? "35px" : "45px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${colors.sun.color} 0%, ${colors.sun.color} 50%, transparent 70%)`,
              filter: `blur(1px) drop-shadow(0 0 25px ${colors.sun.glow})`,
            }}
          />

          {/* Stars (night only) */}
          {timeOfDay === "night" && [...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${5 + Math.random() * 40}%`,
                left: `${5 + Math.random() * 90}%`,
                opacity: 0.3 + Math.sin(time * 2 + i) * 0.4,
                transform: `scale(${0.5 + Math.random() * 0.5})`,
              }}
            />
          ))}

          {/* Clouds (day/sunset) */}
          {timeOfDay !== "night" && [...Array(3)].map((_, i) => (
            <svg
              key={i}
              className="absolute"
              style={{
                top: `${8 + i * 12}%`,
                left: `${((time * (0.4 + i * 0.15) * 15) % 140) - 20}%`,
                width: `${50 + i * 15}px`,
                height: `${25 + i * 8}px`,
                opacity: 0.6 - i * 0.15,
              }}
              viewBox="0 0 64 32"
            >
              <ellipse cx="32" cy="20" rx="28" ry="10" fill={colors.accent} />
              <ellipse cx="20" cy="16" rx="14" ry="10" fill={colors.accent} />
              <ellipse cx="44" cy="16" rx="14" ry="10" fill={colors.accent} />
            </svg>
          ))}

          {/* Horizon */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: "50%",
              height: "2px",
              background: `linear-gradient(to right, transparent, ${colors.accent}, transparent)`,
            }}
          />

          {/* Ocean */}
          <div
            className="absolute left-0 right-0 bottom-0 transition-transform duration-300"
            style={{
              top: "48%",
              background: `linear-gradient(to bottom, ${colors.ocean.top}, ${colors.ocean.bottom})`,
              ...oceanBob,
            }}
          >
            {/* Waves */}
            {[0, 1, 2].map((i) => {
              const waveHeight = 5 + Math.sin(time + i) * 6;
              return (
                <svg
                  key={i}
                  className="absolute left-0 w-[200%] h-10"
                  style={{
                    top: `${8 + i * 28}%`,
                    opacity: 0.4 - i * 0.1,
                    transform: `translateX(${-25 + Math.sin(time * (0.7 + i * 0.2)) * 8}%)`,
                  }}
                  viewBox="0 0 1200 24"
                  preserveAspectRatio="none"
                >
                  <path
                    d={`M 0 12 Q 150 ${waveHeight} 300 12 Q 450 ${24 - waveHeight} 600 12 Q 750 ${waveHeight} 900 12 Q 1050 ${24 - waveHeight} 1200 12 L 1200 24 L 0 24 Z`}
                    fill={colors.accent}
                  />
                </svg>
              );
            })}

            {/* Moon reflection (night) */}
            {timeOfDay === "night" && (
              <div
                className="absolute"
                style={{
                  top: "5%",
                  right: "20%",
                  width: "30px",
                  height: "60px",
                  background: "linear-gradient(to bottom, rgba(200,200,255,0.3), transparent)",
                  filter: "blur(8px)",
                  transform: `scaleX(${0.8 + Math.sin(time * 2) * 0.2})`,
                }}
              />
            )}

            {/* Sparkles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: `${15 + (i % 3) * 25}%`,
                  left: `${12 + i * 14}%`,
                  opacity: Math.abs(Math.sin(time * 2.5 + i * 0.8)) * (timeOfDay === "night" ? 0.4 : 0.6),
                }}
              />
            ))}
          </div>

          {/* Seagulls */}
          {seagulls.map((seagull) => {
            const currentX = seagull.x + time * seagull.speed * 20 * seagull.direction;
            if (currentX < -10 || currentX > 110) return null;
            return (
              <div
                key={seagull.id}
                className="absolute text-base"
                style={{
                  top: `${seagull.y}%`,
                  left: `${currentX}%`,
                  transform: `translateY(${Math.sin(time * 3 + seagull.id) * 4}px) scaleX(${seagull.direction})`,
                  opacity: 0.8,
                }}
              >
                🕊️
              </div>
            );
          })}

          {/* Window reflection */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
            }}
          />

          {/* Water droplets */}
          {waterDrops.map((drop) => (
            <div
              key={drop.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${drop.x}%`,
                top: `${drop.startY + ((time * drop.speed * 25) % 110)}%`,
                width: `${drop.size}px`,
                height: `${drop.size * 1.8}px`,
                background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.5) 0%, rgba(180,200,255,0.3) 50%, transparent 70%)",
                opacity: 0.5,
              }}
            />
          ))}
        </div>

        {/* Window cross bar */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-amber-900 z-10"
          style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.4)" }}
        />
      </div>

      {/* Curtains */}
      <div className="absolute left-4 top-4 bottom-14 w-4 overflow-hidden rounded-l-sm">
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(to right, #6b1a1a 0%, #8b2323 50%, #5a1515 100%)",
            boxShadow: "inset -2px 0 6px rgba(0,0,0,0.3)",
          }}
        />
      </div>
      <div className="absolute right-4 top-4 bottom-14 w-4 overflow-hidden rounded-r-sm">
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(to left, #6b1a1a 0%, #8b2323 50%, #5a1515 100%)",
            boxShadow: "inset 2px 0 6px rgba(0,0,0,0.3)",
          }}
        />
      </div>

      {/* Bottom furniture - bed edge */}
      <div className="absolute bottom-0 left-0 right-0 h-14 z-10">
        {/* Bed cover */}
        <div
          className="absolute inset-x-4 top-2 bottom-0 rounded-t-lg"
          style={{
            background: "linear-gradient(to bottom, #2a4a6a 0%, #1a3a5a 100%)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
          }}
        />
        {/* Pillow hint */}
        <div
          className="absolute left-8 top-0 w-16 h-6 rounded-full"
          style={{
            background: "linear-gradient(to bottom, #f5f5f0 0%, #e0e0d8 100%)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      </div>

      {/* Ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center 30%, ${colors.ambient} 0%, transparent 70%)`,
        }}
      />

      {/* Time indicator badge */}
      <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold z-20"
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
