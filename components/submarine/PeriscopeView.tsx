"use client";

// 잠망경 뷰 - 수면 위를 올려다보는 1인칭 시점 + 좌우 패닝 + 이벤트 반응

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { JourneyPhase, ActiveEvent } from "@/lib/submarineEvents";

interface PeriscopeViewProps {
  progress?: number;
  phase?: JourneyPhase;
  activeEvents?: ActiveEvent[];
}

interface PeriscopeEvent {
  id: number;
  type: "seagull" | "ship" | "cloud" | "island" | "dolphin" | "flyingfish" | "whale_spout" | "lighthouse";
  x: number;
  duration: number;
  delay: number;
}

interface WaterDrop {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function PeriscopeView({ progress = 0, phase = "open_ocean", activeEvents = [] }: PeriscopeViewProps) {
  const [events, setEvents] = useState<PeriscopeEvent[]>([]);
  const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);
  const [lightningFlash, setLightningFlash] = useState(false);

  // 패닝 상태
  const [panX, setPanX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(0);
  const panStartRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animFrameRef = useRef(0);
  const sceneRef = useRef<HTMLDivElement>(null);

  const MAX_PAN = 200;

  // 활성 이벤트 체크
  const hasStorm = activeEvents.some(e => e.event.type === "storm");
  const hasSunset = activeEvents.some(e => e.event.type === "sunset");
  const hasLandSighting = activeEvents.some(e => e.event.type === "land_sighting");
  const hasCargoShip = activeEvents.some(e => e.event.type === "cargo_ship");
  const hasWhaleBreach = activeEvents.some(e => e.event.type === "whale_breach");
  const hasDolphinPod = activeEvents.some(e => e.event.type === "dolphin_pod");

  // 페이즈별 하늘 그라데이션
  const skyGradient = useMemo(() => {
    if (hasStorm) return "linear-gradient(180deg, #1f2937 0%, #374151 20%, #4b5563 45%, #6b7280 70%, #9ca3af 100%)";
    if (hasSunset) return "linear-gradient(180deg, #1e1b4b 0%, #581c87 15%, #9d174d 30%, #f97316 50%, #fbbf24 65%, #fde68a 80%, #fed7aa 100%)";
    if (phase === "departure") return "linear-gradient(180deg, #1e3a5f 0%, #0e7490 20%, #22d3ee 40%, #67e8f9 60%, #a5f3fc 80%, #ecfeff 100%)";
    if (phase === "arrival") return "linear-gradient(180deg, #0c4a6e 0%, #0369a1 15%, #f59e0b 40%, #fbbf24 55%, #fde68a 70%, #fef3c7 90%, #fff7ed 100%)";
    return "linear-gradient(180deg, #0c4a6e 0%, #0369a1 15%, #0ea5e9 30%, #38bdf8 45%, #7dd3fc 60%, #bae6fd 80%, #e0f2fe 100%)";
  }, [phase, hasStorm, hasSunset]);

  // 페이즈별 바다색
  const seaGradient = useMemo(() => {
    if (hasStorm) return "linear-gradient(180deg, #374151 0%, #1f2937 15%, #111827 35%, #0f172a 55%, #0c1222 75%, #0a0f1a 100%)";
    if (hasSunset) return "linear-gradient(180deg, #f97316 0%, #c2410c 10%, #7c2d12 25%, #451a03 45%, #1c1917 75%, #0c0a09 100%)";
    return "linear-gradient(180deg, #22d3ee 0%, #0ea5e9 15%, #0284c7 35%, #0369a1 55%, #075985 75%, #0c4a6e 100%)";
  }, [hasStorm, hasSunset]);

  // 태양 색상
  const sunColor = useMemo(() => {
    if (hasStorm) return { visible: false, core: "", glow: "", outer: "" };
    if (hasSunset) return { visible: true, core: "#ef4444", glow: "rgba(239,68,68,0.5)", outer: "rgba(249,115,22,0.3)" };
    return { visible: true, core: "#fef08a", glow: "rgba(253,224,71,0.5)", outer: "rgba(251,191,36,0.3)" };
  }, [hasStorm, hasSunset]);

  // 번개 효과
  useEffect(() => {
    if (!hasStorm) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLightningFlash(true);
        setTimeout(() => setLightningFlash(false), 150);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [hasStorm]);

  // 모멘텀 애니메이션
  const startMomentum = useCallback(() => {
    let velocity = velocityRef.current * 15;
    const friction = 0.93;

    const animate = () => {
      if (Math.abs(velocity) < 0.3) return;
      velocity *= friction;
      setPanX(prev => Math.max(-MAX_PAN, Math.min(MAX_PAN, prev + velocity)));
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = e.clientX;
    panStartRef.current = panX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [panX]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current;
    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      velocityRef.current = (e.clientX - lastXRef.current) / dt;
    }
    lastXRef.current = e.clientX;
    lastTimeRef.current = now;
    const newPanX = Math.max(-MAX_PAN, Math.min(MAX_PAN, panStartRef.current + dx));
    setPanX(newPanX);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    startMomentum();
  }, [startMomentum]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // 물방울 생성
  useEffect(() => {
    const initialDrops: WaterDrop[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 10,
      size: Math.random() * 12 + 6,
    }));
    setWaterDrops(initialDrops);

    const dropInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        const newDrop: WaterDrop = {
          id: Date.now(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 40 + 5,
          size: Math.random() * 15 + 5,
        };
        setWaterDrops(prev => [...prev.slice(-10), newDrop]);
      }
    }, hasStorm ? 1500 : 4000);

    return () => clearInterval(dropInterval);
  }, [hasStorm]);

  // 랜덤 이벤트 생성 (페이즈별 가중치)
  useEffect(() => {
    const initialClouds: PeriscopeEvent[] = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      type: "cloud" as const,
      x: Math.random() * 80 + 10,
      duration: Math.random() * 35 + 25,
      delay: Math.random() * 15,
    }));
    setEvents(initialClouds);

    const getWeightsForPhase = () => {
      if (phase === "departure") {
        return {
          types: ["seagull", "ship", "cloud", "island", "dolphin", "flyingfish"] as PeriscopeEvent["type"][],
          weights: [0.35, 0.25, 0.15, 0.12, 0.08, 0.05],
          interval: 3000,
        };
      }
      if (phase === "arrival") {
        return {
          types: ["seagull", "ship", "cloud", "lighthouse", "dolphin", "flyingfish"] as PeriscopeEvent["type"][],
          weights: [0.2, 0.3, 0.15, 0.15, 0.12, 0.08],
          interval: 3000,
        };
      }
      // open_ocean
      return {
        types: ["seagull", "ship", "cloud", "island", "dolphin", "flyingfish", "whale_spout"] as PeriscopeEvent["type"][],
        weights: [0.15, 0.08, 0.25, 0.05, 0.15, 0.12, 0.2],
        interval: 5000,
      };
    };

    const config = getWeightsForPhase();

    const eventInterval = setInterval(() => {
      const rand = Math.random();
      let cumWeight = 0;
      let selectedType: PeriscopeEvent["type"] = "cloud";
      for (let i = 0; i < config.types.length; i++) {
        cumWeight += config.weights[i];
        if (rand < cumWeight) {
          selectedType = config.types[i];
          break;
        }
      }

      const newEvent: PeriscopeEvent = {
        id: Date.now(),
        type: selectedType,
        x: Math.random() * 60 + 20,
        duration: selectedType === "ship" ? 18 : selectedType === "cloud" ? 45 : selectedType === "dolphin" ? 4 : selectedType === "flyingfish" ? 3 : selectedType === "whale_spout" ? 6 : selectedType === "lighthouse" ? 30 : 10,
        delay: 0,
      };
      setEvents(prev => [...prev.slice(-10), newEvent]);
    }, config.interval);

    return () => clearInterval(eventInterval);
  }, [phase]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900 flex items-center justify-center">
      {/* 정사각형 래퍼 */}
      <div
        className="relative"
        style={{
          width: "min(calc(100vh * 0.46), calc(100% - 32px))",
          height: "min(calc(100vh * 0.46), calc(100% - 32px))",
          maxWidth: "100%",
          maxHeight: "100%",
          aspectRatio: "1 / 1",
        }}
      >
        {/* 원형 씬 영역 (clip) */}
        <div
          className="absolute inset-[14px] rounded-full overflow-hidden"
          style={{
            boxShadow: "inset 0 0 60px 15px rgba(0,0,0,0.4)",
            touchAction: "none",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* 패닝되는 씬 래퍼 (3배 넓이) */}
          <div
            ref={sceneRef}
            className="absolute"
            style={{
              width: "300%",
              height: "100%",
              left: "-100%",
              transform: `translateX(${panX}px)`,
              willChange: isDragging ? "transform" : "auto",
            }}
          >
            {/* 하늘 그라데이션 — 페이즈/이벤트 반응 */}
            <div
              className="absolute inset-0 transition-all duration-[3000ms]"
              style={{ background: skyGradient }}
            />

            {/* 번개 플래시 */}
            {lightningFlash && (
              <div className="absolute inset-0 bg-white/20 z-10" />
            )}

            {/* 대기 헤이즈 */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: "radial-gradient(ellipse at center 100%, rgba(255,255,255,0.3) 0%, transparent 60%)",
              }}
            />

            {/* 태양 + 렌즈 플레어 */}
            {sunColor.visible && (
              <div className="absolute top-[12%] right-[40%]">
                <div
                  className="absolute w-32 h-32 rounded-full -left-8 -top-8"
                  style={{
                    background: `radial-gradient(circle, ${sunColor.glow.replace("0.5", "0.15")} 0%, transparent 70%)`,
                    animation: "sunPulse 4s ease-in-out infinite",
                  }}
                />
                <div
                  className="w-16 h-16 rounded-full transition-colors duration-[3000ms]"
                  style={{
                    background: `radial-gradient(circle, #fefce8 0%, ${sunColor.core} 30%, ${sunColor.core} 60%, #f59e0b 90%)`,
                    boxShadow: `0 0 40px 15px ${sunColor.glow}, 0 0 80px 30px ${sunColor.outer}`,
                  }}
                />
                <div
                  className="absolute top-1/2 left-1/2 w-40 h-0.5 opacity-30"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${sunColor.glow} 30%, ${sunColor.glow} 70%, transparent 100%)`,
                    transform: "translateX(-50%) translateY(-50%) rotate(-30deg)",
                  }}
                />
                {[
                  { x: 60, y: 40, size: 8, opacity: 0.3 },
                  { x: 90, y: 60, size: 5, opacity: 0.2 },
                  { x: -30, y: -20, size: 12, opacity: 0.15 },
                ].map((flare, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: flare.x,
                      top: flare.y,
                      width: flare.size,
                      height: flare.size,
                      background: `radial-gradient(circle, rgba(253,224,71,${flare.opacity}) 0%, transparent 70%)`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* 구름 */}
            {events.filter(e => e.type === "cloud").map((cloud, idx) => (
              <div
                key={cloud.id}
                className="absolute"
                style={{
                  top: `${8 + (idx % 3) * 5}%`,
                  animation: `driftRight ${cloud.duration}s linear infinite`,
                  animationDelay: `${cloud.delay}s`,
                }}
              >
                <svg width="100" height="55" viewBox="0 0 100 55">
                  <defs>
                    <linearGradient id={`cloudGrad-${cloud.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={hasStorm ? "#6b7280" : "white"} />
                      <stop offset="70%" stopColor={hasStorm ? "#4b5563" : "#e5e7eb"} />
                      <stop offset="100%" stopColor={hasStorm ? "#374151" : "#d1d5db"} />
                    </linearGradient>
                  </defs>
                  <ellipse cx="52" cy="38" rx="32" ry="10" fill="#9ca3af" opacity="0.3" />
                  <ellipse cx="50" cy="32" rx="35" ry="14" fill={`url(#cloudGrad-${cloud.id})`} />
                  <ellipse cx="30" cy="26" rx="22" ry="12" fill={hasStorm ? "#6b7280" : "white"} />
                  <ellipse cx="70" cy="24" rx="24" ry="14" fill={hasStorm ? "#6b7280" : "white"} />
                  <ellipse cx="50" cy="18" rx="18" ry="12" fill={hasStorm ? "#6b7280" : "white"} />
                  <ellipse cx="45" cy="14" rx="8" ry="5" fill={hasStorm ? "#6b7280" : "white"} opacity="0.8" />
                </svg>
              </div>
            ))}

            {/* 수면 (다중 레이어 파도) */}
            <div className="absolute bottom-0 left-0 right-0 h-[48%]">
              <div
                className="absolute inset-0 transition-all duration-[3000ms]"
                style={{ background: seaGradient }}
              />

              <svg
                className="absolute -top-3 left-0 w-[200%] h-16"
                viewBox="0 0 1200 60"
                preserveAspectRatio="none"
                style={{ animation: `waveMove1 ${hasStorm ? 6 : 12}s linear infinite` }}
              >
                <path
                  d="M0,30 Q100,10 200,30 Q300,50 400,30 Q500,10 600,30 Q700,50 800,30 Q900,10 1000,30 Q1100,50 1200,30 L1200,60 L0,60 Z"
                  fill={hasStorm ? "#4b5563" : hasSunset ? "#f97316" : "#7dd3fc"}
                  opacity="0.4"
                />
              </svg>

              <svg
                className="absolute -top-1 left-0 w-[200%] h-14"
                viewBox="0 0 1200 55"
                preserveAspectRatio="none"
                style={{ animation: `waveMove2 ${hasStorm ? 4.5 : 9}s linear infinite` }}
              >
                <path
                  d="M0,28 Q80,12 160,28 Q240,44 320,28 Q400,12 480,28 Q560,44 640,28 Q720,12 800,28 Q880,44 960,28 Q1040,12 1120,28 Q1200,44 1200,28 L1200,55 L0,55 Z"
                  fill={hasStorm ? "#374151" : hasSunset ? "#ea580c" : "#38bdf8"}
                  opacity="0.5"
                />
                <path
                  d="M0,28 Q80,12 160,28 Q240,44 320,28 Q400,12 480,28 Q560,44 640,28 Q720,12 800,28 Q880,44 960,28 Q1040,12 1120,28"
                  fill="none"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="3"
                  strokeDasharray="8,12"
                />
              </svg>

              <svg
                className="absolute top-1 left-0 w-[200%] h-12"
                viewBox="0 0 1200 50"
                preserveAspectRatio="none"
                style={{ animation: `waveMove3 ${hasStorm ? 3.5 : 7}s linear infinite reverse` }}
              >
                <path
                  d="M0,25 Q60,8 120,25 Q180,42 240,25 Q300,8 360,25 Q420,42 480,25 Q540,8 600,25 Q660,42 720,25 Q780,8 840,25 Q900,42 960,25 Q1020,8 1080,25 Q1140,42 1200,25 L1200,50 L0,50 Z"
                  fill={hasStorm ? "#1f2937" : hasSunset ? "#c2410c" : "#0ea5e9"}
                  opacity="0.6"
                />
              </svg>

              <svg
                className="absolute top-3 left-0 w-[200%] h-10"
                viewBox="0 0 1200 45"
                preserveAspectRatio="none"
                style={{ animation: `waveMove4 ${hasStorm ? 2.5 : 5}s linear infinite` }}
              >
                <defs>
                  <linearGradient id="waveFoam" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                    <stop offset="30%" stopColor={hasStorm ? "#374151" : "#22d3ee"} />
                    <stop offset="100%" stopColor={hasStorm ? "#1f2937" : "#0891b2"} />
                  </linearGradient>
                </defs>
                <path
                  d="M0,22 Q40,8 80,22 Q120,36 160,22 Q200,8 240,22 Q280,36 320,22 Q360,8 400,22 Q440,36 480,22 Q520,8 560,22 Q600,36 640,22 Q680,8 720,22 Q760,36 800,22 Q840,8 880,22 Q920,36 960,22 Q1000,8 1040,22 Q1080,36 1120,22 Q1160,8 1200,22 L1200,45 L0,45 Z"
                  fill="url(#waveFoam)"
                  opacity="0.8"
                />
              </svg>

              {/* 햇빛 반사 (스파클) — 폭풍 시 숨김 */}
              {!hasStorm && (
                <div className="absolute top-2 left-0 right-0 h-12 overflow-hidden">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${10 + i * 12}%`,
                        top: `${20 + Math.sin(i) * 30}%`,
                        animation: `sparkle ${1.5 + i * 0.2}s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {!hasStorm && (
                <div
                  className="absolute top-6 left-1/2 -translate-x-1/2 w-40 h-24"
                  style={{
                    background: hasSunset
                      ? "radial-gradient(ellipse, rgba(249,115,22,0.35) 0%, rgba(249,115,22,0.15) 40%, transparent 70%)"
                      : "radial-gradient(ellipse, rgba(253,224,71,0.35) 0%, rgba(253,224,71,0.15) 40%, transparent 70%)",
                    animation: "shimmer 4s ease-in-out infinite",
                  }}
                />
              )}
            </div>

            {/* 빗줄기 — 폭풍 이벤트 */}
            {hasStorm && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={`rain-${i}`}
                    className="absolute bg-white/20"
                    style={{
                      left: `${Math.random() * 100}%`,
                      width: 1,
                      height: 15 + Math.random() * 20,
                      animation: `rainFall ${0.3 + Math.random() * 0.4}s linear infinite`,
                      animationDelay: `${Math.random() * 0.5}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* 갈매기 */}
            {events.filter(e => e.type === "seagull").map((seagull) => (
              <div
                key={seagull.id}
                className="absolute"
                style={{
                  top: `${15 + Math.random() * 20}%`,
                  animation: `flyAcross ${seagull.duration}s linear forwards`,
                }}
              >
                <svg width="30" height="15" viewBox="0 0 30 15">
                  <path
                    d="M0,8 Q7,2 15,8 Q23,2 30,8"
                    stroke="#1e293b"
                    strokeWidth="2"
                    fill="none"
                    style={{ animation: "flapWings 0.3s ease-in-out infinite" }}
                  />
                </svg>
              </div>
            ))}

            {/* 배 */}
            {events.filter(e => e.type === "ship").map((ship) => (
              <div
                key={ship.id}
                className="absolute"
                style={{
                  bottom: "42%",
                  animation: `sailAcross ${ship.duration}s linear forwards`,
                }}
              >
                <svg width="60" height="40" viewBox="0 0 60 40">
                  <path d="M5,30 L15,35 L45,35 L55,30 L50,25 L10,25 Z" fill="#475569" />
                  <rect x="20" y="15" width="20" height="10" fill="#64748b" />
                  <rect x="32" y="5" width="6" height="10" fill="#334155" />
                  <ellipse cx="38" cy="3" rx="4" ry="2" fill="#94a3b8" opacity="0.6" />
                </svg>
              </div>
            ))}

            {/* 대형 화물선 (이벤트) */}
            {hasCargoShip && (
              <div
                className="absolute"
                style={{
                  bottom: "40%",
                  animation: "sailAcross 25s linear forwards",
                }}
              >
                <svg width="140" height="70" viewBox="0 0 140 70">
                  <path d="M5,50 L15,60 L125,60 L135,50 L130,40 L10,40 Z" fill="#374151" />
                  <rect x="20" y="25" width="100" height="15" fill="#475569" />
                  {/* 컨테이너 */}
                  {[25, 40, 55, 70, 85, 100].map((x, i) => (
                    <rect key={i} x={x} y={26} width="12" height="13" fill={["#dc2626", "#2563eb", "#16a34a", "#eab308", "#dc2626", "#2563eb"][i]} opacity="0.7" />
                  ))}
                  <rect x="60" y="8" width="8" height="17" fill="#1f2937" />
                  <rect x="30" y="12" width="5" height="13" fill="#334155" />
                  <ellipse cx="66" cy="5" rx="6" ry="3" fill="#94a3b8" opacity="0.5" />
                </svg>
              </div>
            )}

            {/* 섬 */}
            {events.filter(e => e.type === "island").map((island) => (
              <div
                key={island.id}
                className="absolute"
                style={{
                  bottom: "42%",
                  left: `${island.x}%`,
                  opacity: 0.8,
                }}
              >
                <svg width="90" height="55" viewBox="0 0 90 55">
                  <ellipse cx="45" cy="50" rx="38" ry="4" fill="#0891b2" opacity="0.4" />
                  <ellipse cx="45" cy="42" rx="38" ry="10" fill="#065f46" />
                  <ellipse cx="45" cy="40" rx="32" ry="8" fill="#047857" />
                  <line x1="40" y1="40" x2="40" y2="12" stroke="#78350f" strokeWidth="3" />
                  <path d="M40,12 Q28,6 22,16" stroke="#15803d" strokeWidth="3" fill="none" />
                  <path d="M40,12 Q52,6 58,16" stroke="#15803d" strokeWidth="3" fill="none" />
                  <path d="M40,12 Q38,0 32,10" stroke="#22c55e" strokeWidth="2.5" fill="none" />
                  <path d="M40,12 Q42,0 48,10" stroke="#22c55e" strokeWidth="2.5" fill="none" />
                  <line x1="55" y1="42" x2="55" y2="25" stroke="#92400e" strokeWidth="2" opacity="0.8" />
                  <path d="M55,25 Q48,22 45,28" stroke="#16a34a" strokeWidth="2" fill="none" />
                  <path d="M55,25 Q62,22 65,28" stroke="#16a34a" strokeWidth="2" fill="none" />
                </svg>
              </div>
            ))}

            {/* 등대 (arrival 페이즈) */}
            {events.filter(e => e.type === "lighthouse").map((lh) => (
              <div
                key={lh.id}
                className="absolute"
                style={{
                  bottom: "41%",
                  left: `${lh.x}%`,
                  opacity: 0.85,
                }}
              >
                <svg width="35" height="70" viewBox="0 0 35 70">
                  <rect x="10" y="20" width="15" height="45" fill="#e5e7eb" />
                  <rect x="8" y="65" width="19" height="5" fill="#9ca3af" rx="1" />
                  <rect x="12" y="12" width="11" height="8" fill="#fbbf24" />
                  <polygon points="17.5,0 8,12 27,12" fill="#dc2626" />
                  {/* 빛 발사 */}
                  <ellipse cx="17" cy="16" rx="30" ry="3" fill="rgba(251,191,36,0.15)" style={{ animation: "lighthouseBeam 3s ease-in-out infinite" }} />
                  <rect x="14" y="35" width="3" height="5" fill="#64748b" opacity="0.6" />
                  <rect x="14" y="45" width="3" height="5" fill="#64748b" opacity="0.6" />
                </svg>
              </div>
            ))}

            {/* 육지/도시 실루엣 (이벤트) */}
            {hasLandSighting && (
              <div className="absolute bottom-[41%] right-[15%] opacity-60">
                <svg width="200" height="60" viewBox="0 0 200 60">
                  <path d="M0,60 L0,40 L20,35 L30,42 L40,25 L50,28 L60,20 L70,22 L80,15 L90,18 L100,12 L110,16 L120,22 L130,18 L140,25 L150,30 L160,20 L170,28 L180,35 L190,38 L200,40 L200,60 Z" fill="#1f2937" />
                  {/* 건물 불빛 */}
                  {[45, 65, 80, 100, 120, 160].map((x, i) => (
                    <rect key={i} x={x} y={20 + i * 2} width="2" height="2" fill="#fbbf24" opacity={0.4 + Math.random() * 0.3} style={{ animation: `sparkle ${2 + i * 0.3}s ease-in-out infinite` }} />
                  ))}
                </svg>
              </div>
            )}

            {/* 돌고래 점프 */}
            {events.filter(e => e.type === "dolphin").map((dolphin) => (
              <div
                key={dolphin.id}
                className="absolute"
                style={{
                  left: `${dolphin.x}%`,
                  bottom: "40%",
                  animation: `dolphinJump ${dolphin.duration}s ease-out forwards`,
                }}
              >
                <svg width="70" height="45" viewBox="0 0 70 45">
                  <defs>
                    <linearGradient id={`dolphinGrad-${dolphin.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#64748b" />
                      <stop offset="50%" stopColor="#475569" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M5,25 Q15,10 35,15 Q55,20 65,30 Q55,35 35,32 Q15,30 5,25"
                    fill={`url(#dolphinGrad-${dolphin.id})`}
                  />
                  <path d="M20,28 Q35,33 50,30" fill="none" stroke="#94a3b8" strokeWidth="4" />
                  <path d="M60,30 Q68,28 65,25" fill="#475569" />
                  <path d="M30,15 Q35,5 40,15" fill="#475569" />
                  <circle cx="55" cy="25" r="2" fill="#1e293b" />
                </svg>
              </div>
            ))}

            {/* 돌고래 떼 (이벤트) — 3마리 연속 */}
            {hasDolphinPod && Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`pod-${i}`}
                className="absolute"
                style={{
                  left: `${30 + i * 12}%`,
                  bottom: "40%",
                  animation: `dolphinJump 4s ease-out forwards`,
                  animationDelay: `${i * 0.6}s`,
                }}
              >
                <svg width="55" height="35" viewBox="0 0 70 45">
                  <path d="M5,25 Q15,10 35,15 Q55,20 65,30 Q55,35 35,32 Q15,30 5,25" fill="#475569" />
                  <path d="M60,30 Q68,28 65,25" fill="#475569" />
                  <path d="M30,15 Q35,5 40,15" fill="#475569" />
                  <circle cx="55" cy="25" r="2" fill="#1e293b" />
                </svg>
              </div>
            ))}

            {/* 고래 물줄기 (open_ocean) */}
            {events.filter(e => e.type === "whale_spout").map((ws) => (
              <div
                key={ws.id}
                className="absolute"
                style={{
                  bottom: "43%",
                  left: `${ws.x}%`,
                  animation: `whaleSpout ${ws.duration}s ease-out forwards`,
                }}
              >
                <svg width="40" height="50" viewBox="0 0 40 50">
                  {/* 물줄기 */}
                  <path d="M20,50 Q15,30 10,15 Q18,5 20,0" stroke="rgba(186,230,253,0.5)" strokeWidth="2" fill="none" style={{ animation: "spoutRise 1.5s ease-out infinite" }} />
                  <path d="M20,50 Q25,30 30,15 Q22,5 20,0" stroke="rgba(186,230,253,0.5)" strokeWidth="2" fill="none" style={{ animation: "spoutRise 1.5s ease-out infinite", animationDelay: "0.2s" }} />
                  {/* 물방울 */}
                  {[{ x: 12, y: 10 }, { x: 28, y: 8 }, { x: 18, y: 3 }, { x: 24, y: 5 }].map((d, i) => (
                    <circle key={i} cx={d.x} cy={d.y} r="1.5" fill="rgba(186,230,253,0.4)" style={{ animation: `sparkle ${1 + i * 0.3}s ease-in-out infinite` }} />
                  ))}
                  {/* 고래 등 */}
                  <ellipse cx="20" cy="50" rx="12" ry="4" fill="#334155" opacity="0.5" />
                </svg>
              </div>
            ))}

            {/* 고래 브리칭 (이벤트) */}
            {hasWhaleBreach && (
              <div
                className="absolute"
                style={{
                  left: "45%",
                  bottom: "38%",
                  animation: "whaleBreach 5s ease-out forwards",
                }}
              >
                <svg width="120" height="80" viewBox="0 0 120 80">
                  <path d="M10,60 Q30,20 60,15 Q90,20 110,60 Q90,70 60,65 Q30,70 10,60" fill="#334155" />
                  <path d="M30,55 Q55,65 85,55" fill="none" stroke="#64748b" strokeWidth="3" />
                  <circle cx="35" cy="40" r="3" fill="#1e293b" />
                  <path d="M55,15 Q60,0 65,15" fill="#334155" />
                  {/* 물보라 */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <circle key={i} cx={20 + i * 12} cy={65 + Math.random() * 10} r={1.5 + Math.random() * 2} fill="rgba(186,230,253,0.4)" />
                  ))}
                </svg>
              </div>
            )}

            {/* 날치 */}
            {events.filter(e => e.type === "flyingfish").map((fish) => (
              <div
                key={fish.id}
                className="absolute"
                style={{
                  bottom: "46%",
                  animation: `flyingFish ${fish.duration}s ease-out forwards`,
                }}
              >
                <svg width="40" height="25" viewBox="0 0 40 25">
                  <path
                    d="M15,12 Q10,2 25,8 Q18,10 15,12"
                    fill="#60a5fa"
                    opacity="0.7"
                    style={{ animation: "wingFlap 0.15s ease-in-out infinite" }}
                  />
                  <path
                    d="M15,12 Q10,22 25,16 Q18,14 15,12"
                    fill="#60a5fa"
                    opacity="0.6"
                    style={{ animation: "wingFlap 0.15s ease-in-out infinite reverse" }}
                  />
                  <ellipse cx="20" cy="12" rx="12" ry="5" fill="#3b82f6" />
                  <path d="M8,12 L2,8 L4,12 L2,16 Z" fill="#3b82f6" />
                  <circle cx="28" cy="11" r="1.5" fill="#1e3a8a" />
                </svg>
              </div>
            ))}
          </div>

          {/* 십자선 — 패닝해도 고정 */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-40">
              <circle cx="60" cy="60" r="3" fill="none" stroke="#1e293b" strokeWidth="1" />
              <line x1="60" y1="20" x2="60" y2="50" stroke="#1e293b" strokeWidth="1" />
              <line x1="60" y1="70" x2="60" y2="100" stroke="#1e293b" strokeWidth="1" />
              <line x1="20" y1="60" x2="50" y2="60" stroke="#1e293b" strokeWidth="1" />
              <line x1="70" y1="60" x2="100" y2="60" stroke="#1e293b" strokeWidth="1" />
              <line x1="55" y1="30" x2="65" y2="30" stroke="#1e293b" strokeWidth="0.5" />
              <line x1="55" y1="40" x2="65" y2="40" stroke="#1e293b" strokeWidth="0.5" />
              <line x1="55" y1="80" x2="65" y2="80" stroke="#1e293b" strokeWidth="0.5" />
              <line x1="55" y1="90" x2="65" y2="90" stroke="#1e293b" strokeWidth="0.5" />
              <line x1="30" y1="55" x2="30" y2="65" stroke="#1e293b" strokeWidth="0.5" />
              <line x1="40" y1="55" x2="40" y2="65" stroke="#1e293b" strokeWidth="0.5" />
              <line x1="80" y1="55" x2="80" y2="65" stroke="#1e293b" strokeWidth="0.5" />
              <line x1="90" y1="55" x2="90" y2="65" stroke="#1e293b" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        {/* 물방울 (렌즈 위, 고정) */}
        {waterDrops.map((drop) => (
          <div
            key={drop.id}
            className="absolute pointer-events-none z-20"
            style={{
              left: `${drop.x}%`,
              top: `${drop.y}%`,
            }}
          >
            <svg width={drop.size} height={drop.size * 1.4} viewBox="0 0 20 28">
              <defs>
                <radialGradient id={`dropGrad-${drop.id}`} cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                  <stop offset="40%" stopColor="rgba(200,230,255,0.2)" />
                  <stop offset="100%" stopColor="rgba(150,200,255,0.1)" />
                </radialGradient>
              </defs>
              <path
                d="M10,2 Q2,12 10,26 Q18,12 10,2"
                fill={`url(#dropGrad-${drop.id})`}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.5"
              />
              <ellipse cx="7" cy="10" rx="2" ry="3" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>
        ))}

        {/* 색수차 효과 */}
        <div
          className="absolute inset-[10px] rounded-full pointer-events-none z-10"
          style={{
            boxShadow: `
              inset 3px 0 8px -2px rgba(255,0,0,0.15),
              inset -3px 0 8px -2px rgba(0,255,255,0.15),
              inset 0 3px 8px -2px rgba(255,0,255,0.1),
              inset 0 -3px 8px -2px rgba(0,255,0,0.1)
            `,
          }}
        />

        {/* 렌즈 테두리 */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: "14px solid #374151",
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)",
          }}
        />
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: "14px solid transparent",
            borderTopColor: "rgba(107,114,128,0.6)",
            borderLeftColor: "rgba(107,114,128,0.3)",
          }}
        />

        {/* 금속 테두리 나사 */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full pointer-events-none z-10"
            style={{
              left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * 47}%)`,
              top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * 47}%)`,
              transform: "translate(-50%, -50%)",
              background: "linear-gradient(135deg, #6b7280 0%, #374151 50%, #1f2937 100%)",
              boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="absolute inset-1 rounded-full"
              style={{ background: "linear-gradient(135deg, #4b5563, #1f2937)" }}
            />
          </div>
        ))}

        {/* 렌즈 반사 */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "30%",
            height: "25%",
            left: "12%",
            top: "12%",
            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 30%, transparent 60%)",
          }}
        />
        <div
          className="absolute w-8 h-4 rounded-full pointer-events-none"
          style={{
            right: "18%",
            bottom: "18%",
            background: "linear-gradient(45deg, rgba(255,255,255,0.08) 0%, transparent 80%)",
            transform: "rotate(-20deg)",
          }}
        />
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes waveMove1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes waveMove2 {
          0% { transform: translateX(-25%); }
          100% { transform: translateX(-75%); }
        }
        @keyframes waveMove3 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes waveMove4 {
          0% { transform: translateX(-10%); }
          100% { transform: translateX(-60%); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.35; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.55; transform: translateX(-50%) scale(1.15); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes sunPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes driftRight {
          0% { left: -15%; }
          100% { left: 115%; }
        }
        @keyframes flyAcross {
          0% { left: -5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 105%; opacity: 0; }
        }
        @keyframes sailAcross {
          0% { left: -10%; }
          100% { left: 110%; }
        }
        @keyframes flapWings {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.6); }
        }
        @keyframes dolphinJump {
          0% { transform: translateY(20px) rotate(30deg); opacity: 0; }
          20% { transform: translateY(-40px) rotate(15deg); opacity: 1; }
          50% { transform: translateY(-60px) rotate(-5deg); opacity: 1; }
          80% { transform: translateY(-30px) rotate(-20deg); opacity: 1; }
          100% { transform: translateY(30px) rotate(-35deg); opacity: 0; }
        }
        @keyframes flyingFish {
          0% { left: -5%; transform: translateY(0) rotate(-10deg); opacity: 0; }
          15% { transform: translateY(-30px) rotate(-15deg); opacity: 1; }
          50% { transform: translateY(-50px) rotate(-5deg); }
          85% { transform: translateY(-25px) rotate(5deg); opacity: 1; }
          100% { left: 105%; transform: translateY(10px) rotate(15deg); opacity: 0; }
        }
        @keyframes wingFlap {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.7); }
        }
        @keyframes rainFall {
          0% { top: -5%; opacity: 0; }
          10% { opacity: 0.6; }
          100% { top: 105%; opacity: 0; }
        }
        @keyframes whaleSpout {
          0% { opacity: 0; transform: translateY(10px); }
          15% { opacity: 1; transform: translateY(0); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-5px); }
        }
        @keyframes spoutRise {
          0% { opacity: 0; transform: scaleY(0.5); }
          50% { opacity: 0.6; transform: scaleY(1); }
          100% { opacity: 0; transform: scaleY(0.8) translateY(-5px); }
        }
        @keyframes whaleBreach {
          0% { transform: translateY(40px) rotate(15deg); opacity: 0; }
          25% { transform: translateY(-30px) rotate(5deg); opacity: 1; }
          50% { transform: translateY(-50px) rotate(-10deg); opacity: 1; }
          75% { transform: translateY(-20px) rotate(-20deg); opacity: 0.8; }
          100% { transform: translateY(50px) rotate(-30deg); opacity: 0; }
        }
        @keyframes lighthouseBeam {
          0%, 100% { opacity: 0; transform: scaleX(0.5); }
          50% { opacity: 1; transform: scaleX(1.2); }
        }
      `}</style>
    </div>
  );
}

export default PeriscopeView;
