"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Port } from "@/lib/ports";

interface MapContentProps {
  departurePort: Port;
  arrivalPort: Port;
  progress: number;
  zoom: number;
  seaRoute?: { lat: number; lng: number }[];
}

// Fix default marker icon issue in Leaflet
const createIcon = (color: string, size: number = 24) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const createShipIcon = () => {
  return L.divIcon({
    className: "ship-marker",
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #0ea5e9, #06b6d4);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M2 20l2-3h16l2 3"/>
          <path d="M4 17l1-8h14l1 8"/>
          <path d="M12 4v5"/>
          <path d="M12 4l4 2-4 2" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Component to handle map zoom updates only (not center - allow free panning)
function MapController({
  zoom,
}: {
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    // Only update zoom level, preserve current center (user's pan position)
    const currentCenter = map.getCenter();
    map.setView(currentCenter, zoom, { animate: true });
  }, [map, zoom]);

  return null;
}

export default function MapContent({
  departurePort,
  arrivalPort,
  progress,
  zoom,
  seaRoute = [],
}: MapContentProps) {
  const fromCoords: [number, number] = [
    departurePort.coordinates.lat,
    departurePort.coordinates.lng,
  ];
  const toCoords: [number, number] = [
    arrivalPort.coordinates.lat,
    arrivalPort.coordinates.lng,
  ];

  // 바다 경로를 Polyline 형식으로 변환
  const routeAsPolyline = useMemo((): [number, number][] => {
    if (seaRoute.length > 1) {
      return seaRoute.map(coord => [coord.lat, coord.lng]);
    }
    return [fromCoords, toCoords];
  }, [seaRoute, fromCoords, toCoords]);

  // Current ship position (바다 경로를 따라 보간)
  const shipPosition = useMemo(() => {
    if (seaRoute.length > 1) {
      // 바다 경로를 따라 보간
      const t = Math.max(0, Math.min(100, progress)) / 100;

      // 전체 경로 길이 계산
      let totalLength = 0;
      const segmentLengths: number[] = [];

      for (let i = 0; i < seaRoute.length - 1; i++) {
        const segmentLength = Math.sqrt(
          Math.pow(seaRoute[i + 1].lat - seaRoute[i].lat, 2) +
          Math.pow(seaRoute[i + 1].lng - seaRoute[i].lng, 2)
        );
        segmentLengths.push(segmentLength);
        totalLength += segmentLength;
      }

      if (totalLength === 0) return fromCoords;

      const targetLength = totalLength * t;
      let accumulatedLength = 0;

      for (let i = 0; i < segmentLengths.length; i++) {
        const segmentLength = segmentLengths[i];

        if (accumulatedLength + segmentLength >= targetLength) {
          const segmentProgress = segmentLength > 0
            ? (targetLength - accumulatedLength) / segmentLength
            : 0;

          return [
            seaRoute[i].lat + (seaRoute[i + 1].lat - seaRoute[i].lat) * segmentProgress,
            seaRoute[i].lng + (seaRoute[i + 1].lng - seaRoute[i].lng) * segmentProgress,
          ] as [number, number];
        }

        accumulatedLength += segmentLength;
      }

      return [seaRoute[seaRoute.length - 1].lat, seaRoute[seaRoute.length - 1].lng] as [number, number];
    }

    // 기본: 직선 보간
    const t = progress / 100;
    return [
      fromCoords[0] + (toCoords[0] - fromCoords[0]) * t,
      fromCoords[1] + (toCoords[1] - fromCoords[1]) * t,
    ] as [number, number];
  }, [seaRoute, fromCoords, toCoords, progress]);

  // Map center (middle of route)
  const center = useMemo(() => {
    if (seaRoute.length > 0) {
      // 바다 경로의 중간 지점
      const midIndex = Math.floor(seaRoute.length / 2);
      return [seaRoute[midIndex].lat, seaRoute[midIndex].lng] as [number, number];
    }
    return [
      (fromCoords[0] + toCoords[0]) / 2,
      (fromCoords[1] + toCoords[1]) / 2,
    ] as [number, number];
  }, [seaRoute, fromCoords, toCoords]);

  // Progress line (solid - traveled portion)
  const progressLine = useMemo((): [number, number][] => {
    if (seaRoute.length > 1) {
      // 바다 경로에서 진행된 부분만 추출
      const t = progress / 100;
      let totalLength = 0;
      const segmentLengths: number[] = [];

      for (let i = 0; i < seaRoute.length - 1; i++) {
        const segmentLength = Math.sqrt(
          Math.pow(seaRoute[i + 1].lat - seaRoute[i].lat, 2) +
          Math.pow(seaRoute[i + 1].lng - seaRoute[i].lng, 2)
        );
        segmentLengths.push(segmentLength);
        totalLength += segmentLength;
      }

      if (totalLength === 0) return [fromCoords];

      const targetLength = totalLength * t;
      let accumulatedLength = 0;
      const result: [number, number][] = [[seaRoute[0].lat, seaRoute[0].lng]];

      for (let i = 0; i < segmentLengths.length; i++) {
        const segmentLength = segmentLengths[i];

        if (accumulatedLength + segmentLength >= targetLength) {
          const segmentProgress = segmentLength > 0
            ? (targetLength - accumulatedLength) / segmentLength
            : 0;

          result.push([
            seaRoute[i].lat + (seaRoute[i + 1].lat - seaRoute[i].lat) * segmentProgress,
            seaRoute[i].lng + (seaRoute[i + 1].lng - seaRoute[i].lng) * segmentProgress,
          ]);
          break;
        }

        result.push([seaRoute[i + 1].lat, seaRoute[i + 1].lng]);
        accumulatedLength += segmentLength;
      }

      return result;
    }
    return [fromCoords, shipPosition];
  }, [seaRoute, fromCoords, shipPosition, progress]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
      attributionControl={false}
      dragging={true}
      scrollWheelZoom={true}
      touchZoom={true}
      doubleClickZoom={true}
    >
      {/* Dark themed map tiles */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Map controller for zoom only */}
      <MapController zoom={zoom} />

      {/* Full route (dashed) - 바다 경로 사용 */}
      <Polyline
        positions={routeAsPolyline}
        pathOptions={{
          color: "rgba(56, 189, 248, 0.4)",
          weight: 3,
          dashArray: "10, 10",
        }}
      />

      {/* Traveled route (solid) */}
      <Polyline
        positions={progressLine}
        pathOptions={{
          color: "#38bdf8",
          weight: 4,
        }}
      />

      {/* Departure marker */}
      <Marker position={fromCoords} icon={createIcon("#22c55e", 20)} />

      {/* Arrival marker */}
      <Marker position={toCoords} icon={createIcon("#f59e0b", 20)} />

      {/* Ship marker */}
      <Marker position={shipPosition} icon={createShipIcon()} />
    </MapContainer>
  );
}
