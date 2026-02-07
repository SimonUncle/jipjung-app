// 바다 경로 시스템 - searoute-js 기반 (육지 피해 실제 해상 경로)

import { Port } from "./ports";

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const searoute: any = require("searoute-js");

interface Coordinate {
  lat: number;
  lng: number;
}

// GeoJSON Point 생성
function createGeoJSONPoint(coord: Coordinate) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Point" as const,
      coordinates: [coord.lng, coord.lat] as [number, number], // GeoJSON은 [lng, lat] 순서
    },
  };
}

// 경로 캐시
const routeCache: Map<string, Coordinate[]> = new Map();

// 캐시 키 생성
function getCacheKey(fromId: string, toId: string): string {
  return `${fromId}->${toId}`;
}

// 두 항구 사이 바다 경로 가져오기 (searoute-js 사용)
export async function getSeaRoute(from: Port, to: Port): Promise<Coordinate[]> {
  const cacheKey = getCacheKey(from.id, to.id);

  // 캐시 확인
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  // 역방향 캐시 확인
  const reverseCacheKey = getCacheKey(to.id, from.id);
  if (routeCache.has(reverseCacheKey)) {
    const reversed = [...routeCache.get(reverseCacheKey)!].reverse();
    routeCache.set(cacheKey, reversed);
    return reversed;
  }

  try {
    // GeoJSON Point 생성
    const origin = createGeoJSONPoint(from.coordinates);
    const destination = createGeoJSONPoint(to.coordinates);

    // searoute-js로 경로 계산
    const result = searoute(origin, destination, "km");

    if (result && result.geometry && result.geometry.coordinates) {
      // GeoJSON [lng, lat] → { lat, lng } 변환
      const route: Coordinate[] = result.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => ({ lat, lng })
      );

      // 캐시에 저장
      routeCache.set(cacheKey, route);

      return route;
    }
  } catch (error) {
    console.warn("Sea route calculation failed, using direct route:", error);
  }

  // 실패 시 직선 경로 fallback
  const directRoute = [from.coordinates, to.coordinates];
  routeCache.set(cacheKey, directRoute);
  return directRoute;
}

// 동기 버전 (데이터 로드 후 사용)
export function getSeaRouteSync(from: Port, to: Port): Coordinate[] {
  const cacheKey = getCacheKey(from.id, to.id);

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  // 캐시 없으면 직선 반환 (fallback)
  return [from.coordinates, to.coordinates];
}

// 경로를 따라 보간
export function interpolateAlongPath(
  path: Coordinate[],
  progress: number // 0-100
): Coordinate {
  if (path.length === 0) {
    throw new Error("Path is empty");
  }

  if (path.length === 1) {
    return path[0];
  }

  // progress를 0-1로 변환
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

  // 현재 위치 찾기
  const targetLength = totalLength * t;
  let accumulatedLength = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segmentLength = segmentLengths[i];

    if (accumulatedLength + segmentLength >= targetLength) {
      // 이 세그먼트 내에서 보간
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

  // 마지막 점 반환
  return path[path.length - 1];
}

// 캐시 클리어
export function clearRouteCache(): void {
  routeCache.clear();
}

// Polyline 형식으로 변환 (Leaflet용)
export function routeToPolyline(route: Coordinate[]): [number, number][] {
  return route.map((coord) => [coord.lat, coord.lng]);
}
