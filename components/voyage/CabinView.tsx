"use client";

import { useEffect, useState, useMemo } from "react";

export type TimeOfDay = "day" | "sunset" | "night";

interface CabinViewProps {
  progress: number;
  timeOfDay: TimeOfDay;
}

interface Fish {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: number;
}

interface Seagull {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: number;
}

interface Boat {
  id: number;
  x: number;
  speed: number;
  direction: number;
}

interface Dolphin {
  id: number;
  x: number;
  direction: number;
}

export function CabinView({ progress, timeOfDay }: CabinViewProps) {
  const [time, setTime] = useState(0);
  const [fish, setFish] = useState<Fish[]>([]);
  const [seagulls, setSeagulls] = useState<Seagull[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [dolphins, setDolphins] = useState<Dolphin[]>([]);

  // Animation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Fish spawning
  useEffect(() => {
    const createFish = () => {
      const fromRight = Math.random() > 0.5;
      setFish((prev) => [...prev.slice(-3), {
        id: Date.now() + Math.random(),
        x: fromRight ? 110 : -10,
        y: 60 + Math.random() * 30,
        speed: 0.15 + Math.random() * 0.1,
        direction: fromRight ? -1 : 1,
      }]);
    };
    const interval = setInterval(() => {
      if (Math.random() > 0.4) createFish();
    }, 4000);
    setTimeout(createFish, 1500);
    return () => clearInterval(interval);
  }, []);

  // Seagulls (day/sunset only)
  useEffect(() => {
    if (timeOfDay === "night") return;
    const createSeagull = () => {
      const fromRight = Math.random() > 0.5;
      setSeagulls((prev) => [...prev.slice(-2), {
        id: Date.now() + Math.random(),
        x: fromRight ? 110 : -10,
        y: 15 + Math.random() * 25,
        speed: 0.2 + Math.random() * 0.15,
        direction: fromRight ? -1 : 1,
      }]);
    };
    const interval = setInterval(() => {
      if (Math.random() > 0.5) createSeagull();
    }, 6000);
    setTimeout(createSeagull, 2000);
    return () => clearInterval(interval);
  }, [timeOfDay]);

  // Boats
  useEffect(() => {
    const createBoat = () => {
      const fromRight = Math.random() > 0.5;
      setBoats((prev) => [...prev.slice(-1), {
        id: Date.now() + Math.random(),
        x: fromRight ? 105 : -5,
        speed: 0.03 + Math.random() * 0.02,
        direction: fromRight ? -1 : 1,
      }]);
    };
    const interval = setInterval(() => {
      if (Math.random() > 0.6) createBoat();
    }, 15000);
    setTimeout(createBoat, 3000);
    return () => clearInterval(interval);
  }, []);

  // Dolphins (rare)
  useEffect(() => {
    const createDolphin = () => {
      const fromRight = Math.random() > 0.5;
      setDolphins((prev) => [...prev.slice(-1), {
        id: Date.now() + Math.random(),
        x: fromRight ? 110 : -10,
        direction: fromRight ? -1 : 1,
      }]);
    };
    const interval = setInterval(() => {
      if (Math.random() > 0.7) createDolphin();
    }, 12000);
    setTimeout(createDolphin, 8000);
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
          fish: "#4a6a8a",
        };
      case "night":
        return {
          sky: { top: "#0a0a1a", middle: "#1a1a3a", bottom: "#2a2a4a" },
          ocean: { top: "#0a1525", bottom: "#050a12" },
          sun: { color: "#e0e0e0", glow: "rgba(200, 200, 255, 0.4)" },
          accent: "rgba(150, 150, 200, 0.2)",
          wall: { light: "#3d2818", dark: "#251610" },
          lanternGlow: "rgba(255, 200, 100, 0.6)",
          fish: "#3a4a5a",
        };
      default:
        return {
          sky: { top: "#4a90d9", middle: "#87ceeb", bottom: "#b0e0e6" },
          ocean: { top: "#1e6091", bottom: "#0a3d62" },
          sun: { color: "#ffd54f", glow: "rgba(255, 200, 50, 0.6)" },
          accent: "rgba(255, 255, 255, 0.25)",
          wall: { light: "#5d4030", dark: "#3d2820" },
          lanternGlow: "rgba(255, 200, 100, 0.2)",
          fish: "#5a8aaa",
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

      {/* Porthole - centered, slightly bigger */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10"
        style={{ width: "min(55%, 50vh)", height: "min(55%, 50vh)" }}
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

          {/* Seagulls (SVG, day/sunset) */}
          {seagulls.map((seagull) => {
            const currentX = seagull.x + time * seagull.speed * 20 * seagull.direction;
            if (currentX < -10 || currentX > 110) return null;
            return (
              <svg
                key={seagull.id}
                className="absolute"
                style={{
                  top: `${seagull.y}%`,
                  left: `${currentX}%`,
                  width: "12px",
                  height: "8px",
                  transform: `translateY(${Math.sin(time * 4 + seagull.id) * 3}px) scaleX(${seagull.direction})`,
                  opacity: 0.8,
                }}
                viewBox="0 0 24 16"
              >
                <path d="M0 8 Q6 2 12 8 Q18 2 24 8" stroke="#333" strokeWidth="2" fill="none" />
              </svg>
            );
          })}

          {/* Clouds (day/sunset) */}
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

          {/* Distant Boat (SVG) */}
          {boats.map((boat) => {
            const currentX = boat.x + time * boat.speed * 20 * boat.direction;
            if (currentX < -5 || currentX > 105) return null;
            return (
              <svg
                key={boat.id}
                className="absolute"
                style={{
                  top: "47%",
                  left: `${currentX}%`,
                  width: "14px",
                  height: "12px",
                  transform: `translateY(${Math.sin(time * 1.5) * 1}px) scaleX(${boat.direction})`,
                  opacity: 0.7,
                }}
                viewBox="0 0 28 24"
              >
                {/* Hull */}
                <path d="M2 18 L6 22 L22 22 L26 18 L24 18 L20 14 L8 14 L4 18 Z" fill="#5a3d25" />
                {/* Sail */}
                <path d="M14 4 L14 14 L6 14 Z" fill="#f5f5f0" stroke="#ccc" strokeWidth="0.5" />
                <path d="M14 6 L14 14 L20 14 Z" fill="#e8e8e0" stroke="#ccc" strokeWidth="0.5" />
                {/* Mast */}
                <rect x="13" y="2" width="2" height="14" fill="#4a3520" />
              </svg>
            );
          })}

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
            {/* Waves */}
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

            {/* Fish (SVG) */}
            {fish.map((f) => {
              const currentX = f.x + time * f.speed * 20 * f.direction;
              if (currentX < -10 || currentX > 110) return null;
              return (
                <svg
                  key={f.id}
                  className="absolute"
                  style={{
                    top: `${f.y}%`,
                    left: `${currentX}%`,
                    width: "10px",
                    height: "6px",
                    transform: `translateY(${Math.sin(time * 3 + f.id) * 2}px) scaleX(${f.direction})`,
                    opacity: 0.7,
                  }}
                  viewBox="0 0 20 12"
                >
                  <ellipse cx="10" cy="6" rx="8" ry="4" fill={colors.fish} />
                  <path d="M18 6 L22 2 L22 10 Z" fill={colors.fish} />
                  <circle cx="5" cy="5" r="1" fill="#fff" opacity="0.8" />
                </svg>
              );
            })}

            {/* Dolphin (SVG) */}
            {dolphins.map((dolphin) => {
              const currentX = dolphin.x + time * 0.4 * 20 * dolphin.direction;
              if (currentX < -15 || currentX > 115) return null;
              const jumpProgress = ((currentX - dolphin.x) * dolphin.direction) / 40;
              const jumpY = Math.sin(jumpProgress * Math.PI) * 30;
              return (
                <svg
                  key={dolphin.id}
                  className="absolute"
                  style={{
                    top: `${25 - jumpY}%`,
                    left: `${currentX}%`,
                    width: "18px",
                    height: "10px",
                    transform: `scaleX(${dolphin.direction}) rotate(${jumpY > 15 ? -30 : jumpY > 5 ? 0 : 30}deg)`,
                    opacity: 0.85,
                  }}
                  viewBox="0 0 36 20"
                >
                  {/* Body */}
                  <path d="M4 12 Q8 6 18 6 Q28 6 32 10 Q28 14 18 14 Q8 14 4 12 Z" fill="#4a7a9a" />
                  {/* Dorsal fin */}
                  <path d="M16 6 L18 2 L20 6 Z" fill="#4a7a9a" />
                  {/* Tail */}
                  <path d="M32 10 L36 6 L36 14 Z" fill="#4a7a9a" />
                  {/* Belly */}
                  <path d="M8 12 Q18 16 28 12" stroke="#8ab" strokeWidth="1" fill="none" />
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
