"use client";

// 잠수함 지도 - Leaflet 기반 + 해저 분위기 + 실제 해상 경로

import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { interpolateAlongPath } from "@/lib/seaRoutes";
import type { JourneyPhase, ActiveEvent } from "@/lib/submarineEvents";

interface Coordinate {
  lat: number;
  lng: number;
}

interface SubmarineMapProps {
  progress: number;
  seaRoute?: Coordinate[];  // 실제 해상 경로
  activeEvents?: ActiveEvent[];
  phase?: JourneyPhase;
}

// 버블 타입
interface Bubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

// 플랑크톤/파티클 타입
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

// 소나 핑 타입
interface SonarPing {
  id: number;
  active: boolean;
}

// 기본 경로 (폴백용)
const DEFAULT_ROUTE: Coordinate[] = [
  { lat: 35.1796, lng: 129.0756 }, // 부산
  { lat: 35.6762, lng: 139.6503 }, // 도쿄
];

// 잠수함 아이콘 생성
function createSubmarineIcon() {
  const svgIcon = `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="28" rx="18" ry="8" fill="url(#subGrad)" stroke="#1e3a5f" stroke-width="1.5"/>
      <rect x="18" y="18" width="12" height="10" rx="2" fill="#4a90d9" stroke="#1e3a5f" stroke-width="1"/>
      <rect x="23" y="10" width="2" height="8" fill="#2d4a6f"/>
      <circle cx="24" cy="9" r="2" fill="#4a90d9"/>
      <ellipse cx="42" cy="28" rx="2" ry="4" fill="#1e3a5f"/>
      <circle cx="12" cy="28" r="2" fill="#87ceeb" opacity="0.8"/>
      <circle cx="18" cy="28" r="2" fill="#87ceeb" opacity="0.8"/>
      <circle cx="30" cy="28" r="2" fill="#87ceeb" opacity="0.8"/>
      <circle cx="36" cy="28" r="2" fill="#87ceeb" opacity="0.8"/>
      <defs>
        <linearGradient id="subGrad" x1="6" y1="20" x2="42" y2="36">
          <stop stop-color="#3b82f6"/>
          <stop offset="1" stop-color="#1e40af"/>
        </linearGradient>
      </defs>
    </svg>
  `;

  return L.divIcon({
    html: `<div style="filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.6));">${svgIcon}</div>`,
    className: "",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

// 지도 중심 업데이트 컴포넌트 — 유저 조작 시 추적 해제
function MapUpdater({ position, tracking, onUserInteract }: {
  position: [number, number];
  tracking: boolean;
  onUserInteract: () => void;
}) {
  const map = useMap();

  // 유저가 드래그/줌하면 추적 해제
  useEffect(() => {
    const handleInteract = () => onUserInteract();
    map.on("dragstart", handleInteract);
    map.on("zoomstart", handleInteract);
    return () => {
      map.off("dragstart", handleInteract);
      map.off("zoomstart", handleInteract);
    };
  }, [map, onUserInteract]);

  // 추적 모드일 때만 따라감
  useEffect(() => {
    if (tracking) {
      map.panTo(position, { animate: true, duration: 0.5 });
    }
  }, [map, position, tracking]);

  return null;
}

// 위치 복귀 헬퍼
function MapRecenter({ position, trigger }: { position: [number, number]; trigger: number }) {
  const map = useMap();

  useEffect(() => {
    if (trigger > 0) {
      map.flyTo(position, 5, { animate: true, duration: 1 });
    }
  }, [map, position, trigger]);

  return null;
}

export default function SubmarineMap({ progress, seaRoute, activeEvents = [], phase = "open_ocean" }: SubmarineMapProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [sonarPings, setSonarPings] = useState<SonarPing[]>([]);
  const [tracking, setTracking] = useState(true);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  const handleUserInteract = useCallback(() => {
    setTracking(false);
  }, []);

  const handleRecenter = useCallback(() => {
    setTracking(true);
    setRecenterTrigger(prev => prev + 1);
  }, []);

  // 사용할 경로 결정 (실제 경로 or 기본 경로)
  const route = useMemo(() => {
    return seaRoute && seaRoute.length >= 2 ? seaRoute : DEFAULT_ROUTE;
  }, [seaRoute]);

  // 경로를 Leaflet Polyline 형식으로 변환
  const routePositions = useMemo((): [number, number][] => {
    return route.map((p) => [p.lat, p.lng]);
  }, [route]);

  // 현재 위치 계산 (경로 따라 보간)
  const currentPosition = useMemo((): [number, number] => {
    const pos = interpolateAlongPath(route, progress);
    return [pos.lat, pos.lng];
  }, [route, progress]);

  // 이동한 경로 계산
  const traveledRoute = useMemo((): [number, number][] => {
    if (route.length < 2) return [routePositions[0], currentPosition];

    // progress에 해당하는 지점까지의 경로
    const result: [number, number][] = [];
    let totalLength = 0;
    const segmentLengths: number[] = [];

    for (let i = 0; i < route.length - 1; i++) {
      const segmentLength = Math.sqrt(
        Math.pow(route[i + 1].lat - route[i].lat, 2) +
        Math.pow(route[i + 1].lng - route[i].lng, 2)
      );
      segmentLengths.push(segmentLength);
      totalLength += segmentLength;
    }

    const t = Math.max(0, Math.min(100, progress)) / 100;
    const targetLength = totalLength * t;
    let accumulatedLength = 0;

    result.push([route[0].lat, route[0].lng]);

    for (let i = 0; i < segmentLengths.length; i++) {
      const segmentLength = segmentLengths[i];

      if (accumulatedLength + segmentLength >= targetLength) {
        // 현재 위치 추가하고 종료
        result.push(currentPosition);
        break;
      }

      // 다음 점 추가
      result.push([route[i + 1].lat, route[i + 1].lng]);
      accumulatedLength += segmentLength;
    }

    return result;
  }, [route, routePositions, currentPosition, progress]);

  // 버블 및 파티클 생성
  useEffect(() => {
    const newBubbles: Bubble[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 6 + 3,
      duration: Math.random() * 4 + 4,
      delay: Math.random() * 6,
    }));
    setBubbles(newBubbles);

    // 떠다니는 플랑크톤/파티클
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.3 + 0.1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
    }));
    setParticles(newParticles);

    return () => {};
  }, []);

  // 페이즈별 소나 핑 빈도 (departure: 6s, open_ocean: 3s, arrival: 2s)
  useEffect(() => {
    const interval = phase === "departure" ? 6000 : phase === "arrival" ? 2000 : 3000;
    const sonarInterval = setInterval(() => {
      const newPing: SonarPing = { id: Date.now(), active: true };
      setSonarPings(prev => [...prev.slice(-3), newPing]);
    }, interval);
    return () => clearInterval(sonarInterval);
  }, [phase]);

  // 소나 탐지 이벤트 위치 (잠수함 앞쪽에 표시)
  const sonarContactPosition = useMemo((): [number, number] | null => {
    const sonarEvent = activeEvents.find(e => e.event.type === "sonar_contact");
    if (!sonarEvent) return null;
    // 잠수함보다 약간 앞 (progress + 5%) 위치
    const aheadProgress = Math.min(100, progress + 5);
    const pos = interpolateAlongPath(route, aheadProgress);
    // 약간 오프셋
    const offsetLat = (sonarEvent.data.y - 50) * 0.005;
    const offsetLng = (sonarEvent.data.x - 50) * 0.005;
    return [pos.lat + offsetLat, pos.lng + offsetLng];
  }, [activeEvents, progress, route]);

  // 블루 오버레이 농도 (페이즈별)
  const overlayOpacity = useMemo(() => {
    if (phase === "departure") return { top: 0.25, mid: 0.35, bottom: 0.4 };
    if (phase === "arrival") return { top: 0.25, mid: 0.35, bottom: 0.4 };
    return { top: 0.35, mid: 0.45, bottom: 0.55 }; // open_ocean: 더 깊은 느낌
  }, [phase]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 지도 */}
      <MapContainer
        center={[34.5, 134]}
        zoom={5}
        minZoom={3}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        style={{ background: "#0f172a" }}
      >
        {/* 다크 테마 타일 */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
          noWrap={true}
        />

        {/* 전체 경로 - 점선 (추상적 해저 터널 느낌) */}
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: "#22d3ee",
            weight: 3,
            opacity: 0.4,
            dashArray: "8, 16",
          }}
        />

        {/* 이동한 경로 - 실선 (곡선 경로 따라) */}
        <Polyline
          positions={traveledRoute}
          pathOptions={{
            color: "#22d3ee",
            weight: 4,
            opacity: 0.8,
          }}
        />

        {/* 출발점 마커 */}
        <CircleMarker
          center={routePositions[0]}
          radius={8}
          pathOptions={{
            color: "#22c55e",
            fillColor: "#22c55e",
            fillOpacity: 1,
            weight: 2,
          }}
        />

        {/* 도착점 마커 */}
        <CircleMarker
          center={routePositions[routePositions.length - 1]}
          radius={8}
          pathOptions={{
            color: "#f97316",
            fillColor: "#f97316",
            fillOpacity: 1,
            weight: 2,
          }}
        />

        {/* 소나 웨이브 효과 (현재 위치) */}
        <CircleMarker
          center={currentPosition}
          radius={20}
          pathOptions={{
            color: "#22d3ee",
            fillColor: "#22d3ee",
            fillOpacity: 0.15,
            weight: 1,
          }}
        />

        {/* 잠수함 마커 */}
        <Marker
          position={currentPosition}
          icon={createSubmarineIcon()}
        />

        {/* 소나 탐지 이벤트 마커 */}
        {sonarContactPosition && (
          <>
            <CircleMarker
              center={sonarContactPosition}
              radius={14}
              pathOptions={{
                color: "#facc15",
                fillColor: "#facc15",
                fillOpacity: 0.3,
                weight: 2,
                dashArray: "4, 4",
              }}
            />
            <CircleMarker
              center={sonarContactPosition}
              radius={6}
              pathOptions={{
                color: "#fbbf24",
                fillColor: "#fbbf24",
                fillOpacity: 0.8,
                weight: 2,
              }}
            />
          </>
        )}

        {/* 지도 중심 업데이트 */}
        <MapUpdater position={currentPosition} tracking={tracking} onUserInteract={handleUserInteract} />
        <MapRecenter position={currentPosition} trigger={recenterTrigger} />
      </MapContainer>

      {/* 위치 복귀 버튼 — 추적 해제 시에만 표시 */}
      {!tracking && (
        <button
          onClick={handleRecenter}
          className="absolute top-3 right-3 z-[1010] flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all active:scale-95"
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(34,211,238,0.4)",
            color: "#22d3ee",
            boxShadow: "0 0 12px rgba(34,211,238,0.15)",
            backdropFilter: "blur(8px)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
          잠수함 위치
        </button>
      )}

      {/* === 해저 분위기 오버레이 (z-index 높게) === */}

      {/* 1. 블루 오버레이 - 페이즈별 농도 */}
      <div
        className="absolute inset-0 pointer-events-none z-[1000] transition-all duration-1000"
        style={{
          background: `linear-gradient(180deg, rgba(0,50,100,${overlayOpacity.top}) 0%, rgba(0,30,70,${overlayOpacity.mid}) 50%, rgba(0,20,50,${overlayOpacity.bottom}) 100%)`,
        }}
      />

      {/* 플랑크톤/파티클 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1001]">
        {particles.map((p) => (
          <div
            key={`particle-${p.id}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animation: `particleDrift ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 소나 핑 효과 */}
      <div className="absolute inset-0 pointer-events-none z-[1002] flex items-center justify-center">
        {sonarPings.map((ping) => (
          <div
            key={ping.id}
            className="absolute rounded-full border border-cyan-400/40"
            style={{
              animation: "sonarPing 3s ease-out forwards",
            }}
          />
        ))}
      </div>

      {/* 2. 빛줄기 효과 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1003]">
        <div
          className="absolute -top-10 left-[20%] w-20 h-[120%] opacity-[0.07]"
          style={{
            background: "linear-gradient(180deg, rgba(135,206,235,0.8) 0%, transparent 70%)",
            transform: "skewX(-15deg)",
          }}
        />
        <div
          className="absolute -top-10 left-[45%] w-16 h-[120%] opacity-[0.05]"
          style={{
            background: "linear-gradient(180deg, rgba(135,206,235,0.6) 0%, transparent 60%)",
            transform: "skewX(10deg)",
          }}
        />
        <div
          className="absolute -top-10 right-[25%] w-24 h-[120%] opacity-[0.06]"
          style={{
            background: "linear-gradient(180deg, rgba(135,206,235,0.7) 0%, transparent 65%)",
            transform: "skewX(-5deg)",
          }}
        />
      </div>

      {/* 3. 버블 애니메이션 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1004]">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-white/30 border border-white/40"
            style={{
              left: `${bubble.x}%`,
              width: bubble.size,
              height: bubble.size,
              animation: `bubbleFloat ${bubble.duration}s ease-in-out infinite`,
              animationDelay: `${bubble.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 4. 잠수함 창문 프레임 (비네트) */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl z-[1005]"
        style={{
          boxShadow: "inset 0 0 100px 50px rgba(0,20,40,0.8), inset 0 0 150px 80px rgba(0,10,30,0.5)",
        }}
      />

      {/* 5. 창문 테두리 */}
      <div className="absolute inset-0 pointer-events-none z-[1006]">
        <div
          className="absolute inset-2 rounded-xl border-4 border-gray-700/50"
          style={{
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
          }}
        />
        {/* 볼트 장식 */}
        <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-gray-600 border border-gray-500" />
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gray-600 border border-gray-500" />
        <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-gray-600 border border-gray-500" />
        <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-gray-600 border border-gray-500" />
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes bubbleFloat {
          0% {
            bottom: -5%;
            opacity: 0;
            transform: translateX(0);
          }
          10% {
            opacity: 0.6;
          }
          50% {
            transform: translateX(10px);
          }
          90% {
            opacity: 0.4;
          }
          100% {
            bottom: 105%;
            opacity: 0;
            transform: translateX(-5px);
          }
        }

        @keyframes particleDrift {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(8px, -10px);
          }
          50% {
            transform: translate(-5px, -15px);
          }
          75% {
            transform: translate(10px, -8px);
          }
        }

        @keyframes sonarPing {
          0% {
            width: 20px;
            height: 20px;
            opacity: 0.6;
          }
          100% {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }

        @keyframes sonarContactPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
