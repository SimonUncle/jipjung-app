"use client";

import { useMemo } from "react";
import { Port } from "@/lib/ports";

interface WorldMapSVGProps {
  departurePort: Port;
  arrivalPort: Port;
  progress: number; // 0-100
}

// 위도/경도를 SVG 좌표로 변환 (Mercator-like projection)
function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  // SVG viewBox: 0 0 1000 500
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}

// 미니멀한 대륙 SVG 패스 (간략화된 윤곽)
const CONTINENT_PATHS = {
  // 아시아 (동아시아 + 동남아 집중)
  asia: `M 550 80
         L 620 90 L 680 70 L 750 80 L 800 100
         L 850 130 L 880 160 L 900 200 L 920 240
         L 900 280 L 850 300 L 800 290 L 750 270
         L 700 280 L 650 300 L 600 290 L 550 280
         L 500 250 L 480 200 L 500 150 L 530 100 Z`,

  // 호주
  australia: `M 780 340
              L 850 350 L 900 380 L 920 420 L 900 460
              L 850 470 L 800 460 L 760 430 L 750 380 Z`,

  // 유럽
  europe: `M 450 80 L 500 70 L 530 80 L 540 100
           L 520 130 L 480 150 L 450 140 L 420 120
           L 430 90 Z`,

  // 아프리카
  africa: `M 420 180 L 480 170 L 520 190 L 540 240
           L 530 300 L 500 350 L 450 380 L 400 360
           L 380 300 L 390 240 L 400 200 Z`,

  // 북미
  northAmerica: `M 100 80 L 180 60 L 250 70 L 300 100
                 L 320 150 L 300 200 L 250 230 L 200 240
                 L 150 220 L 100 180 L 80 130 Z`,

  // 남미
  southAmerica: `M 220 280 L 280 270 L 320 300 L 340 360
                 L 320 420 L 280 460 L 240 450 L 200 400
                 L 190 340 Z`,

  // 일본 (별도로 표시)
  japan: `M 840 150 L 860 140 L 870 160 L 865 180 L 850 185 L 840 170 Z`,

  // 한반도
  korea: `M 810 140 L 820 135 L 825 150 L 820 165 L 810 160 Z`,
};

export function WorldMapSVG({
  departurePort,
  arrivalPort,
  progress,
}: WorldMapSVGProps) {
  // 출발/도착 위치 계산
  const from = useMemo(
    () => geoToSvg(departurePort.coordinates.lat, departurePort.coordinates.lng),
    [departurePort]
  );

  const to = useMemo(
    () => geoToSvg(arrivalPort.coordinates.lat, arrivalPort.coordinates.lng),
    [arrivalPort]
  );

  // 현재 배 위치 계산 (선형 보간)
  const shipPosition = useMemo(() => {
    const t = progress / 100;
    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    };
  }, [from, to, progress]);

  // 항로 각도 계산 (배 방향)
  const shipAngle = useMemo(() => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }, [from, to]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl overflow-hidden">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* 바다 배경 그라데이션 */}
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0c1929" />
          </linearGradient>

          {/* 글로우 효과 */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 바다 배경 */}
        <rect width="100%" height="100%" fill="url(#oceanGradient)" />

        {/* 위도/경도 그리드 */}
        {[...Array(7)].map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={(500 / 6) * i}
            x2="1000"
            y2={(500 / 6) * i}
            stroke="rgba(59, 130, 246, 0.1)"
            strokeWidth="1"
          />
        ))}
        {[...Array(13)].map((_, i) => (
          <line
            key={`v${i}`}
            x1={(1000 / 12) * i}
            y1="0"
            x2={(1000 / 12) * i}
            y2="500"
            stroke="rgba(59, 130, 246, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* 대륙들 */}
        {Object.entries(CONTINENT_PATHS).map(([name, path]) => (
          <path
            key={name}
            d={path}
            fill="rgba(100, 116, 139, 0.4)"
            stroke="rgba(148, 163, 184, 0.3)"
            strokeWidth="1"
          />
        ))}

        {/* 항로 (점선) */}
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="rgba(56, 189, 248, 0.3)"
          strokeWidth="2"
          strokeDasharray="8 4"
        />

        {/* 진행된 항로 (실선) */}
        <line
          x1={from.x}
          y1={from.y}
          x2={shipPosition.x}
          y2={shipPosition.y}
          stroke="#38bdf8"
          strokeWidth="3"
          filter="url(#glow)"
        />

        {/* 출발 항구 마커 */}
        <g transform={`translate(${from.x}, ${from.y})`}>
          <circle r="8" fill="#22c55e" filter="url(#glow)" />
          <circle r="4" fill="white" />
          <text
            y="-15"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
          >
            {departurePort.nameKo}
          </text>
        </g>

        {/* 도착 항구 마커 */}
        <g transform={`translate(${to.x}, ${to.y})`}>
          <circle r="8" fill="#f59e0b" filter="url(#glow)" />
          <circle r="4" fill="white" />
          <text
            y="-15"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
          >
            {arrivalPort.nameKo}
          </text>
        </g>

        {/* 배 아이콘 */}
        <g
          transform={`translate(${shipPosition.x}, ${shipPosition.y}) rotate(${shipAngle})`}
        >
          {/* 배 본체 */}
          <ellipse rx="12" ry="6" fill="#60a5fa" />
          <polygon points="-8,-3 -8,3 -14,0" fill="#3b82f6" />
          <rect x="-4" y="-8" width="8" height="5" fill="#93c5fd" rx="1" />
          {/* 깃발 */}
          <line x1="0" y1="-8" x2="0" y2="-16" stroke="#fbbf24" strokeWidth="1" />
          <polygon points="0,-16 8,-13 0,-10" fill="#fbbf24" />
        </g>
      </svg>

      {/* 진행률 오버레이 */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-medium">
              {departurePort.countryFlag} → {arrivalPort.countryFlag}
            </span>
            <span className="text-sm text-cyan-400 font-bold">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
