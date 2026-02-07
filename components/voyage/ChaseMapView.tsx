"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-rotate";
import { Port } from "@/lib/ports";

interface ChaseMapViewProps {
  departurePort: Port;
  arrivalPort: Port;
  currentPosition: { lat: number; lng: number } | null;
  positionHistory: { lat: number; lng: number }[];
  seaRoute?: { lat: number; lng: number }[];
  progress: number;
}

// 방위각 계산 (현재 위치 → 목적지)
function calculateBearing(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360; // 0-360도로 정규화
}

// Ship icon (always pointing up - map rotates instead)
const createShipIcon = () => {
  // 지도가 회전하므로 배는 항상 위쪽(화면 위)을 향함
  return L.divIcon({
    className: "ship-marker-chase",
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #0ea5e9, #06b6d4);
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 2l-2 3h4l-2-3"/>
          <path d="M8 5l-1 8h10l-1-8"/>
          <path d="M6 13v6h12v-6"/>
          <path d="M9 19l3 3 3-3"/>
        </svg>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// Destination marker
const createDestinationIcon = () => {
  return L.divIcon({
    className: "destination-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #f59e0b, #fbbf24);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to follow ship position and rotate map
function MapFollower({
  position,
  bearing,
}: {
  position: { lat: number; lng: number };
  bearing: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([position.lat, position.lng], 7, { animate: true, duration: 0.5 });
    // 지도 회전: 목적지가 위쪽에 오도록 (bearing 반대 방향으로 회전)
    if (typeof (map as any).setBearing === "function") {
      (map as any).setBearing(-bearing);
    }
  }, [map, position, bearing]);

  return null;
}

export function ChaseMapView({
  departurePort,
  arrivalPort,
  currentPosition,
  positionHistory,
  seaRoute = [],
  progress,
}: ChaseMapViewProps) {
  // Use current position or departure as center
  const shipPos = currentPosition || departurePort.coordinates;

  // 지도 회전 각도 계산 (목적지가 위쪽에 오도록)
  const mapBearing = useMemo(() => {
    return calculateBearing(shipPos, arrivalPort.coordinates);
  }, [shipPos, arrivalPort.coordinates]);

  // Convert position history to polyline format (including current position)
  const trailLine = useMemo(() => {
    const history = positionHistory.map(pos => [pos.lat, pos.lng] as [number, number]);
    // 현재 위치도 추가해서 배까지 선이 이어지게
    if (currentPosition) {
      history.push([currentPosition.lat, currentPosition.lng]);
    }
    return history;
  }, [positionHistory, currentPosition]);

  // Full route for reference (dashed line) - 바다 경로 사용
  const fullRoute = useMemo((): [number, number][] => {
    if (seaRoute.length > 1) {
      return seaRoute.map(coord => [coord.lat, coord.lng]);
    }
    return [
      [departurePort.coordinates.lat, departurePort.coordinates.lng],
      [arrivalPort.coordinates.lat, arrivalPort.coordinates.lng],
    ];
  }, [seaRoute, departurePort, arrivalPort]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <MapContainer
        center={[shipPos.lat, shipPos.lng]}
        zoom={7}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        touchZoom={false}
        doubleClickZoom={false}
        keyboard={false}
        // @ts-ignore - leaflet-rotate 옵션
        rotate={true}
        rotateControl={false}
        bearing={0}
      >
        {/* Dark themed map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap'
        />

        {/* Follow ship position and rotate map */}
        <MapFollower position={shipPos} bearing={mapBearing} />

        {/* Full route (dashed, dimmed) */}
        <Polyline
          positions={fullRoute}
          pathOptions={{
            color: "rgba(56, 189, 248, 0.2)",
            weight: 2,
            dashArray: "8, 8",
          }}
        />

        {/* Trail - traveled path (glowing effect) */}
        {trailLine.length > 1 && (
          <>
            {/* Glow layer */}
            <Polyline
              positions={trailLine}
              pathOptions={{
                color: "rgba(6, 182, 212, 0.3)",
                weight: 12,
              }}
            />
            {/* Main trail */}
            <Polyline
              positions={trailLine}
              pathOptions={{
                color: "#06b6d4",
                weight: 4,
              }}
            />
          </>
        )}

        {/* Destination marker */}
        <Marker
          position={[arrivalPort.coordinates.lat, arrivalPort.coordinates.lng]}
          icon={createDestinationIcon()}
        />

        {/* Ship marker - 항상 위쪽 (지도가 회전) */}
        <Marker
          position={[shipPos.lat, shipPos.lng]}
          icon={createShipIcon()}
        />
      </MapContainer>

      {/* Destination info overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]
                      bg-black/60 backdrop-blur-sm rounded-full px-4 py-2
                      border border-white/20">
        <div className="flex items-center gap-2 text-white">
          <span className="text-lg">{arrivalPort.countryFlag}</span>
          <span className="font-medium">{arrivalPort.nameKo}</span>
          <span className="text-cyan-400 text-sm">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Speed/movement indicator */}
      <div className="absolute bottom-4 left-4 z-[1000]
                      bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2
                      border border-white/20">
        <div className="text-xs text-white/60">추적 모드</div>
        <div className="text-cyan-400 font-medium text-sm">배 따라가기</div>
      </div>
    </div>
  );
}
