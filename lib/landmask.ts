// 간단한 육지 감지 - 한국/일본 주요 영역만 (MVP)

interface Coordinate {
  lat: number;
  lng: number;
}

// 간단한 바운딩 박스로 육지 영역 정의
// 정확한 폴리곤 대신 러프한 사각형 영역 사용
interface LandRegion {
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// 주요 육지 영역 (러프한 바운딩 박스)
const LAND_REGIONS: LandRegion[] = [
  // 일본 본토 (혼슈)
  { name: "honshu", minLat: 34.5, maxLat: 41.5, minLng: 136.0, maxLng: 141.0 },
  // 일본 규슈
  { name: "kyushu", minLat: 31.0, maxLat: 34.0, minLng: 129.5, maxLng: 132.0 },
  // 일본 시코쿠
  { name: "shikoku", minLat: 33.0, maxLat: 34.5, minLng: 132.5, maxLng: 134.8 },
  // 한국 남부
  { name: "korea-south", minLat: 34.5, maxLat: 38.0, minLng: 126.0, maxLng: 130.0 },
  // 중국 동부 해안
  { name: "china-east", minLat: 24.0, maxLat: 40.0, minLng: 117.0, maxLng: 125.0 },
  // 대만
  { name: "taiwan", minLat: 22.0, maxLat: 25.5, minLng: 120.0, maxLng: 122.0 },
];

// 좌표가 육지인지 체크 (러프한 바운딩 박스 기반)
export function isOnLand(coord: Coordinate): boolean {
  for (const region of LAND_REGIONS) {
    if (
      coord.lat >= region.minLat &&
      coord.lat <= region.maxLat &&
      coord.lng >= region.minLng &&
      coord.lng <= region.maxLng
    ) {
      return true;
    }
  }
  return false;
}

// 경로에서 육지를 지나는 포인트 인덱스 찾기
export function findLandCrossings(path: Coordinate[]): number[] {
  const crossings: number[] = [];
  for (let i = 0; i < path.length; i++) {
    if (isOnLand(path[i])) {
      crossings.push(i);
    }
  }
  return crossings;
}

// 두 점 사이에 육지가 있는지 체크 (N개 샘플링)
export function hasLandBetween(
  from: Coordinate,
  to: Coordinate,
  samples: number = 20
): boolean {
  for (let i = 1; i < samples; i++) {
    const t = i / samples;
    const point: Coordinate = {
      lat: from.lat + (to.lat - from.lat) * t,
      lng: from.lng + (to.lng - from.lng) * t,
    };
    if (isOnLand(point)) {
      return true;
    }
  }
  return false;
}

// 가장 가까운 바다 방향 찾기 (남쪽/동쪽/서쪽/북쪽)
export function findSeaDirection(coord: Coordinate): { lat: number; lng: number } {
  // 각 방향으로 조금씩 이동해서 바다인지 체크
  const directions = [
    { lat: -1, lng: 0 },  // 남
    { lat: 0, lng: 1 },   // 동
    { lat: 0, lng: -1 },  // 서
    { lat: 1, lng: 0 },   // 북
    { lat: -1, lng: 1 },  // 남동
    { lat: -1, lng: -1 }, // 남서
  ];

  for (const dir of directions) {
    const testPoint: Coordinate = {
      lat: coord.lat + dir.lat * 2,
      lng: coord.lng + dir.lng * 2,
    };
    if (!isOnLand(testPoint)) {
      return dir;
    }
  }

  // 기본값: 남쪽
  return { lat: -1, lng: 0 };
}
