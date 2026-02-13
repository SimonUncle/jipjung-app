// 바다 경로 시스템 - 사전 계산된 경로 + 베지어 폴백

import { Port } from "./ports";
import { findLandCrossings } from "./landmask";
import {
  sampleQuadraticBezier,
  midpoint,
  createControlPoint
} from "./bezier";

interface Coordinate {
  lat: number;
  lng: number;
}

// 경로 캐시
const routeCache: Map<string, Coordinate[]> = new Map();

// 사전 계산된 경로 데이터
let precomputedRoutes: Record<string, Coordinate[]> | null = null;
let loadingPromise: Promise<Record<string, Coordinate[]>> | null = null;

// 사전 계산된 경로 로드
async function loadPrecomputedRoutes(): Promise<Record<string, Coordinate[]>> {
  if (precomputedRoutes) return precomputedRoutes;

  // 이미 로딩 중이면 기다림
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const res = await fetch('/data/sea-routes.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      precomputedRoutes = await res.json();
      return precomputedRoutes!;
    } catch (error) {
      console.warn('Failed to load precomputed routes:', error);
      precomputedRoutes = {};
      return precomputedRoutes;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

// 캐시 키 생성
function getCacheKey(fromId: string, toId: string): string {
  return `${fromId}->${toId}`;
}

// 바다 방향 추정 (출발/도착 기준)
function estimateSeaDirection(from: Coordinate, to: Coordinate): { lat: number; lng: number } {
  // 동아시아 지역: 대부분 남쪽이 바다
  const midLat = (from.lat + to.lat) / 2;
  const midLng = (from.lng + to.lng) / 2;

  // 일본 근처면 남쪽으로
  if (midLng > 128 && midLng < 145 && midLat > 30 && midLat < 45) {
    return { lat: -1, lng: 0 }; // 남쪽
  }

  // 한국-중국 사이면 남서쪽으로
  if (midLng > 118 && midLng < 130 && midLat > 30 && midLat < 40) {
    return { lat: -1, lng: -0.5 }; // 남서쪽
  }

  // 기본: 남쪽
  return { lat: -1, lng: 0 };
}

// 베지어 곡선으로 경로 생성 (육지 회피)
function createBezierRoute(
  from: Coordinate,
  to: Coordinate,
  maxAttempts: number = 5
): Coordinate[] {
  const samples = 30; // 샘플링 포인트 수
  let offsetMagnitude = 3; // 초기 오프셋 (도 단위)

  // 바다 방향 추정
  const seaDir = estimateSeaDirection(from, to);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 컨트롤 포인트 생성 (바다 방향으로 오프셋)
    const control = createControlPoint(from, to, seaDir, offsetMagnitude);

    // 베지어 곡선 샘플링
    const path = sampleQuadraticBezier(from, control, to, samples);

    // 육지 체크
    const crossings = findLandCrossings(path);

    if (crossings.length === 0) {
      // 육지 없음 - 성공!
      return path;
    }

    // 육지 발견 - 오프셋 증가
    offsetMagnitude += 2;
  }

  // 최대 시도 후에도 실패 - 웨이포인트 추가로 우회
  return createWaypointRoute(from, to, seaDir);
}

// 웨이포인트 추가로 우회 경로 생성
function createWaypointRoute(
  from: Coordinate,
  to: Coordinate,
  seaDir: { lat: number; lng: number }
): Coordinate[] {
  // 중간에 바다 쪽 웨이포인트 추가
  const mid = midpoint(from, to);
  const waypoint: Coordinate = {
    lat: mid.lat + seaDir.lat * 8, // 큰 오프셋
    lng: mid.lng + seaDir.lng * 4,
  };

  // 두 구간 각각 베지어로
  const firstHalf = createSimpleBezier(from, waypoint, seaDir, 2);
  const secondHalf = createSimpleBezier(waypoint, to, seaDir, 2);

  // 중복 제거하고 합치기
  return [...firstHalf.slice(0, -1), ...secondHalf];
}

// 간단한 베지어 (재귀 방지용)
function createSimpleBezier(
  from: Coordinate,
  to: Coordinate,
  seaDir: { lat: number; lng: number },
  offset: number
): Coordinate[] {
  const control = createControlPoint(from, to, seaDir, offset);
  return sampleQuadraticBezier(from, control, to, 15);
}

// 두 항구 사이 바다 경로 가져오기
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

  // 사전 계산된 경로 확인
  const routes = await loadPrecomputedRoutes();

  if (routes[cacheKey]) {
    routeCache.set(cacheKey, routes[cacheKey]);
    return routes[cacheKey];
  }

  // 역방향 사전 계산 경로 확인
  if (routes[reverseCacheKey]) {
    const reversed = [...routes[reverseCacheKey]].reverse();
    routeCache.set(cacheKey, reversed);
    return reversed;
  }

  // 폴백: 베지어 곡선으로 경로 생성
  console.warn(`No precomputed route for ${cacheKey}, using bezier fallback`);
  const route = createBezierRoute(from.coordinates, to.coordinates);
  routeCache.set(cacheKey, route);

  return route;
}

// 동기 버전 (데이터 로드 후 사용)
export function getSeaRouteSync(from: Port, to: Port): Coordinate[] {
  const cacheKey = getCacheKey(from.id, to.id);

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

  // 사전 계산된 경로 확인 (이미 로드된 경우만)
  if (precomputedRoutes) {
    if (precomputedRoutes[cacheKey]) {
      routeCache.set(cacheKey, precomputedRoutes[cacheKey]);
      return precomputedRoutes[cacheKey];
    }
    if (precomputedRoutes[reverseCacheKey]) {
      const reversed = [...precomputedRoutes[reverseCacheKey]].reverse();
      routeCache.set(cacheKey, reversed);
      return reversed;
    }
  }

  // 캐시 없으면 베지어 경로 생성
  const route = createBezierRoute(from.coordinates, to.coordinates);
  routeCache.set(cacheKey, route);
  return route;
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
