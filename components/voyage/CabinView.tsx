"use client";

import { useEffect, useState, useMemo } from "react";

export type TimeOfDay = "day" | "sunset" | "night";

interface CabinViewProps {
  progress: number;
  timeOfDay: TimeOfDay;
}

export function CabinView({ progress, timeOfDay }: CabinViewProps) {
  const [time, setTime] = useState(0);

  // Animation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Ocean bobbing effect
  const oceanBob = useMemo(() => {
    const bobY = Math.sin(time * 0.5) * 2;
    return { transform: `translateY(${bobY}px)` };
  }, [time]);

  // Lantern swing
  const lanternSwing = useMemo(() => {
    return Math.sin(time * 0.8) * 3;
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
          wall: { light: "#5a4030", dark: "#3a2518" },
          lanternGlow: "rgba(255, 150, 50, 0.4)",
        };
      case "night":
        return {
          sky: { top: "#0a0a1a", middle: "#1a1a3a", bottom: "#2a2a4a" },
          ocean: { top: "#0a1525", bottom: "#050a12" },
          sun: { color: "#e0e0e0", glow: "rgba(200, 200, 255, 0.4)" },
          accent: "rgba(150, 150, 200, 0.2)",
          wall: { light: "#3d2818", dark: "#251610" },
          lanternGlow: "rgba(255, 200, 100, 0.6)",
        };
      default:
        return {
          sky: { top: "#4a90d9", middle: "#87ceeb", bottom: "#b0e0e6" },
          ocean: { top: "#1e6091", bottom: "#0a3d62" },
          sun: { color: "#ffd54f", glow: "rgba(255, 200, 50, 0.6)" },
          accent: "rgba(255, 255, 255, 0.25)",
          wall: { light: "#5d4030", dark: "#3d2820" },
          lanternGlow: "rgba(255, 200, 100, 0.2)",
        };
    }
  }, [timeOfDay]);

  // Bolt positions (8 around the porthole)
  const boltPositions = useMemo(() => {
    return [...Array(8)].map((_, i) => {
      const angle = (i * 45 - 90) * (Math.PI / 180);
      return {
        x: 50 + Math.cos(angle) * 46,
        y: 50 + Math.sin(angle) * 46,
      };
    });
  }, []);

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-xl">
      {/* Cabin wall background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${colors.wall.light} 0%, ${colors.wall.dark} 100%)`,
        }}
      />

      {/* Wood planks - horizontal lines */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full"
            style={{
              top: `${10 * i}%`,
              height: "10%",
              borderBottom: "2px solid rgba(0,0,0,0.3)",
              background: i % 2 === 0
                ? `linear-gradient(to bottom, ${colors.wall.light}, ${colors.wall.dark})`
                : `linear-gradient(to bottom, ${colors.wall.dark}, ${colors.wall.light})`,
            }}
          />
        ))}
      </div>

      {/* Wood grain overlay */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-full"
            style={{
              left: `${5 * i}%`,
              width: "1px",
              background: "linear-gradient(to bottom, transparent, rgba(139,90,43,0.5), transparent)",
            }}
          />
        ))}
      </div>

      {/* Hanging Lantern - Left */}
      <div
        className="absolute z-20"
        style={{
          left: "12%",
          top: "5%",
          transform: `rotate(${lanternSwing}deg)`,
          transformOrigin: "top center",
        }}
      >
        {/* Chain */}
        <div className="flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-amber-700" />
          <div className="w-0.5 h-6 bg-amber-800" />
          {/* Lantern SVG */}
          <svg width="28" height="36" viewBox="0 0 28 36">
            {/* Top cap */}
            <path d="M8 4 L20 4 L22 8 L6 8 Z" fill="#8b6914" />
            <rect x="12" y="0" width="4" height="4" rx="1" fill="#705812" />
            {/* Glass body */}
            <rect x="6" y="8" width="16" height="20" rx="2" fill="rgba(255,220,150,0.3)" stroke="#8b6914" strokeWidth="1.5" />
            {/* Flame */}
            <ellipse cx="14" cy="18" rx="4" ry="6" fill={timeOfDay === "night" ? "#ffcc66" : "#ffa500"} opacity={timeOfDay === "night" ? 1 : 0.6} />
            <ellipse cx="14" cy="16" rx="2" ry="3" fill="#fff5e0" opacity={timeOfDay === "night" ? 0.8 : 0.4} />
            {/* Bottom */}
            <path d="M6 28 L8 32 L20 32 L22 28 Z" fill="#705812" />
          </svg>
        </div>
        {/* Glow effect */}
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-16 h-20 rounded-full"
          style={{
            background: `radial-gradient(ellipse, ${colors.lanternGlow}, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />
      </div>

      {/* Hanging Lantern - Right */}
      <div
        className="absolute z-20"
        style={{
          right: "12%",
          top: "5%",
          transform: `rotate(${-lanternSwing}deg)`,
          transformOrigin: "top center",
        }}
      >
        <div className="flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-amber-700" />
          <div className="w-0.5 h-6 bg-amber-800" />
          <svg width="28" height="36" viewBox="0 0 28 36">
            <path d="M8 4 L20 4 L22 8 L6 8 Z" fill="#8b6914" />
            <rect x="12" y="0" width="4" height="4" rx="1" fill="#705812" />
            <rect x="6" y="8" width="16" height="20" rx="2" fill="rgba(255,220,150,0.3)" stroke="#8b6914" strokeWidth="1.5" />
            <ellipse cx="14" cy="18" rx="4" ry="6" fill={timeOfDay === "night" ? "#ffcc66" : "#ffa500"} opacity={timeOfDay === "night" ? 1 : 0.6} />
            <ellipse cx="14" cy="16" rx="2" ry="3" fill="#fff5e0" opacity={timeOfDay === "night" ? 0.8 : 0.4} />
            <path d="M6 28 L8 32 L20 32 L22 28 Z" fill="#705812" />
          </svg>
        </div>
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-16 h-20 rounded-full"
          style={{
            background: `radial-gradient(ellipse, ${colors.lanternGlow}, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />
      </div>

      {/* Porthole - centered, smaller to not get cut off */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10"
        style={{ width: "min(50%, 45vh)", height: "min(50%, 45vh)" }}
      >
        {/* Outer brass ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(145deg, #d4a94a 0%, #b8860b 30%, #8b6914 60%, #705812 100%)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.5), inset 0 2px 3px rgba(255,215,0,0.3), inset 0 -2px 3px rgba(0,0,0,0.3)",
          }}
        />

        {/* Inner brass ring */}
        <div
          className="absolute rounded-full"
          style={{
            top: "6%", left: "6%", right: "6%", bottom: "6%",
            background: "linear-gradient(145deg, #8b6914 0%, #705812 50%, #5a4610 100%)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
          }}
        />

        {/* Bolts */}
        {boltPositions.map((pos, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full z-10"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              background: "linear-gradient(145deg, #c4993a 0%, #8b6914 50%, #5a4610 100%)",
              boxShadow: "inset 0 1px 1px rgba(255,215,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
            }}
          />
        ))}

        {/* Glass area (ocean view) */}
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            top: "10%", left: "10%", right: "10%", bottom: "10%",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
          }}
        >
          {/* Sky */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${colors.sky.top} 0%, ${colors.sky.middle} 40%, ${colors.sky.bottom} 55%)`,
              height: "55%",
            }}
          />

          {/* Sun/Moon */}
          <div
            className="absolute"
            style={{
              top: timeOfDay === "night" ? "15%" : "20%",
              right: "25%",
              width: timeOfDay === "night" ? "16px" : "20px",
              height: timeOfDay === "night" ? "16px" : "20px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${colors.sun.color} 0%, ${colors.sun.color} 50%, transparent 70%)`,
              filter: `blur(1px) drop-shadow(0 0 10px ${colors.sun.glow})`,
            }}
          />

          {/* Stars (night only) */}
          {timeOfDay === "night" && [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                top: `${10 + (i % 3) * 12}%`,
                left: `${15 + (i * 15) % 70}%`,
                opacity: 0.3 + Math.sin(time * 2 + i) * 0.4,
              }}
            />
          ))}

          {/* Clouds (day/sunset) - SVG */}
          {timeOfDay !== "night" && (
            <svg
              className="absolute"
              style={{
                top: "15%",
                left: `${((time * 3) % 140) - 20}%`,
                width: "30px",
                height: "15px",
                opacity: 0.5,
              }}
              viewBox="0 0 64 32"
            >
              <ellipse cx="32" cy="20" rx="28" ry="10" fill={colors.accent} />
              <ellipse cx="20" cy="16" rx="14" ry="10" fill={colors.accent} />
              <ellipse cx="44" cy="16" rx="14" ry="10" fill={colors.accent} />
            </svg>
          )}

          {/* Horizon */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: "50%",
              height: "1px",
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
            {/* Waves - SVG */}
            {[0, 1, 2].map((i) => {
              const waveHeight = 4 + Math.sin(time + i) * 4;
              return (
                <svg
                  key={i}
                  className="absolute left-0 w-[200%] h-4"
                  style={{
                    top: `${15 + i * 25}%`,
                    opacity: 0.3 - i * 0.08,
                    transform: `translateX(${-25 + Math.sin(time * (0.6 + i * 0.15)) * 6}%)`,
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

            {/* Sparkles */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-0.5 bg-white rounded-full"
                style={{
                  top: `${25 + i * 20}%`,
                  left: `${20 + i * 25}%`,
                  opacity: Math.abs(Math.sin(time * 2.5 + i)) * 0.5,
                }}
              />
            ))}
          </div>

          {/* Glass reflection */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.15) 0%, transparent 40%)",
            }}
          />
        </div>
      </div>

      {/* Ambient lighting overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: timeOfDay === "night"
            ? "radial-gradient(ellipse at 12% 15%, rgba(255,200,100,0.1), transparent 40%), radial-gradient(ellipse at 88% 15%, rgba(255,200,100,0.1), transparent 40%)"
            : "none",
        }}
      />

      {/* Time indicator badge */}
      <div
        className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold z-30"
        style={{
          background: timeOfDay === "night"
            ? "linear-gradient(to right, #1a1a3a, #2a2a4a)"
            : timeOfDay === "sunset"
            ? "linear-gradient(to right, #ff6b35, #ff8c42)"
            : "linear-gradient(to right, #4a90d9, #5aa0e9)",
          color: "white",
        }}
      >
        {timeOfDay === "night" ? "NIGHT" : timeOfDay === "sunset" ? "SUNSET" : "DAY"}
      </div>
    </div>
  );
}
