"use client";

import { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import { Port } from "@/lib/ports";

// TopoJSON URL (Natural Earth 110m simplified)
const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface RealWorldMapProps {
  departurePort: Port;
  arrivalPort: Port;
  progress: number; // 0-100
}

export function RealWorldMap({
  departurePort,
  arrivalPort,
  progress,
}: RealWorldMapProps) {
  // 출발/도착 좌표
  const fromCoords: [number, number] = [
    departurePort.coordinates.lng,
    departurePort.coordinates.lat,
  ];
  const toCoords: [number, number] = [
    arrivalPort.coordinates.lng,
    arrivalPort.coordinates.lat,
  ];

  // 현재 배 위치 (선형 보간)
  const shipPosition = useMemo(() => {
    const t = progress / 100;
    return [
      fromCoords[0] + (toCoords[0] - fromCoords[0]) * t,
      fromCoords[1] + (toCoords[1] - fromCoords[1]) * t,
    ] as [number, number];
  }, [fromCoords, toCoords, progress]);

  // 지도 중심점 (출발-도착 중간)
  const center = useMemo(() => {
    return [
      (fromCoords[0] + toCoords[0]) / 2,
      (fromCoords[1] + toCoords[1]) / 2,
    ] as [number, number];
  }, [fromCoords, toCoords]);

  // 줌 레벨 (거리에 따라 조정)
  const scale = useMemo(() => {
    const distance = Math.sqrt(
      Math.pow(toCoords[0] - fromCoords[0], 2) +
        Math.pow(toCoords[1] - fromCoords[1], 2)
    );
    // 거리가 가까우면 확대, 멀면 축소
    if (distance < 20) return 800;
    if (distance < 50) return 400;
    if (distance < 100) return 250;
    return 150;
  }, [fromCoords, toCoords]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: center,
          scale: scale,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* 국가/대륙 */}
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#334155"
                stroke="#475569"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "#3b4a5a" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* 항로 (점선) */}
        <Line
          from={fromCoords}
          to={toCoords}
          stroke="rgba(56, 189, 248, 0.4)"
          strokeWidth={2}
          strokeDasharray="5,5"
        />

        {/* 진행된 항로 (실선) */}
        <Line
          from={fromCoords}
          to={shipPosition}
          stroke="#38bdf8"
          strokeWidth={3}
        />

        {/* 출발 항구 마커 */}
        <Marker coordinates={fromCoords}>
          <circle r={8} fill="#22c55e" />
          <circle r={4} fill="white" />
          <text
            textAnchor="middle"
            y={-15}
            style={{
              fontFamily: "system-ui",
              fill: "white",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {departurePort.nameKo}
          </text>
        </Marker>

        {/* 도착 항구 마커 */}
        <Marker coordinates={toCoords}>
          <circle r={8} fill="#f59e0b" />
          <circle r={4} fill="white" />
          <text
            textAnchor="middle"
            y={-15}
            style={{
              fontFamily: "system-ui",
              fill: "white",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {arrivalPort.nameKo}
          </text>
        </Marker>

        {/* 배 아이콘 */}
        <Marker coordinates={shipPosition}>
          <g transform="translate(-12, -12)">
            <circle cx="12" cy="12" r="14" fill="#0ea5e9" opacity="0.3" />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              style={{ fontSize: "18px" }}
            >
              🚢
            </text>
          </g>
        </Marker>
      </ComposableMap>

      {/* 범례 */}
      <div className="absolute bottom-3 left-3 flex items-center gap-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-white">출발</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-white">도착</span>
        </div>
      </div>

      {/* 진행률 */}
      <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
        <span className="text-cyan-400 font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
