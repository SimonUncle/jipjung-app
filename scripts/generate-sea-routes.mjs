#!/usr/bin/env node
// 해상 경로 사전 계산 스크립트
// 빌드 시 실행하여 모든 항구 간 경로를 JSON으로 저장

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 항구 데이터 (lib/ports.ts와 동기화 필요)
const PORTS = [
  { id: "busan", coordinates: { lat: 35.1796, lng: 129.0756 } },
  { id: "osaka", coordinates: { lat: 34.6937, lng: 135.5023 } },
  { id: "tokyo", coordinates: { lat: 35.6762, lng: 139.6503 } },
  { id: "shanghai", coordinates: { lat: 31.2304, lng: 121.4737 } },
  { id: "hongkong", coordinates: { lat: 22.3193, lng: 114.1694 } },
  { id: "singapore", coordinates: { lat: 1.3521, lng: 103.8198 } },
  { id: "bangkok", coordinates: { lat: 13.7563, lng: 100.5018 } },
  { id: "sydney", coordinates: { lat: -33.8688, lng: 151.2093 } },
  { id: "auckland", coordinates: { lat: -36.8485, lng: 174.7633 } },
  { id: "honolulu", coordinates: { lat: 21.3069, lng: -157.8583 } },
  { id: "sanfrancisco", coordinates: { lat: 37.7749, lng: -122.4194 } },
  { id: "losangeles", coordinates: { lat: 33.9425, lng: -118.4081 } },
  { id: "vancouver", coordinates: { lat: 49.2827, lng: -123.1207 } },
  { id: "newyork", coordinates: { lat: 40.7128, lng: -74.006 } },
  { id: "miami", coordinates: { lat: 25.7617, lng: -80.1918 } },
  { id: "lisbon", coordinates: { lat: 38.7223, lng: -9.1393 } },
  { id: "barcelona", coordinates: { lat: 41.3851, lng: 2.1734 } },
  { id: "marseille", coordinates: { lat: 43.2965, lng: 5.3698 } },
  { id: "venice", coordinates: { lat: 45.4408, lng: 12.3155 } },
  { id: "athens", coordinates: { lat: 37.9838, lng: 23.7275 } },
  { id: "istanbul", coordinates: { lat: 41.0082, lng: 28.9784 } },
  { id: "amsterdam", coordinates: { lat: 52.3676, lng: 4.9041 } },
  { id: "london", coordinates: { lat: 51.5074, lng: -0.1278 } },
  { id: "copenhagen", coordinates: { lat: 55.6761, lng: 12.5683 } },
  { id: "dubai", coordinates: { lat: 25.2048, lng: 55.2708 } },
  { id: "capetown", coordinates: { lat: -33.9249, lng: 18.4241 } },
  { id: "rio", coordinates: { lat: -22.9068, lng: -43.1729 } },
  { id: "buenosaires", coordinates: { lat: -34.6037, lng: -58.3816 } },
];

async function main() {
  // searoute-js 동적 임포트 (CommonJS 모듈)
  const { default: searoute } = await import('searoute-js');

  const routes = {};
  let successCount = 0;
  let failCount = 0;

  console.log(`Generating sea routes for ${PORTS.length} ports...`);

  for (const from of PORTS) {
    for (const to of PORTS) {
      if (from.id === to.id) continue;

      const key = `${from.id}->${to.id}`;

      const origin = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [from.coordinates.lng, from.coordinates.lat]
        }
      };

      const dest = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [to.coordinates.lng, to.coordinates.lat]
        }
      };

      try {
        const route = searoute(origin, dest);
        if (route?.geometry?.coordinates) {
          // GeoJSON [lng, lat] -> { lat, lng } 변환
          routes[key] = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
          successCount++;
        } else {
          console.warn(`No route: ${key}`);
          failCount++;
        }
      } catch (e) {
        console.warn(`Failed: ${key} - ${e.message}`);
        failCount++;
      }
    }

    // 진행 상황 출력
    process.stdout.write(`\rProcessed: ${from.id} (${successCount} success, ${failCount} failed)`);
  }

  console.log('\n');

  // public/data 폴더 생성
  const dataDir = path.join(__dirname, '../public/data');
  fs.mkdirSync(dataDir, { recursive: true });

  // JSON 파일로 저장
  const outputPath = path.join(dataDir, 'sea-routes.json');
  fs.writeFileSync(outputPath, JSON.stringify(routes, null, 0));

  const stats = fs.statSync(outputPath);
  console.log(`Done! Generated ${successCount} routes (${failCount} failed)`);
  console.log(`Output: ${outputPath} (${(stats.size / 1024).toFixed(1)}KB)`);
}

main().catch(console.error);
