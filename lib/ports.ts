// 항구 데이터 정의

export interface Port {
  id: string;
  name: string;
  nameKo: string;
  country: string;
  countryFlag: string;
  coordinates: { lat: number; lng: number };
  description: string;
  landmark?: string;
}

// 세계 주요 항구들
export const PORTS: Port[] = [
  // 아시아
  {
    id: "busan",
    name: "Busan",
    nameKo: "부산",
    country: "South Korea",
    countryFlag: "🇰🇷",
    coordinates: { lat: 35.1796, lng: 129.0756 },
    description: "대한민국의 대표적인 항구도시",
    landmark: "광안대교",
  },
  {
    id: "osaka",
    name: "Osaka",
    nameKo: "오사카",
    country: "Japan",
    countryFlag: "🇯🇵",
    coordinates: { lat: 34.6937, lng: 135.5023 },
    description: "일본의 식도락 수도",
    landmark: "오사카성",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    nameKo: "도쿄",
    country: "Japan",
    countryFlag: "🇯🇵",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    description: "일본의 수도이자 세계적인 메트로폴리스",
    landmark: "도쿄타워",
  },
  {
    id: "shanghai",
    name: "Shanghai",
    nameKo: "상하이",
    country: "China",
    countryFlag: "🇨🇳",
    coordinates: { lat: 31.2304, lng: 121.4737 },
    description: "동양의 진주라 불리는 중국 최대 도시",
    landmark: "동방명주",
  },
  {
    id: "hongkong",
    name: "Hong Kong",
    nameKo: "홍콩",
    country: "Hong Kong",
    countryFlag: "🇭🇰",
    coordinates: { lat: 22.3193, lng: 114.1694 },
    description: "동서양이 만나는 국제도시",
    landmark: "빅토리아 피크",
  },
  {
    id: "singapore",
    name: "Singapore",
    nameKo: "싱가포르",
    country: "Singapore",
    countryFlag: "🇸🇬",
    coordinates: { lat: 1.3521, lng: 103.8198 },
    description: "동남아시아의 금융 허브",
    landmark: "마리나베이 샌즈",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    nameKo: "방콕",
    country: "Thailand",
    countryFlag: "🇹🇭",
    coordinates: { lat: 13.7563, lng: 100.5018 },
    description: "천사의 도시",
    landmark: "왓 아룬",
  },

  // 오세아니아
  {
    id: "sydney",
    name: "Sydney",
    nameKo: "시드니",
    country: "Australia",
    countryFlag: "🇦🇺",
    coordinates: { lat: -33.8688, lng: 151.2093 },
    description: "호주 최대의 항구도시",
    landmark: "시드니 오페라하우스",
  },
  {
    id: "auckland",
    name: "Auckland",
    nameKo: "오클랜드",
    country: "New Zealand",
    countryFlag: "🇳🇿",
    coordinates: { lat: -36.8485, lng: 174.7633 },
    description: "돛의 도시",
    landmark: "스카이타워",
  },

  // 북미
  {
    id: "honolulu",
    name: "Honolulu",
    nameKo: "호놀룰루",
    country: "USA",
    countryFlag: "🇺🇸",
    coordinates: { lat: 21.3069, lng: -157.8583 },
    description: "하와이의 수도, 태평양의 낙원",
    landmark: "와이키키 비치",
  },
  {
    id: "sanfrancisco",
    name: "San Francisco",
    nameKo: "샌프란시스코",
    country: "USA",
    countryFlag: "🇺🇸",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    description: "골든게이트의 도시",
    landmark: "금문교",
  },
  {
    id: "losangeles",
    name: "Los Angeles",
    nameKo: "로스앤젤레스",
    country: "USA",
    countryFlag: "🇺🇸",
    coordinates: { lat: 33.9425, lng: -118.4081 },
    description: "천사의 도시, 할리우드의 본고장",
    landmark: "할리우드 사인",
  },
  {
    id: "vancouver",
    name: "Vancouver",
    nameKo: "밴쿠버",
    country: "Canada",
    countryFlag: "🇨🇦",
    coordinates: { lat: 49.2827, lng: -123.1207 },
    description: "태평양의 관문",
    landmark: "스탠리 파크",
  },
  {
    id: "newyork",
    name: "New York",
    nameKo: "뉴욕",
    country: "USA",
    countryFlag: "🇺🇸",
    coordinates: { lat: 40.7128, lng: -74.006 },
    description: "잠들지 않는 도시",
    landmark: "자유의 여신상",
  },
  {
    id: "miami",
    name: "Miami",
    nameKo: "마이애미",
    country: "USA",
    countryFlag: "🇺🇸",
    coordinates: { lat: 25.7617, lng: -80.1918 },
    description: "마법의 도시",
    landmark: "마이애미 비치",
  },

  // 유럽
  {
    id: "lisbon",
    name: "Lisbon",
    nameKo: "리스본",
    country: "Portugal",
    countryFlag: "🇵🇹",
    coordinates: { lat: 38.7223, lng: -9.1393 },
    description: "일곱 언덕의 도시, 대항해시대의 출발점",
    landmark: "벨렘탑",
  },
  {
    id: "barcelona",
    name: "Barcelona",
    nameKo: "바르셀로나",
    country: "Spain",
    countryFlag: "🇪🇸",
    coordinates: { lat: 41.3851, lng: 2.1734 },
    description: "가우디의 도시",
    landmark: "사그라다 파밀리아",
  },
  {
    id: "marseille",
    name: "Marseille",
    nameKo: "마르세유",
    country: "France",
    countryFlag: "🇫🇷",
    coordinates: { lat: 43.2965, lng: 5.3698 },
    description: "프랑스 최대의 항구도시",
    landmark: "노트르담 드 라 가르드",
  },
  {
    id: "venice",
    name: "Venice",
    nameKo: "베니스",
    country: "Italy",
    countryFlag: "🇮🇹",
    coordinates: { lat: 45.4408, lng: 12.3155 },
    description: "물의 도시",
    landmark: "산마르코 광장",
  },
  {
    id: "athens",
    name: "Athens",
    nameKo: "아테네",
    country: "Greece",
    countryFlag: "🇬🇷",
    coordinates: { lat: 37.9838, lng: 23.7275 },
    description: "서양 문명의 요람",
    landmark: "파르테논 신전",
  },
  {
    id: "istanbul",
    name: "Istanbul",
    nameKo: "이스탄불",
    country: "Turkey",
    countryFlag: "🇹🇷",
    coordinates: { lat: 41.0082, lng: 28.9784 },
    description: "동서양의 교차로",
    landmark: "아야소피아",
  },
  {
    id: "amsterdam",
    name: "Amsterdam",
    nameKo: "암스테르담",
    country: "Netherlands",
    countryFlag: "🇳🇱",
    coordinates: { lat: 52.3676, lng: 4.9041 },
    description: "북쪽의 베니스",
    landmark: "안네 프랑크의 집",
  },
  {
    id: "london",
    name: "London",
    nameKo: "런던",
    country: "UK",
    countryFlag: "🇬🇧",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    description: "템즈강의 도시",
    landmark: "타워 브릿지",
  },
  {
    id: "copenhagen",
    name: "Copenhagen",
    nameKo: "코펜하겐",
    country: "Denmark",
    countryFlag: "🇩🇰",
    coordinates: { lat: 55.6761, lng: 12.5683 },
    description: "인어공주의 도시",
    landmark: "인어공주 동상",
  },

  // 아프리카/중동
  {
    id: "dubai",
    name: "Dubai",
    nameKo: "두바이",
    country: "UAE",
    countryFlag: "🇦🇪",
    coordinates: { lat: 25.2048, lng: 55.2708 },
    description: "사막의 기적",
    landmark: "부르즈 할리파",
  },
  {
    id: "capetown",
    name: "Cape Town",
    nameKo: "케이프타운",
    country: "South Africa",
    countryFlag: "🇿🇦",
    coordinates: { lat: -33.9249, lng: 18.4241 },
    description: "희망봉의 도시",
    landmark: "테이블 마운틴",
  },

  // 남미
  {
    id: "rio",
    name: "Rio de Janeiro",
    nameKo: "리우데자네이루",
    country: "Brazil",
    countryFlag: "🇧🇷",
    coordinates: { lat: -22.9068, lng: -43.1729 },
    description: "놀라운 도시",
    landmark: "예수상",
  },
  {
    id: "buenosaires",
    name: "Buenos Aires",
    nameKo: "부에노스아이레스",
    country: "Argentina",
    countryFlag: "🇦🇷",
    coordinates: { lat: -34.6037, lng: -58.3816 },
    description: "남미의 파리",
    landmark: "오벨리스코",
  },
];

// ID로 항구 찾기
export function getPortById(id: string): Port | undefined {
  return PORTS.find((port) => port.id === id);
}

// 시작 항구 (부산)
export const DEFAULT_PORT = PORTS[0];

// 해금된 항구 목록 가져오기
export function getUnlockedPorts(unlockedIds: string[]): Port[] {
  return PORTS.filter((port) => unlockedIds.includes(port.id));
}

// 잠긴 항구 목록 가져오기
export function getLockedPorts(unlockedIds: string[]): Port[] {
  return PORTS.filter((port) => !unlockedIds.includes(port.id));
}
