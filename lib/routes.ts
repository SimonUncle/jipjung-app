// 항로 정의

import { Port, getPortById, PORTS } from "./ports";
import { VOYAGE_CONFIG } from "./constants/voyage";

export interface Route {
  id: string;
  fromId: string;
  toId: string;
  distance: number; // km
  minDuration: number; // 최소 집중 시간 (분)
}

// 두 지점 사이의 거리 계산 (Haversine formula)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(VOYAGE_CONFIG.EARTH_RADIUS_KM * c);
}

// 거리에 따른 집중 시간 계산 (FlightMode 스타일)
export function distanceToMinutes(distance: number): number {
  const minutes = Math.round(distance / VOYAGE_CONFIG.KM_PER_MINUTE);
  return Math.max(
    VOYAGE_CONFIG.MIN_DURATION_MINUTES,
    Math.min(VOYAGE_CONFIG.MAX_DURATION_MINUTES, minutes)
  );
}

// 모든 가능한 항로 생성 (동적으로)
export function generateRoutes(): Route[] {
  const routes: Route[] = [];

  for (let i = 0; i < PORTS.length; i++) {
    for (let j = i + 1; j < PORTS.length; j++) {
      const from = PORTS[i];
      const to = PORTS[j];
      const distance = calculateDistance(
        from.coordinates.lat,
        from.coordinates.lng,
        to.coordinates.lat,
        to.coordinates.lng
      );

      routes.push({
        id: `${from.id}-${to.id}`,
        fromId: from.id,
        toId: to.id,
        distance,
        minDuration: distanceToMinutes(distance),
      });
    }
  }

  return routes;
}

// 특정 출발지에서 갈 수 있는 항로 목록
export function getRoutesFrom(portId: string, unlockedPortIds: string[]): Route[] {
  const allRoutes = generateRoutes();
  return allRoutes.filter((route) => {
    // 출발지가 현재 항구인 경우
    if (route.fromId === portId && unlockedPortIds.includes(route.toId)) {
      return true;
    }
    // 도착지가 현재 항구인 경우 (양방향)
    if (route.toId === portId && unlockedPortIds.includes(route.fromId)) {
      return true;
    }
    return false;
  });
}

// 두 항구 사이의 거리 계산
export function getDistanceBetween(fromId: string, toId: string): number {
  const from = getPortById(fromId);
  const to = getPortById(toId);

  if (!from || !to) return 0;

  return calculateDistance(
    from.coordinates.lat,
    from.coordinates.lng,
    to.coordinates.lat,
    to.coordinates.lng
  );
}

// 항해 진행률에 따른 현재 위치 계산 (보간)
// 바다 경로가 있으면 그것을 따라가고, 없으면 직선 보간
export function interpolatePosition(
  from: Port,
  to: Port,
  progress: number, // 0-100
  seaRoute?: { lat: number; lng: number }[] // 바다 경로 (옵션)
): { lat: number; lng: number } {
  // 바다 경로가 있으면 그것을 따라 보간
  if (seaRoute && seaRoute.length > 1) {
    return interpolateAlongSeaRoute(seaRoute, progress);
  }

  // 기본: 단순 선형 보간
  const t = progress / 100;
  return {
    lat: from.coordinates.lat + (to.coordinates.lat - from.coordinates.lat) * t,
    lng: from.coordinates.lng + (to.coordinates.lng - from.coordinates.lng) * t,
  };
}

// 바다 경로를 따라 보간
function interpolateAlongSeaRoute(
  path: { lat: number; lng: number }[],
  progress: number
): { lat: number; lng: number } {
  if (path.length === 0) return { lat: 0, lng: 0 };
  if (path.length === 1) return path[0];

  const t = Math.max(0, Math.min(100, progress)) / 100;

  // 전체 경로 길이 계산
  let totalLength = 0;
  const segmentLengths: number[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const segmentLength = Math.sqrt(
      Math.pow(path[i + 1].lat - path[i].lat, 2) +
      Math.pow(path[i + 1].lng - path[i].lng, 2)
    );
    segmentLengths.push(segmentLength);
    totalLength += segmentLength;
  }

  if (totalLength === 0) return path[0];

  // 현재 위치 찾기
  const targetLength = totalLength * t;
  let accumulatedLength = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segmentLength = segmentLengths[i];

    if (accumulatedLength + segmentLength >= targetLength) {
      const segmentProgress = segmentLength > 0
        ? (targetLength - accumulatedLength) / segmentLength
        : 0;

      return {
        lat: path[i].lat + (path[i + 1].lat - path[i].lat) * segmentProgress,
        lng: path[i].lng + (path[i + 1].lng - path[i].lng) * segmentProgress,
      };
    }

    accumulatedLength += segmentLength;
  }

  return path[path.length - 1];
}

// 집중 시간에 따른 추천 항로
export function getRecommendedRoutes(
  currentPortId: string,
  duration: number,
  unlockedPortIds: string[]
): Route[] {
  const allRoutes = generateRoutes();

  return allRoutes
    .filter((route) => {
      // 현재 항구에서 출발하거나 도착하는 항로
      const isConnected =
        route.fromId === currentPortId || route.toId === currentPortId;
      if (!isConnected) return false;

      // 목적지가 해금되어 있어야 함
      const destinationId =
        route.fromId === currentPortId ? route.toId : route.fromId;
      if (!unlockedPortIds.includes(destinationId)) return false;

      // 최소 시간 조건 충족
      return route.minDuration <= duration;
    })
    .sort((a, b) => {
      // 선택한 시간에 가장 적합한 순으로 정렬
      const aDiff = Math.abs(a.minDuration - duration);
      const bDiff = Math.abs(b.minDuration - duration);
      return aDiff - bDiff;
    });
}

// 집중 시간 옵션
export const DURATION_OPTIONS = [
  { value: 0.5, label: "30초", emoji: "⚡" },  // 테스트용
  { value: 1, label: "1분", emoji: "🏃" },     // 테스트용
  { value: 15, label: "15분", emoji: "⛵" },
  { value: 25, label: "25분", emoji: "🚤" },
  { value: 45, label: "45분", emoji: "🛳️" },
  { value: 60, label: "60분", emoji: "🚢" },
];
