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

interface Fish {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: number;
  type: "fish" | "school";
}

interface Dolphin {
  id: number;
  x: number;
  phase: number; // 0: entering, 1: jumping, 2: exiting
  direction: number;
}

interface DistantBoat {
  id: number;
  x: number;
  speed: number;
  direction: number;
}

export function CabinView({ progress, timeOfDay }: CabinViewProps) {
  const [time, setTime] = useState(0);
  const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);
  const [seagulls, setSeagulls] = useState<Seagull[]>([]);
  const [fish, setFish] = useState<Fish[]>([]);
  const [dolphins, setDolphins] = useState<Dolphin[]>([]);
  const [distantBoats, setDistantBoats] = useState<DistantBoat[]>([]);

  // Animation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Water drops on porthole
  useEffect(() => {
    const createDrop = () => {
      const newDrop: WaterDrop = {
        id: Date.now() + Math.random(),
        x: 20 + Math.random() * 60,
        startY: -5,
        speed: 0.4 + Math.random() * 0.3,
        size: 2 + Math.random() * 2,
      };
      setWaterDrops((prev) => [...prev.slice(-3), newDrop]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.5) createDrop();
    }, 6000 + Math.random() * 4000);

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
        y: 15 + Math.random() * 25,
        speed: 0.25 + Math.random() * 0.15,
        direction: fromRight ? -1 : 1,
      };
      setSeagulls((prev) => [...prev.slice(-2), newSeagull]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.5) createSeagull();
    }, 8000 + Math.random() * 4000);

    setTimeout(createSeagull, 2000);
    return () => clearInterval(interval);
  }, [timeOfDay]);

  // Fish swimming in ocean
  useEffect(() => {
    const createFish = () => {
      const fromRight = Math.random() > 0.5;
      const newFish: Fish = {
        id: Date.now() + Math.random(),
        x: fromRight ? 110 : -10,
        y: 60 + Math.random() * 30,
        speed: 0.15 + Math.random() * 0.1,
        direction: fromRight ? -1 : 1,
        type: Math.random() > 0.7 ? "school" : "fish",
      };
      setFish((prev) => [...prev.slice(-3), newFish]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.4) createFish();
    }, 5000 + Math.random() * 5000);

    setTimeout(createFish, 2000);
    return () => clearInterval(interval);
  }, []);

  // Dolphins (rare)
  useEffect(() => {
    const createDolphin = () => {
      const fromRight = Math.random() > 0.5;
      const newDolphin: Dolphin = {
        id: Date.now() + Math.random(),
        x: fromRight ? 110 : -10,
        phase: 0,
        direction: fromRight ? -1 : 1,
      };
      setDolphins((prev) => [...prev.slice(-1), newDolphin]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) createDolphin();
    }, 15000 + Math.random() * 10000);

    setTimeout(createDolphin, 8000);
    return () => clearInterval(interval);
  }, []);

  // Distant boats
  useEffect(() => {
    const createBoat = () => {
      const fromRight = Math.random() > 0.5;
      const newBoat: DistantBoat = {
        id: Date.now() + Math.random(),
        x: fromRight ? 105 : -5,
        speed: 0.03 + Math.random() * 0.02,
        direction: fromRight ? -1 : 1,
      };
      setDistantBoats((prev) => [...prev.slice(-1), newBoat]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.6) createBoat();
    }, 20000 + Math.random() * 15000);

    setTimeout(createBoat, 5000);
    return () => clearInterval(interval);
  }, []);

  // Ocean bobbing effect
  const oceanBob = useMemo(() => {
    const bobY = Math.sin(time * 0.5) * 2;
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
          ambient: "rgba(255, 150, 50, 0.15)",
          wall: { from: "#4d3220", to: "#2a1a0f" },
        };
      case "night":
        return {
          sky: { top: "#0a0a1a", middle: "#1a1a3a", bottom: "#2a2a4a" },
          ocean: { top: "#0a1525", bottom: "#050a12" },
          sun: { color: "#e0e0e0", glow: "rgba(200, 200, 255, 0.4)" },
          accent: "rgba(150, 150, 200, 0.2)",
          ambient: "rgba(255, 200, 100, 0.08)",
          wall: { from: "#2d1810", to: "#1a0f08" },
        };
      default: // day
        return {
          sky: { top: "#4a90d9", middle: "#87ceeb", bottom: "#b0e0e6" },
          ocean: { top: "#1e6091", bottom: "#0a3d62" },
          sun: { color: "#ffd54f", glow: "rgba(255, 200, 50, 0.6)" },
          accent: "rgba(255, 255, 255, 0.25)",
          ambient: "rgba(100, 150, 255, 0.08)",
          wall: { from: "#5d3d25", to: "#3d2817" },
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
          background: `linear-gradient(to bottom, ${colors.wall.from} 0%, ${colors.wall.to} 100%)`,
        }}
      />

      {/* Wood grain texture */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full"
            style={{
              top: `${8.3 * i}%`,
              height: "1px",
              background: "linear-gradient(to right, transparent 0%, rgba(139,90,43,0.5) 20%, rgba(139,90,43,0.3) 50%, rgba(139,90,43,0.5) 80%, transparent 100%)",
            }}
          />
        ))}
        {/* Vertical grain */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`v${i}`}
            className="absolute h-full"
            style={{
              left: `${16.6 * i + 8}%`,
              width: "1px",
              background: "linear-gradient(to bottom, transparent, rgba(100,60,30,0.2), transparent)",
            }}
          />
        ))}
      </div>

      {/* Wall lamp (left side) */}
      <div className="absolute left-3 top-[20%] z-20">
        <div className="w-2 h-3 bg-amber-800 rounded-t-sm mx-auto" />
        <div
          className="w-5 h-7 rounded-b-full"
          style={{
            background: timeOfDay === "night"
              ? "radial-gradient(ellipse at center, #ffcc66 0%, #cc8833 80%)"
              : "linear-gradient(to bottom, #d4a94a, #b8860b)",
            boxShadow: timeOfDay === "night"
              ? "0 0 25px rgba(255, 200, 100, 0.6), 0 0 50px rgba(255, 180, 80, 0.3)"
              : "none",
          }}
        />
        {/* Lamp glow on wall */}
        {timeOfDay === "night" && (
          <div
            className="absolute -left-4 top-6 w-16 h-24 rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(255, 200, 100, 0.15), transparent 70%)",
            }}
          />
        )}
      </div>

      {/* Wall lamp (right side) */}
      <div className="absolute right-3 top-[20%] z-20">
        <div className="w-2 h-3 bg-amber-800 rounded-t-sm mx-auto" />
        <div
          className="w-5 h-7 rounded-b-full"
          style={{
            background: timeOfDay === "night"
              ? "radial-gradient(ellipse at center, #ffcc66 0%, #cc8833 80%)"
              : "linear-gradient(to bottom, #d4a94a, #b8860b)",
            boxShadow: timeOfDay === "night"
              ? "0 0 25px rgba(255, 200, 100, 0.6), 0 0 50px rgba(255, 180, 80, 0.3)"
              : "none",
          }}
        />
        {timeOfDay === "night" && (
          <div
            className="absolute -right-4 top-6 w-16 h-24 rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(255, 200, 100, 0.15), transparent 70%)",
            }}
          />
        )}
      </div>

      {/* Porthole container - centered, smaller */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: "10%" }}>
        <div className="relative w-[45%] aspect-square">
          {/* Outer brass ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(145deg, #d4a94a 0%, #b8860b 30%, #8b6914 60%, #705812 100%)",
              boxShadow: `
                0 4px 15px rgba(0,0,0,0.5),
                inset 0 2px 3px rgba(255,215,0,0.3),
                inset 0 -2px 3px rgba(0,0,0,0.3)
              `,
            }}
          />

          {/* Inner brass ring */}
          <div
            className="absolute rounded-full"
            style={{
              top: "6%",
              left: "6%",
              right: "6%",
              bottom: "6%",
              background: "linear-gradient(145deg, #8b6914 0%, #705812 50%, #5a4610 100%)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
            }}
          />

          {/* Bolts */}
          {boltPositions.map((pos, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full z-10"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                background: "linear-gradient(145deg, #c4993a 0%, #8b6914 50%, #5a4610 100%)",
                boxShadow: `
                  inset 0 1px 1px rgba(255,215,0,0.4),
                  inset 0 -1px 1px rgba(0,0,0,0.3),
                  0 1px 2px rgba(0,0,0,0.3)
                `,
              }}
            >
              {/* Bolt slot */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-0.5 rounded-sm"
                style={{ background: "rgba(0,0,0,0.4)" }}
              />
            </div>
          ))}

          {/* Glass area (ocean view) */}
          <div
            className="absolute rounded-full overflow-hidden"
            style={{
              top: "10%",
              left: "10%",
              right: "10%",
              bottom: "10%",
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
            }}
          >
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
                top: timeOfDay === "night" ? "15%" : "20%",
                right: "25%",
                width: timeOfDay === "night" ? "18px" : "22px",
                height: timeOfDay === "night" ? "18px" : "22px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${colors.sun.color} 0%, ${colors.sun.color} 50%, transparent 70%)`,
                filter: `blur(1px) drop-shadow(0 0 12px ${colors.sun.glow})`,
              }}
            />

            {/* Stars (night only) */}
            {timeOfDay === "night" && [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-0.5 bg-white rounded-full"
                style={{
                  top: `${8 + (i % 4) * 10}%`,
                  left: `${10 + (i * 20) % 80}%`,
                  opacity: 0.3 + Math.sin(time * 2 + i) * 0.4,
                }}
              />
            ))}

            {/* Clouds (day/sunset) */}
            {timeOfDay !== "night" && [...Array(2)].map((_, i) => (
              <svg
                key={i}
                className="absolute"
                style={{
                  top: `${12 + i * 15}%`,
                  left: `${((time * (0.3 + i * 0.1) * 12) % 140) - 20}%`,
                  width: `${28 + i * 8}px`,
                  height: `${14 + i * 4}px`,
                  opacity: 0.5 - i * 0.15,
                }}
                viewBox="0 0 64 32"
              >
                <ellipse cx="32" cy="20" rx="28" ry="10" fill={colors.accent} />
                <ellipse cx="20" cy="16" rx="14" ry="10" fill={colors.accent} />
                <ellipse cx="44" cy="16" rx="14" ry="10" fill={colors.accent} />
              </svg>
            ))}

            {/* Distant boat */}
            {distantBoats.map((boat) => {
              const currentX = boat.x + time * boat.speed * 20 * boat.direction;
              if (currentX < -5 || currentX > 105) return null;
              return (
                <div
                  key={boat.id}
                  className="absolute text-[8px]"
                  style={{
                    top: "48%",
                    left: `${currentX}%`,
                    transform: `translateY(${Math.sin(time * 1.5) * 1}px) scaleX(${boat.direction})`,
                    opacity: 0.6,
                  }}
                >
                  ⛵
                </div>
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
                    className="absolute left-0 w-[200%] h-5"
                    style={{
                      top: `${10 + i * 25}%`,
                      opacity: 0.35 - i * 0.08,
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

              {/* Fish swimming */}
              {fish.map((f) => {
                const currentX = f.x + time * f.speed * 20 * f.direction;
                if (currentX < -10 || currentX > 110) return null;
                return (
                  <div
                    key={f.id}
                    className="absolute"
                    style={{
                      top: `${f.y}%`,
                      left: `${currentX}%`,
                      fontSize: f.type === "school" ? "10px" : "8px",
                      transform: `translateY(${Math.sin(time * 3 + f.id) * 3}px) scaleX(${f.direction})`,
                      opacity: 0.7,
                    }}
                  >
                    {f.type === "school" ? "🐟🐟🐟" : "🐟"}
                  </div>
                );
              })}

              {/* Dolphins jumping */}
              {dolphins.map((dolphin) => {
                const currentX = dolphin.x + time * 0.5 * 20 * dolphin.direction;
                if (currentX < -15 || currentX > 115) return null;
                const jumpY = Math.sin(((currentX - dolphin.x) / 30) * Math.PI) * 25;
                return (
                  <div
                    key={dolphin.id}
                    className="absolute text-sm"
                    style={{
                      top: `${30 - jumpY}%`,
                      left: `${currentX}%`,
                      transform: `scaleX(${dolphin.direction}) rotate(${jumpY > 10 ? -30 : jumpY > 0 ? 0 : 30}deg)`,
                      opacity: 0.85,
                    }}
                  >
                    🐬
                  </div>
                );
              })}

              {/* Moon reflection (night) */}
              {timeOfDay === "night" && (
                <div
                  className="absolute"
                  style={{
                    top: "8%",
                    right: "22%",
                    width: "16px",
                    height: "30px",
                    background: "linear-gradient(to bottom, rgba(200,200,255,0.25), transparent)",
                    filter: "blur(5px)",
                    transform: `scaleX(${0.8 + Math.sin(time * 2) * 0.2})`,
                  }}
                />
              )}

              {/* Sparkles */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  style={{
                    top: `${20 + (i % 2) * 30}%`,
                    left: `${15 + i * 20}%`,
                    opacity: Math.abs(Math.sin(time * 2.5 + i * 0.8)) * (timeOfDay === "night" ? 0.3 : 0.5),
                  }}
                />
              ))}
            </div>

            {/* Seagulls */}
            {seagulls.map((seagull) => {
              const currentX = seagull.x + time * seagull.speed * 15 * seagull.direction;
              if (currentX < -10 || currentX > 110) return null;
              return (
                <div
                  key={seagull.id}
                  className="absolute text-[10px]"
                  style={{
                    top: `${seagull.y}%`,
                    left: `${currentX}%`,
                    transform: `translateY(${Math.sin(time * 3 + seagull.id) * 3}px) scaleX(${seagull.direction})`,
                    opacity: 0.7,
                  }}
                >
                  🕊️
                </div>
              );
            })}

            {/* Glass reflection */}
            <div
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)",
              }}
            />

            {/* Water droplets on glass */}
            {waterDrops.map((drop) => (
              <div
                key={drop.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${drop.x}%`,
                  top: `${drop.startY + ((time * drop.speed * 20) % 110)}%`,
                  width: `${drop.size}px`,
                  height: `${drop.size * 1.6}px`,
                  background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.5) 0%, rgba(180,200,255,0.25) 50%, transparent 70%)",
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bed area (bottom 15%) - just pillows visible */}
      <div className="absolute bottom-0 left-0 right-0 h-[15%] z-10">
        {/* Bed cover */}
        <div
          className="absolute inset-x-3 top-2 bottom-0 rounded-t-lg"
          style={{
            background: "linear-gradient(to bottom, #2a4a6a 0%, #1e3a52 100%)",
            boxShadow: "inset 0 3px 10px rgba(0,0,0,0.35)",
          }}
        />

        {/* Pillows (2) */}
        <div className="absolute left-5 top-0 flex gap-1.5">
          <div
            className="w-12 h-6 rounded-md"
            style={{
              background: "linear-gradient(to bottom, #f8f8f5 0%, #e8e8e2 50%, #dcdcd5 100%)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.5)",
            }}
          />
          <div
            className="w-12 h-6 rounded-md"
            style={{
              background: "linear-gradient(to bottom, #f8f8f5 0%, #e8e8e2 50%, #dcdcd5 100%)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.5)",
            }}
          />
        </div>
      </div>

      {/* Ambient lighting from porthole */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center 40%, ${colors.ambient} 0%, transparent 60%)`,
        }}
      />

      {/* Time indicator badge */}
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
