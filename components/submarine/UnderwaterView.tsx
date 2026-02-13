"use client";

// 해저 뷰 - 리얼리스틱 심해 풍경 + 수심 반응 + 이벤트

import { useEffect, useState, useMemo } from "react";
import type { JourneyPhase, ActiveEvent } from "@/lib/submarineEvents";

interface UnderwaterViewProps {
  progress?: number;
  phase?: JourneyPhase;
  depth?: number;
  activeEvents?: ActiveEvent[];
}

interface Particle { id: number; x: number; y: number; size: number; duration: number; delay: number; opacity: number; }
interface Fish { id: number; y: number; size: number; duration: number; delay: number; direction: "left" | "right"; depth: number; color: string; }
interface Jellyfish { id: number; x: number; size: number; duration: number; delay: number; color: string; }
interface LargeCreature { id: number; type: "whale" | "manta" | "shark" | "turtle"; y: number; size: number; duration: number; delay: number; direction: "left" | "right"; }
interface FishSchool { id: number; y: number; count: number; duration: number; delay: number; direction: "left" | "right"; }
interface UnderwaterEvent { id: number; type: "shipwreck" | "bioluminescent" | "current" | "bubbleBurst"; x: number; y: number; active: boolean; }

export function UnderwaterView({ progress = 0, phase = "open_ocean", depth = 200, activeEvents = [] }: UnderwaterViewProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [fish, setFish] = useState<Fish[]>([]);
  const [jellyfish, setJellyfish] = useState<Jellyfish[]>([]);
  const [largeCreatures, setLargeCreatures] = useState<LargeCreature[]>([]);
  const [fishSchools, setFishSchools] = useState<FishSchool[]>([]);
  const [events, setEvents] = useState<UnderwaterEvent[]>([]);

  // 이벤트 체크
  const hasDeepTrench = activeEvents.some(e => e.event.type === "deep_trench");
  const hasVolcano = activeEvents.some(e => e.event.type === "volcano_glow");
  const hasRuins = activeEvents.some(e => e.event.type === "ruins");
  const hasCable = activeEvents.some(e => e.event.type === "cable");
  const hasGiantSquid = activeEvents.some(e => e.event.type === "giant_squid");
  const hasJellyfishBloom = activeEvents.some(e => e.event.type === "jellyfish_bloom");
  const hasWhaleBreach = activeEvents.some(e => e.event.type === "whale_breach");

  // 수심 기반 배경 그라데이션
  const depthGradient = useMemo(() => {
    if (depth < 100) return "linear-gradient(180deg, #0e4a6e 0%, #0c3d5e 30%, #0a3050 60%, #082545 80%, #061f3a 100%)";
    if (depth > 250) return "linear-gradient(180deg, #030a18 0%, #020815 30%, #020610 60%, #01050c 80%, #010308 100%)";
    return "linear-gradient(180deg, #0c3547 0%, #0a2d42 10%, #08263d 25%, #061f35 40%, #05192e 55%, #041427 70%, #030f20 85%, #020a18 100%)";
  }, [depth]);

  // 수심 기반 갓레이 투명도
  const godRayOpacity = useMemo(() => {
    if (depth < 100) return 1.0;
    if (depth > 300) return 0.1;
    return 1.0 - ((depth - 100) / 200) * 0.9;
  }, [depth]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2 + 1, duration: Math.random() * 20 + 15,
      delay: Math.random() * 15, opacity: Math.random() * 0.15 + 0.03,
    }));
    setParticles(newParticles);

    const fishColors = ["#3a4a5c", "#2e3e4e", "#4a5a6a", "#3d4d5d", "#354555"];
    const newFish: Fish[] = Array.from({ length: 6 }, (_, i) => ({
      id: i, y: Math.random() * 50 + 25, size: Math.random() * 25 + 15,
      duration: Math.random() * 12 + 8, delay: Math.random() * 10,
      direction: Math.random() > 0.5 ? "left" : "right", depth: Math.random(),
      color: fishColors[Math.floor(Math.random() * fishColors.length)],
    }));
    setFish(newFish);

    const jellyfishColors = ["#5a6a7a", "#6a7a8a", "#4a5a6a"];
    const jellyCount = hasJellyfishBloom ? 10 : 2;
    const newJellyfish: Jellyfish[] = Array.from({ length: jellyCount }, (_, i) => ({
      id: i, x: Math.random() * 80 + 10, size: Math.random() * 30 + 25,
      duration: Math.random() * 20 + 15, delay: Math.random() * 8,
      color: jellyfishColors[Math.floor(Math.random() * jellyfishColors.length)],
    }));
    setJellyfish(newJellyfish);

    const creatureTypes: LargeCreature["type"][] = ["whale", "manta", "shark", "turtle"];
    const newLargeCreatures: LargeCreature[] = Array.from({ length: 4 }, (_, i) => ({
      id: i, type: creatureTypes[i % creatureTypes.length],
      y: Math.random() * 40 + 20, size: 80 + Math.random() * 60,
      duration: Math.random() * 30 + 25, delay: Math.random() * 20 + i * 8,
      direction: Math.random() > 0.5 ? "left" : "right",
    }));
    setLargeCreatures(newLargeCreatures);

    const newFishSchools: FishSchool[] = Array.from({ length: 3 }, (_, i) => ({
      id: i, y: Math.random() * 50 + 20, count: Math.floor(Math.random() * 8) + 6,
      duration: Math.random() * 15 + 12, delay: Math.random() * 10 + i * 5,
      direction: Math.random() > 0.5 ? "left" : "right",
    }));
    setFishSchools(newFishSchools);

    const initialEvents: UnderwaterEvent[] = [
      { id: 0, type: "shipwreck", x: 75, y: 65, active: true },
    ];
    setEvents(initialEvents);

    const eventInterval = setInterval(() => {
      const eventTypes: UnderwaterEvent["type"][] = ["bioluminescent", "current", "bubbleBurst"];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const newEvent: UnderwaterEvent = {
        id: Date.now(), type: randomType,
        x: Math.random() * 80 + 10,
        y: randomType === "bubbleBurst" ? 85 : Math.random() * 60 + 20,
        active: true,
      };
      setEvents(prev => [...prev.slice(-5), newEvent]);
    }, 8000);

    return () => clearInterval(eventInterval);
  }, [hasJellyfishBloom]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 배경 그라데이션 — 수심 반응 */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: depthGradient }}
      />

      {/* 해저 화산 붉은 빛 오버레이 */}
      {hasVolcano && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 30% 100%, rgba(220,38,38,0.15) 0%, rgba(220,38,38,0.05) 30%, transparent 60%)",
            animation: "volcanoPulse 3s ease-in-out infinite",
          }}
        />
      )}

      {/* 해구 통과 — 하단 어두움 */}
      {hasDeepTrench && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.8) 100%)",
          }}
        />
      )}

      {/* 깊이 안개 레이어 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center 120%, transparent 30%, rgba(3,15,32,0.4) 60%, rgba(2,10,24,0.7) 100%)",
        }}
      />

      {/* 코스틱 효과 — 얕을 때 더 밝음 */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ opacity: depth < 100 ? 0.12 : depth > 250 ? 0.03 : 0.07 }}
      >
        <svg className="absolute inset-0 w-full h-full" style={{ animation: "causticShift 20s linear infinite" }}>
          <defs>
            <filter id="causticFilter" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.015 0.02" numOctaves={3} seed={2} result="noise">
                <animate attributeName="baseFrequency" values="0.015 0.02;0.018 0.025;0.015 0.02" dur="12s" repeatCount="indefinite" />
              </feTurbulence>
              <feColorMatrix type="luminanceToAlpha" in="noise" result="luminance" />
              <feComponentTransfer in="luminance" result="threshold">
                <feFuncA type="discrete" tableValues="0 0 0.3 0.6 0.8 0.6 0.3 0" />
              </feComponentTransfer>
              <feFlood floodColor="#7db8d4" floodOpacity={1} result="color" />
              <feComposite in="color" in2="threshold" operator="in" />
            </filter>
          </defs>
          <rect width="100%" height="50%" filter="url(#causticFilter)" />
        </svg>
      </div>

      {/* 물결 노이즈 텍스처 */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          mixBlendMode: "soft-light",
        }}
      />

      {/* 갓 레이 — 수심 반응 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: godRayOpacity }}>
        {[18, 38, 55, 72, 88].map((left, i) => (
          <div
            key={i}
            className="absolute -top-10"
            style={{
              left: `${left}%`,
              width: `${15 + i * 4}px`,
              height: "120%",
              background: `linear-gradient(180deg,
                rgba(140,180,200,${0.06 - i * 0.008}) 0%,
                rgba(120,160,190,${0.04 - i * 0.005}) 25%,
                rgba(100,140,170,${0.02 - i * 0.003}) 50%,
                transparent 75%)`,
              transform: `skewX(${-15 + i * 6}deg)`,
              animation: `godRay ${12 + i * 4}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`,
              filter: "blur(8px)",
              borderRadius: "50% 50% 0 0",
            }}
          />
        ))}
      </div>

      {/* 플랑크톤/파티클 */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, opacity: p.opacity,
            animation: `particleFloat ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* 물고기 (멀리) */}
      {fish.filter(f => f.depth < 0.5).map((f) => (
        <div key={`far-${f.id}`} className="absolute" style={{
          top: `${f.y}%`, opacity: 0.2, filter: "blur(1px)",
          animation: `fishSwim${f.direction === "right" ? "Right" : "Left"} ${f.duration * 1.5}s linear infinite`,
          animationDelay: `${f.delay}s`,
        }}>
          <svg width={f.size * 0.7} height={f.size * 0.5} viewBox="0 0 40 24" style={{ transform: f.direction === "left" ? "scaleX(-1)" : "scaleX(1)" }}>
            <path d="M2,12 Q8,4 20,6 Q32,8 38,12 Q32,16 20,18 Q8,20 2,12 Z" fill={f.color} opacity="0.6" />
            <path d="M0,12 L6,8 L6,16 Z" fill={f.color} opacity="0.5" />
          </svg>
        </div>
      ))}

      {/* 해파리 */}
      {jellyfish.map((j) => (
        <div key={j.id} className="absolute" style={{
          left: `${j.x}%`,
          animation: `jellyfishFloat ${j.duration}s ease-in-out infinite`,
          animationDelay: `${j.delay}s`,
        }}>
          <div className="absolute rounded-full" style={{
            top: j.size * 0.2, left: "50%", transform: "translateX(-50%)",
            width: j.size * 1.2, height: j.size * 1.2,
            background: hasJellyfishBloom
              ? "radial-gradient(circle, rgba(120,180,220,0.35) 0%, rgba(90,150,180,0.15) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(100,150,180,0.2) 0%, rgba(70,120,150,0.08) 40%, transparent 70%)",
            animation: "jellyGlow 2s ease-in-out infinite",
            filter: "blur(8px)",
          }} />
          <svg width={j.size} height={j.size * 1.5} viewBox="0 0 40 60" style={{ position: "relative", zIndex: 1 }}>
            <defs>
              <radialGradient id={`jellyGrad-${j.id}`} cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="rgba(150,190,210,0.6)" />
                <stop offset="50%" stopColor={j.color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={j.color} stopOpacity="0.2" />
              </radialGradient>
            </defs>
            <ellipse cx="20" cy="15" rx="15" ry="12" fill={`url(#jellyGrad-${j.id})`} />
            <ellipse cx="20" cy="15" rx="10" ry="8" fill="rgba(200,220,230,0.2)" />
            <ellipse cx="17" cy="12" rx="3" ry="2" fill="rgba(200,220,230,0.3)" />
            <ellipse cx="20" cy="18" rx="6" ry="4" fill="rgba(70,120,150,0.3)" />
            {[8, 14, 20, 26, 32].map((x, i) => (
              <path key={i} d={`M${x},25 Q${x + (i % 2 === 0 ? 4 : -4)},38 ${x + (i % 2 === 0 ? 2 : -2)},55`}
                stroke="rgba(130,170,190,0.4)" strokeWidth="1.5" fill="none"
                style={{ animation: `tentacle ${2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </svg>
        </div>
      ))}

      {/* 물고기 (가까이) */}
      {fish.filter(f => f.depth >= 0.5).map((f) => (
        <div key={`near-${f.id}`} className="absolute" style={{
          top: `${f.y}%`, opacity: 0.5,
          animation: `fishSwim${f.direction === "right" ? "Right" : "Left"} ${f.duration}s linear infinite`,
          animationDelay: `${f.delay}s`,
        }}>
          <svg width={f.size} height={f.size * 0.6} viewBox="0 0 40 24" style={{ transform: f.direction === "left" ? "scaleX(-1)" : "scaleX(1)" }}>
            <path d="M2,12 Q8,4 20,6 Q32,8 38,12 Q32,16 20,18 Q8,20 2,12 Z" fill={f.color} />
            <circle cx="30" cy="10" r="2" fill="#0f172a" opacity="0.6" />
            <path d="M0,12 L6,8 L6,16 Z" fill={f.color} />
          </svg>
        </div>
      ))}

      {/* 거품 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const size = 2 + Math.random() * 7;
        return (
          <div key={`bubble-${i}`} className="absolute rounded-full" style={{
            left: `${10 + Math.random() * 80}%`,
            width: size, height: size * (0.9 + Math.random() * 0.2),
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,${0.12 + Math.random() * 0.1}), rgba(150,190,210,${0.03 + Math.random() * 0.04}))`,
            border: `0.5px solid rgba(255,255,255,${0.1 + Math.random() * 0.08})`,
            animation: `bubbleRise ${6 + Math.random() * 8}s ease-in infinite`,
            animationDelay: `${Math.random() * 10}s`,
          }} />
        );
      })}

      {/* 대형 해양생물 — 고래 */}
      {largeCreatures.filter(c => c.type === "whale").map((creature) => (
        <div key={`whale-${creature.id}`} className="absolute pointer-events-none" style={{
          top: `${creature.y}%`, opacity: 0.18, filter: "blur(1px)",
          animation: `creatureSwim${creature.direction === "right" ? "Right" : "Left"} ${creature.duration}s linear infinite`,
          animationDelay: `${creature.delay}s`,
        }}>
          <svg width={creature.size} height={creature.size * 0.4} viewBox="0 0 200 80" style={{ transform: creature.direction === "left" ? "scaleX(-1)" : "scaleX(1)" }}>
            <ellipse cx="100" cy="40" rx="80" ry="30" fill="#142838" />
            <path d="M10,40 Q-10,20 5,10 Q15,25 10,40 Q15,55 5,70 Q-10,60 10,40" fill="#142838" />
            <ellipse cx="110" cy="50" rx="50" ry="15" fill="#1a3448" opacity="0.7" />
            <path d="M120,25 Q130,5 140,20 Q130,25 120,25" fill="#142838" />
          </svg>
        </div>
      ))}

      {/* 만타레이 */}
      {largeCreatures.filter(c => c.type === "manta").map((creature) => (
        <div key={`manta-${creature.id}`} className="absolute pointer-events-none" style={{
          top: `${creature.y}%`, opacity: 0.22,
          animation: `creatureSwim${creature.direction === "right" ? "Right" : "Left"} ${creature.duration}s linear infinite`,
          animationDelay: `${creature.delay}s`,
        }}>
          <svg width={creature.size * 0.8} height={creature.size * 0.5} viewBox="0 0 120 60" style={{ transform: creature.direction === "left" ? "scaleX(-1)" : "scaleX(1)" }}>
            <path d="M60,30 Q30,10 5,25 Q30,35 60,30" fill="#1a3040" />
            <path d="M60,30 Q30,50 5,35 Q30,25 60,30" fill="#1a3040" />
            <path d="M60,30 Q90,10 115,25 Q90,35 60,30" fill="#1a3040" />
            <path d="M60,30 Q90,50 115,35 Q90,25 60,30" fill="#1a3040" />
            <ellipse cx="60" cy="30" rx="20" ry="10" fill="#243a4a" />
            <path d="M40,30 L10,30" stroke="#1a3040" strokeWidth="3" />
          </svg>
        </div>
      ))}

      {/* 상어 */}
      {largeCreatures.filter(c => c.type === "shark").map((creature) => (
        <div key={`shark-${creature.id}`} className="absolute pointer-events-none" style={{
          top: `${creature.y}%`, opacity: 0.25,
          animation: `creatureSwim${creature.direction === "right" ? "Right" : "Left"} ${creature.duration * 0.7}s linear infinite`,
          animationDelay: `${creature.delay}s`,
        }}>
          <svg width={creature.size * 0.7} height={creature.size * 0.3} viewBox="0 0 100 35" style={{ transform: creature.direction === "left" ? "scaleX(-1)" : "scaleX(1)" }}>
            <path d="M5,18 Q25,8 50,12 Q75,10 95,18 Q75,26 50,24 Q25,28 5,18" fill="#2a3a48" />
            <path d="M45,12 L50,0 L55,12" fill="#2a3a48" />
            <path d="M5,18 L0,8 L8,18 L0,28 L5,18" fill="#2a3a48" />
          </svg>
        </div>
      ))}

      {/* 거북이 */}
      {largeCreatures.filter(c => c.type === "turtle").map((creature) => (
        <div key={`turtle-${creature.id}`} className="absolute pointer-events-none" style={{
          top: `${creature.y}%`, opacity: 0.3,
          animation: `creatureSwim${creature.direction === "right" ? "Right" : "Left"} ${creature.duration * 1.2}s linear infinite`,
          animationDelay: `${creature.delay}s`,
        }}>
          <svg width={creature.size * 0.5} height={creature.size * 0.4} viewBox="0 0 60 45" style={{ transform: creature.direction === "left" ? "scaleX(-1)" : "scaleX(1)" }}>
            <ellipse cx="30" cy="22" rx="18" ry="14" fill="#2a4a38" />
            <ellipse cx="30" cy="22" rx="12" ry="9" fill="#345a48" opacity="0.7" />
            <ellipse cx="52" cy="22" rx="6" ry="5" fill="#345a48" />
            <ellipse cx="22" cy="12" rx="8" ry="4" fill="#345a48" transform="rotate(-30 22 12)" />
            <ellipse cx="22" cy="32" rx="8" ry="4" fill="#345a48" transform="rotate(30 22 32)" />
            <ellipse cx="38" cy="12" rx="6" ry="3" fill="#345a48" transform="rotate(-20 38 12)" />
            <ellipse cx="38" cy="32" rx="6" ry="3" fill="#345a48" transform="rotate(20 38 32)" />
          </svg>
        </div>
      ))}

      {/* 대왕 오징어 (이벤트) */}
      {hasGiantSquid && (
        <div className="absolute pointer-events-none" style={{
          top: "25%", opacity: 0.2,
          animation: "creatureSwimLeft 15s linear forwards",
        }}>
          <svg width="200" height="120" viewBox="0 0 200 120">
            <ellipse cx="150" cy="50" rx="40" ry="25" fill="#1a2838" />
            <circle cx="170" cy="42" r="8" fill="#0f1a28" />
            <circle cx="172" cy="42" r="3" fill="#1a3040" />
            {Array.from({ length: 8 }).map((_, i) => (
              <path key={i}
                d={`M110,${35 + i * 8} Q${60 - i * 5},${30 + i * 10} ${10 + i * 3},${40 + i * 8}`}
                stroke="#1a2838" strokeWidth={3 - i * 0.2} fill="none" opacity={0.6 - i * 0.05}
                style={{ animation: `tentacle ${2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </svg>
        </div>
      )}

      {/* 고래 — 수면으로 올라감 (whale_breach 이벤트) */}
      {hasWhaleBreach && (
        <div className="absolute pointer-events-none" style={{
          left: "20%", opacity: 0.25,
          animation: "whaleRise 6s ease-out forwards",
        }}>
          <svg width="160" height="70" viewBox="0 0 200 80">
            <ellipse cx="100" cy="40" rx="80" ry="30" fill="#142838" />
            <path d="M10,40 Q-10,20 5,10 Q15,25 10,40 Q15,55 5,70 Q-10,60 10,40" fill="#142838" />
            <ellipse cx="110" cy="50" rx="50" ry="15" fill="#1a3448" opacity="0.7" />
            <path d="M120,25 Q130,5 140,20 Q130,25 120,25" fill="#142838" />
          </svg>
        </div>
      )}

      {/* 물고기 떼 */}
      {fishSchools.map((school) => (
        <div key={`school-${school.id}`} className="absolute pointer-events-none" style={{
          top: `${school.y}%`, opacity: 0.35,
          animation: `creatureSwim${school.direction === "right" ? "Right" : "Left"} ${school.duration}s linear infinite`,
          animationDelay: `${school.delay}s`,
        }}>
          <svg width={school.count * 12} height={40} viewBox={`0 0 ${school.count * 12} 40`}>
            {Array.from({ length: school.count }).map((_, i) => (
              <g key={i} transform={`translate(${i * 12 + Math.sin(i) * 3}, ${15 + Math.sin(i * 2) * 8})`}
                style={{ transform: school.direction === "left" ? "scaleX(-1)" : "scaleX(1)" }}>
                <path d="M0,5 Q4,2 8,5 Q4,8 0,5" fill="#3a4a5c" opacity={0.4 + Math.random() * 0.2} />
                <path d="M-2,5 L0,3 L0,7 Z" fill="#3a4a5c" opacity="0.35" />
              </g>
            ))}
          </svg>
        </div>
      ))}

      {/* 이벤트: 난파선 */}
      {events.filter(e => e.type === "shipwreck" && e.active).map((event) => (
        <div key={`shipwreck-${event.id}`} className="absolute pointer-events-none" style={{
          left: `${event.x}%`, top: `${event.y}%`, opacity: 0.15, filter: "blur(1px)",
        }}>
          <svg width="80" height="50" viewBox="0 0 80 50">
            <path d="M5,35 Q10,25 40,28 Q70,25 75,35 L70,45 L10,45 Z" fill="#1e2a38" />
            <line x1="30" y1="28" x2="25" y2="10" stroke="#2a3a48" strokeWidth="3" />
            <line x1="50" y1="28" x2="55" y2="5" stroke="#2a3a48" strokeWidth="2" />
            <ellipse cx="45" cy="36" rx="5" ry="4" fill="#0e1a28" />
          </svg>
        </div>
      ))}

      {/* 이벤트: 발광 생물 */}
      {events.filter(e => e.type === "bioluminescent" && e.active).map((event) => (
        <div key={`bio-${event.id}`} className="absolute pointer-events-none" style={{
          left: `${event.x}%`, top: `${event.y}%`,
          animation: "biolumFade 5s ease-in-out forwards",
        }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              left: (Math.random() - 0.5) * 60, top: (Math.random() - 0.5) * 60,
              width: 1.5 + Math.random() * 1.5, height: 1.5 + Math.random() * 1.5,
              background: `rgba(90,160,180,${0.3 + Math.random() * 0.4})`,
              animation: `biolumTwinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }} />
          ))}
        </div>
      ))}

      {/* 이벤트: 해류 */}
      {events.filter(e => e.type === "current" && e.active).map((event) => (
        <div key={`current-${event.id}`} className="absolute pointer-events-none" style={{
          left: `${event.x}%`, top: `${event.y}%`,
          animation: "currentDrift 6s ease-out forwards",
        }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{
              top: (Math.random() - 0.5) * 50, left: Math.random() * 10,
              width: 1 + Math.random() * 1.5, height: 1 + Math.random() * 1.5,
              opacity: 0.08 + Math.random() * 0.1,
              animation: `currentParticle ${3 + Math.random() * 2}s linear infinite`,
              animationDelay: `${Math.random() * 1.5}s`,
            }} />
          ))}
        </div>
      ))}

      {/* 이벤트: 기포 폭발 */}
      {events.filter(e => e.type === "bubbleBurst" && e.active).map((event) => (
        <div key={`burst-${event.id}`} className="absolute pointer-events-none" style={{
          left: `${event.x}%`, top: `${event.y}%`,
        }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              left: (Math.random() - 0.5) * 40,
              width: 2 + Math.random() * 4, height: 2 + Math.random() * 4,
              background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), rgba(150,190,210,0.05))`,
              border: "0.5px solid rgba(255,255,255,0.12)",
              animation: `bubbleBurst ${2 + Math.random() * 2}s ease-out forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
            }} />
          ))}
        </div>
      ))}

      {/* 해저 화산 — 불씨 입자 */}
      {hasVolcano && (
        <div className="absolute bottom-0 left-[20%] w-[30%] h-[40%] pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={`ember-${i}`} className="absolute rounded-full" style={{
              left: `${30 + Math.random() * 40}%`,
              bottom: 0,
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              background: `rgba(${200 + Math.random() * 55}, ${50 + Math.random() * 50}, 0, ${0.3 + Math.random() * 0.4})`,
              animation: `emberRise ${3 + Math.random() * 4}s ease-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }} />
          ))}
          {/* 화산 입구 빛 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-10" style={{
            background: "radial-gradient(ellipse, rgba(220,38,38,0.4) 0%, rgba(220,38,38,0.1) 50%, transparent 80%)",
            animation: "volcanoPulse 3s ease-in-out infinite",
            filter: "blur(4px)",
          }} />
        </div>
      )}

      {/* 고대 유적 (이벤트) */}
      {hasRuins && (
        <div className="absolute bottom-14 left-[35%] pointer-events-none opacity-30">
          <svg width="160" height="80" viewBox="0 0 160 80">
            {/* 석조 기둥들 */}
            <rect x="10" y="10" width="12" height="70" fill="#2a3a48" rx="2" />
            <rect x="8" y="5" width="16" height="8" fill="#3a4a58" rx="1" />
            <rect x="35" y="20" width="12" height="60" fill="#2a3a48" rx="2" />
            <rect x="33" y="15" width="16" height="8" fill="#3a4a58" rx="1" />
            <rect x="60" y="25" width="10" height="55" fill="#2a3a48" rx="2" opacity="0.7" />
            <rect x="90" y="30" width="12" height="50" fill="#2a3a48" rx="2" opacity="0.6" />
            <rect x="88" y="25" width="16" height="8" fill="#3a4a58" rx="1" opacity="0.5" />
            {/* 무너진 돌 */}
            <ellipse cx="120" cy="70" rx="15" ry="8" fill="#2a3a48" opacity="0.4" />
            <ellipse cx="140" cy="75" rx="10" ry="5" fill="#3a4a58" opacity="0.3" />
            {/* 신비로운 빛 */}
            <ellipse cx="50" cy="40" rx="40" ry="20" fill="rgba(100,180,200,0.05)" style={{ animation: "ruinsGlow 4s ease-in-out infinite" }} />
          </svg>
        </div>
      )}

      {/* 해저 케이블 (이벤트) */}
      {hasCable && (
        <div className="absolute left-0 right-0 pointer-events-none" style={{ top: "55%" }}>
          <svg width="100%" height="8" viewBox="0 0 400 8" preserveAspectRatio="none">
            <path d="M0,4 Q50,2 100,4 Q150,6 200,4 Q250,2 300,4 Q350,6 400,4" stroke="#3a4a58" strokeWidth="3" fill="none" opacity="0.4" />
            <path d="M0,4 Q50,2 100,4 Q150,6 200,4 Q250,2 300,4 Q350,6 400,4" stroke="#5a6a78" strokeWidth="1" fill="none" opacity="0.2" />
          </svg>
        </div>
      )}

      {/* 해저 바닥 */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <svg viewBox="0 0 400 130" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,80 Q50,50 100,70 T200,55 T300,70 T400,50 L400,130 L0,130 Z" fill={hasDeepTrench ? "#020a12" : "#061f30"} opacity="0.7" />
          <path d="M0,90 Q60,65 120,80 T240,70 T360,85 T400,75 L400,130 L0,130 Z" fill={hasDeepTrench ? "#010810" : "#051a28"} />
          <path d="M0,100 Q80,85 150,95 T280,90 T400,100 L400,130 L0,130 Z" fill={hasDeepTrench ? "#010508" : "#041520"} />

          {/* 해구 심연 */}
          {hasDeepTrench && (
            <>
              <path d="M100,100 Q150,125 200,130 Q250,125 300,100 L300,130 L100,130 Z" fill="#000205" />
              <ellipse cx="200" cy="115" rx="60" ry="8" fill="rgba(50,100,130,0.1)" style={{ animation: "ruinsGlow 5s ease-in-out infinite" }} />
            </>
          )}

          {/* 산호 — 얕을 때만 풍성 */}
          {depth < 200 && (
            <>
              <g style={{ animation: "coralSway 5s ease-in-out infinite" }}>
                <path d="M75,95 Q70,75 75,60 Q80,75 75,95" fill="#5a3028" opacity="0.45" />
                <path d="M80,95 Q78,80 85,68 Q88,80 80,95" fill="#4e2828" opacity="0.35" />
                <path d="M85,95 Q90,82 88,72 Q95,82 90,95" fill="#5a3a28" opacity="0.4" />
              </g>
              <g style={{ animation: "coralSway 6s ease-in-out infinite", animationDelay: "1s" }}>
                <path d="M290,90 Q285,70 290,55 Q295,70 290,90" fill="#3a2a50" opacity="0.35" />
                <path d="M298,90 Q295,75 302,62 Q308,75 300,90" fill="#4a3a5a" opacity="0.3" />
                <path d="M305,90 Q310,78 308,68 Q315,78 310,90" fill="#5a4a68" opacity="0.35" />
              </g>
              <g style={{ animation: "coralSway 4.5s ease-in-out infinite", animationDelay: "0.5s" }}>
                <ellipse cx="190" cy="95" rx="8" ry="12" fill="#1a4038" opacity="0.45" />
                <ellipse cx="200" cy="92" rx="10" ry="15" fill="#2a5048" opacity="0.35" />
                <ellipse cx="210" cy="95" rx="7" ry="10" fill="#3a5a50" opacity="0.3" />
              </g>
            </>
          )}

          <ellipse cx="50" cy="105" rx="18" ry="12" fill="#082838" opacity="0.5" />
          <ellipse cx="340" cy="100" rx="22" ry="15" fill="#062030" opacity="0.4" />
        </svg>

        {/* 켈프 숲 — 얕을 때만 */}
        {depth < 180 && [8, 18, 28, 42, 58, 72, 82, 92].map((left, i) => (
          <svg key={`kelp-${i}`} className="absolute bottom-6" style={{
            left: `${left}%`, height: 50 + (i % 3) * 15, zIndex: i % 2 === 0 ? 1 : 0,
          }} viewBox="0 0 30 80">
            <defs>
              <linearGradient id={`kelpGrad-${i}`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0a2a20" />
                <stop offset="100%" stopColor="#1a4a38" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <path d={`M15,80 Q${8 + (i % 2) * 4},60 15,45 Q${20 - (i % 3) * 2},30 15,15 Q${10 + (i % 2) * 5},5 15,0`}
              stroke={`url(#kelpGrad-${i})`} strokeWidth="4" fill="none" opacity={0.4 + (i % 3) * 0.08}
              style={{ animation: `kelpSway ${5 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.3}s`, transformOrigin: "bottom center" }}
            />
            {[20, 35, 50, 65].map((y, j) => (
              <ellipse key={j} cx={15 + (j % 2 === 0 ? -6 : 6)} cy={y} rx="5" ry="3" fill="#1a4a38"
                opacity={0.3 - j * 0.04}
                style={{ animation: `leafFloat ${3 + j * 0.5}s ease-in-out infinite`, animationDelay: `${j * 0.2}s` }}
              />
            ))}
          </svg>
        ))}

        {/* 해초 */}
        {[15, 35, 55, 75, 95].map((left, i) => (
          <svg key={`seaweed-${i}`} className="absolute bottom-3" style={{ left: `${left}%`, height: 25 + i * 3 }} viewBox="0 0 20 40">
            <path d={`M10,40 Q${6 + i * 1.5},28 10,18 Q${14 - i},10 10,0`}
              stroke="#0a3a2a" strokeWidth="2.5" fill="none" opacity={0.35 + i * 0.04}
              style={{ animation: `seaweedSway ${3.5 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.5}s`, transformOrigin: "bottom center" }}
            />
          </svg>
        ))}
      </div>

      {/* 깊이 안개 오버레이 */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, rgba(8,35,55,0) 0%, rgba(5,20,38,0.3) 50%, rgba(3,12,25,0.5) 100%)",
        mixBlendMode: "multiply",
      }} />

      {/* 잠수함 창문 프레임 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-3 rounded-[40%] border-[10px] border-gray-800" style={{
          boxShadow: "inset 0 0 100px 40px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.5)",
        }} />
        {[[6, "50%"], ["50%", 6], [6, "calc(100% - 24px)"], ["calc(100% - 24px)", 6],
          ["50%", "calc(100% - 24px)"], ["calc(100% - 24px)", "50%"]].map(([left, top], i) => (
          <div key={i} className="absolute w-3 h-3 rounded-full bg-gray-700 border-2 border-gray-600" style={{
            left: typeof left === "number" ? left : left,
            top: typeof top === "number" ? top : top,
            transform: "translate(-50%, -50%)",
          }} />
        ))}
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes causticShift { 0% { transform: translate(0, 0); } 50% { transform: translate(-5%, 3%); } 100% { transform: translate(0, 0); } }
        @keyframes godRay { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes particleFloat { 0%, 100% { transform: translate(0, 0); } 25% { transform: translate(10px, -15px); } 50% { transform: translate(-5px, -25px); } 75% { transform: translate(15px, -10px); } }
        @keyframes bubbleRise { 0% { bottom: -5%; opacity: 0; transform: translateX(0); } 5% { opacity: 0.4; } 25% { transform: translateX(8px); } 50% { transform: translateX(-5px); } 75% { transform: translateX(6px); } 95% { opacity: 0.2; } 100% { bottom: 105%; opacity: 0; transform: translateX(-3px); } }
        @keyframes fishSwimRight { 0% { left: -15%; } 100% { left: 115%; } }
        @keyframes fishSwimLeft { 0% { right: -15%; } 100% { right: 115%; } }
        @keyframes jellyfishFloat { 0% { top: 100%; opacity: 0; } 10% { opacity: 0.7; } 90% { opacity: 0.7; } 100% { top: -20%; opacity: 0; } }
        @keyframes jellyGlow { 0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); } 50% { opacity: 0.7; transform: translateX(-50%) scale(1.1); } }
        @keyframes tentacle { 0%, 100% { transform: translateX(0) rotate(0deg); } 50% { transform: translateX(4px) rotate(3deg); } }
        @keyframes seaweedSway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes kelpSway { 0%, 100% { transform: rotate(-3deg) skewX(-2deg); } 50% { transform: rotate(3deg) skewX(2deg); } }
        @keyframes coralSway { 0%, 100% { transform: skewX(-2deg); } 50% { transform: skewX(2deg); } }
        @keyframes leafFloat { 0%, 100% { transform: translateX(0) rotate(-5deg); } 50% { transform: translateX(3px) rotate(5deg); } }
        @keyframes creatureSwimRight { 0% { left: -20%; } 100% { left: 120%; } }
        @keyframes creatureSwimLeft { 0% { right: -20%; } 100% { right: 120%; } }
        @keyframes biolumFade { 0% { opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes biolumTwinkle { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 0.6; transform: scale(1.2); } }
        @keyframes currentDrift { 0% { opacity: 0; } 15% { opacity: 1; } 85% { opacity: 0.5; } 100% { opacity: 0; transform: translateX(80px); } }
        @keyframes currentParticle { 0% { transform: translateX(0); } 100% { transform: translateX(60px); } }
        @keyframes bubbleBurst { 0% { bottom: 0; opacity: 0; transform: scale(0.5); } 10% { opacity: 0.6; transform: scale(1); } 100% { bottom: 150px; opacity: 0; transform: scale(0.8); } }
        @keyframes volcanoPulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes emberRise { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 0.8; } 100% { transform: translateY(-100px) translateX(${Math.random() > 0.5 ? '' : '-'}${10 + Math.random() * 20}px); opacity: 0; } }
        @keyframes whaleRise { 0% { top: 60%; opacity: 0; } 20% { opacity: 0.25; } 80% { opacity: 0.2; } 100% { top: -20%; opacity: 0; } }
        @keyframes ruinsGlow { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
      `}</style>
    </div>
  );
}

export default UnderwaterView;
