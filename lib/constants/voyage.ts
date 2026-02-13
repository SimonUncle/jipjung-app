// 잠항 관련 상수

export const VOYAGE_CONFIG = {
  // 거리-시간 변환 비율 (km당 분)
  KM_PER_MINUTE: 50,

  // 최소/최대 잠항 시간 (분)
  MIN_DURATION_MINUTES: 10,
  MAX_DURATION_MINUTES: 180,

  // 지구 반지름 (km) - Haversine 공식용
  EARTH_RADIUS_KM: 6371,

  // 위치 기록 간격 (초)
  POSITION_RECORD_INTERVAL: 5,
} as const;

// 타입 추론을 위한 export
export type VoyageConfig = typeof VOYAGE_CONFIG;
