// 베지어 곡선 유틸리티

interface Coordinate {
  lat: number;
  lng: number;
}

// 2차 베지어 곡선 (Quadratic Bezier)
// P0 = start, P1 = control, P2 = end
export function quadraticBezier(
  start: Coordinate,
  control: Coordinate,
  end: Coordinate,
  t: number
): Coordinate {
  const u = 1 - t;
  return {
    lat: u * u * start.lat + 2 * u * t * control.lat + t * t * end.lat,
    lng: u * u * start.lng + 2 * u * t * control.lng + t * t * end.lng,
  };
}

// 3차 베지어 곡선 (Cubic Bezier)
// P0 = start, P1 = control1, P2 = control2, P3 = end
export function cubicBezier(
  start: Coordinate,
  control1: Coordinate,
  control2: Coordinate,
  end: Coordinate,
  t: number
): Coordinate {
  const u = 1 - t;
  const u2 = u * u;
  const u3 = u2 * u;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    lat: u3 * start.lat + 3 * u2 * t * control1.lat + 3 * u * t2 * control2.lat + t3 * end.lat,
    lng: u3 * start.lng + 3 * u2 * t * control1.lng + 3 * u * t2 * control2.lng + t3 * end.lng,
  };
}

// 베지어 곡선을 N개 포인트로 샘플링
export function sampleQuadraticBezier(
  start: Coordinate,
  control: Coordinate,
  end: Coordinate,
  samples: number = 20
): Coordinate[] {
  const points: Coordinate[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    points.push(quadraticBezier(start, control, end, t));
  }
  return points;
}

export function sampleCubicBezier(
  start: Coordinate,
  control1: Coordinate,
  control2: Coordinate,
  end: Coordinate,
  samples: number = 20
): Coordinate[] {
  const points: Coordinate[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    points.push(cubicBezier(start, control1, control2, end, t));
  }
  return points;
}

// 두 점 사이의 중점 계산
export function midpoint(a: Coordinate, b: Coordinate): Coordinate {
  return {
    lat: (a.lat + b.lat) / 2,
    lng: (a.lng + b.lng) / 2,
  };
}

// 두 점 사이의 수직 방향 벡터 (바다 쪽으로 휘기 위해)
// 오른쪽 90도 회전된 방향
export function perpendicularOffset(
  from: Coordinate,
  to: Coordinate,
  offsetMagnitude: number
): Coordinate {
  // 방향 벡터
  const dx = to.lng - from.lng;
  const dy = to.lat - from.lat;

  // 90도 회전 (오른쪽 = 남쪽으로 휨)
  // 원래: (dx, dy) → 회전: (-dy, dx) 또는 (dy, -dx)
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return midpoint(from, to);

  // 정규화 후 오프셋 적용
  const perpX = -dy / length * offsetMagnitude;
  const perpY = dx / length * offsetMagnitude;

  const mid = midpoint(from, to);
  return {
    lat: mid.lat + perpY,
    lng: mid.lng + perpX,
  };
}

// 특정 방향으로 오프셋된 컨트롤 포인트 생성
export function createControlPoint(
  from: Coordinate,
  to: Coordinate,
  direction: { lat: number; lng: number },
  magnitude: number
): Coordinate {
  const mid = midpoint(from, to);
  return {
    lat: mid.lat + direction.lat * magnitude,
    lng: mid.lng + direction.lng * magnitude,
  };
}
