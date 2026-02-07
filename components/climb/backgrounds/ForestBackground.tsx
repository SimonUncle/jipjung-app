"use client";

import React, { useMemo } from "react";

interface ForestBackgroundProps {
  progress: number; // 0-100 within segment
}

// Temple appearing in the distance as player approaches
function TempleInDistance({ progress }: { progress: number }) {
  const visibilityProgress = Math.min(100, (progress - 40) * (100 / 60));
  const scale = 0.3 + (visibilityProgress / 100) * 0.9;
  const translateX = 100 - visibilityProgress * 0.7;
  const opacity = Math.min(1, visibilityProgress / 50);

  // 안개/먼지 파티클 (아주 약하게)
  const dustParticles = Array.from({ length: 5 }, (_, i) => ({
    x: 85 + i * 8,
    delay: i * 0.5,
  }));

  return (
    <div
      className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none"
      style={{
        transform: `translateX(${translateX}%)`,
        transition: "transform 300ms ease-out",
      }}
    >
      <div
        className="relative"
        style={{
          transform: `scale(${scale})`,
          opacity,
          transition: "transform 300ms ease-out, opacity 300ms ease-out",
        }}
      >
        {/* 신전 접지 그림자 - 더 진하고 넓게 */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: 160,
            height: 12,
            background: "rgba(0, 0, 0, 0.5)",
            transform: "translateX(-50%) translateY(8px)",
          }}
        />

        <svg width="200" height="270" viewBox="0 0 200 270">
          {/* 픽셀 신전 - 그라데이션 제거, 단색 블록 */}

          {/* 앞 바닥 돌/계단 - rx 제거하여 각진 형태 */}
          <rect x="40" y="254" width="120" height="8" fill="#4a4a3a" />
          <rect x="60" y="250" width="80" height="8" fill="#5a5a4a" />
          <rect x="70" y="248" width="60" height="4" fill="#6a6a5a" />

          {/* 작은 돌들 - 사각형으로 */}
          <rect x="38" y="253" width="12" height="6" fill="#5a5a4a" />
          <rect x="150" y="255" width="10" height="5" fill="#5a5a4a" />
          <rect x="30" y="258" width="8" height="4" fill="#4a4a3a" />
          <rect x="162" y="260" width="6" height="4" fill="#4a4a3a" />

          {/* Temple base/platform - 더 어두운 색상 */}
          <rect x="20" y="215" width="160" height="40" fill="#3a3025" />
          <rect x="30" y="205" width="140" height="15" fill="#4a4035" />
          <rect x="40" y="195" width="120" height="15" fill="#5a5045" />

          {/* Stairs leading up */}
          <rect x="70" y="210" width="60" height="45" fill="#4a4035" />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={75 + i * 2}
              y={215 + i * 10}
              width={50 - i * 4}
              height="8"
              fill="#5a5045"
            />
          ))}

          {/* Main temple structure - 단색 */}
          <rect x="40" y="95" width="120" height="100" fill="#3a2a1a" />

          {/* Temple roof - triangular */}
          <polygon points="100,25 15,95 185,95" fill="#2a1a0a" />
          <polygon points="100,35 30,90 170,90" fill="#3a2a1a" />

          {/* Roof decorations - 사각형으로 */}
          <rect x="95" y="18" width="10" height="20" fill="#6a5535" />
          <rect x="93" y="10" width="14" height="14" fill="#d4850b" />

          {/* Columns - 더 어둡게 */}
          {[55, 85, 115, 145].map((x, i) => (
            <g key={i}>
              <rect x={x - 5} y="95" width="10" height="100" fill="#4a4035" />
              <rect x={x - 6} y="93" width="12" height="8" fill="#5a5045" />
              <rect x={x - 6} y="190" width="12" height="8" fill="#5a5045" />
            </g>
          ))}

          {/* Large entrance door - 단색 */}
          <rect x="75" y="125" width="50" height="70" fill="#1a0a00" />
          <rect x="78" y="128" width="44" height="64" fill="#0a0500" />
          <rect x="82" y="135" width="36" height="52" fill="#050200" />

          {/* Door frame decoration */}
          <rect x="73" y="120" width="54" height="8" fill="#6a5535" />

          {/* Rune symbols on sides */}
          <text x="48" y="155" fill="#d4850b" fontSize="14" opacity="0.6">ᚠ</text>
          <text x="48" y="178" fill="#d4850b" fontSize="14" opacity="0.6">ᚢ</text>
          <text x="143" y="155" fill="#d4850b" fontSize="14" opacity="0.6">ᚦ</text>
          <text x="143" y="178" fill="#d4850b" fontSize="14" opacity="0.6">ᚨ</text>

          {/* 픽셀 횃불 빛 - 사각형으로 */}
          <rect x="58" y="135" width="12" height="20" fill="#f59e0b" opacity="0.4" />
          <rect x="61" y="140" width="6" height="10" fill="#fbbf24" opacity="0.6" />
          <rect x="128" y="135" width="12" height="20" fill="#f59e0b" opacity="0.4" />
          <rect x="131" y="140" width="6" height="10" fill="#fbbf24" opacity="0.6" />

          {/* Windows - 더 어둡게 */}
          <rect x="50" y="110" width="12" height="18" fill="#0a0500" opacity="0.9" />
          <rect x="138" y="110" width="12" height="18" fill="#0a0500" opacity="0.9" />
        </svg>

        {/* 픽셀 먼지 - 사각형, 애니메이션 단순화 */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-16 h-12 pointer-events-none">
          {dustParticles.map((p, i) => (
            <div
              key={i}
              className="absolute bg-amber-100/30"
              style={{
                width: 2,
                height: 2,
                left: `${(p.x - 85) / 40 * 100}%`,
                top: `${(i * 20) % 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ForestBackground({ progress }: ForestBackgroundProps) {
  const offset = progress * 2;

  const trees = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      x: i * 12,
      height: 60 + (i % 3) * 20,
      variant: i % 3,
    }));
  }, []);

  const bushes = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      x: i * 18 + 5,
      size: 20 + (i % 2) * 10,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 픽셀 하늘 - 단색 */}
      <div className="absolute inset-0" style={{ background: "#87CEEB" }} />

      {/* 픽셀 태양 - blur 제거 */}
      <div className="absolute top-8 right-16">
        <div className="w-12 h-12 bg-[#FFE135]" />
        <div className="absolute inset-1 bg-[#FFF8B8]" />
      </div>

      {/* Far mountains */}
      <svg
        className="absolute bottom-0 left-0 w-[300%] h-48"
        style={{
          transform: `translateX(-${offset * 0.3}%)`,
          transition: "transform 150ms ease-out",
        }}
        viewBox="0 0 900 150"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 150 L50 80 L100 100 L180 50 L260 90 L340 60 L420 85 L500 45 L580 95 L660 55 L740 80 L820 65 L900 100 L900 150 Z"
          fill="#3d7a5d"
          opacity="0.35"
        />
      </svg>

      {/* Mid trees (background) */}
      <div
        className="absolute bottom-20 left-0 w-[400%] h-40"
        style={{
          transform: `translateX(-${offset * 0.8}%)`,
          transition: "transform 150ms ease-out",
        }}
      >
        {trees.map((tree, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: `${tree.x}%`, bottom: -1 }}
          >
            {/* 픽셀 나무 그림자 - blur 제거 */}
            <div
              className="absolute bottom-0 left-1/2"
              style={{
                width: 20,
                height: 4,
                background: "rgba(0, 60, 0, 0.3)",
                transform: "translateX(-50%)",
              }}
            />
            <svg width="40" height={tree.height} viewBox="0 0 40 80">
              {/* Tree trunk */}
              <rect x="16" y="50" width="8" height="30" fill="#5a4030" />
              {/* Tree foliage */}
              <path
                d={
                  tree.variant === 0
                    ? "M20 0 L5 35 L12 35 L0 55 L40 55 L28 35 L35 35 Z"
                    : tree.variant === 1
                    ? "M20 5 L8 30 L15 30 L5 50 L35 50 L25 30 L32 30 Z"
                    : "M20 0 L3 40 L15 40 L5 55 L35 55 L25 40 L37 40 Z"
                }
                fill="#228B22"
              />
              <path
                d={
                  tree.variant === 0
                    ? "M20 0 L12 20 L28 20 Z"
                    : "M20 5 L12 22 L28 22 Z"
                }
                fill="#2E8B2E"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* 픽셀 지면 - 타일 패턴 */}
      <div className="absolute bottom-0 left-0 right-0 h-24">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="grassTile" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="4" fill="#22c55e" />
              <rect y="4" width="8" height="4" fill="#16a34a" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grassTile)" />
        </svg>

        {/* 접지선 - 깊이감 경계선 */}
        <div
          className="absolute top-0 left-0 right-0 z-10"
          style={{
            height: 3,
            background: "rgba(0, 0, 0, 0.25)",
          }}
        />
        <div
          className="absolute left-0 right-0 z-10"
          style={{
            top: 3,
            height: 1,
            background: "rgba(255, 255, 255, 0.08)",
          }}
        />
      </div>

      {/* Foreground bushes */}
      <div
        className="absolute bottom-20 left-0 w-[500%]"
        style={{
          transform: `translateX(-${offset * 1.5}%)`,
          transition: "transform 150ms ease-out",
        }}
      >
        {bushes.map((bush, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: `${bush.x}%`, bottom: -1 }}
          >
            {/* 픽셀 관목 그림자 - blur 제거 */}
            <div
              className="absolute bottom-0 left-1/2"
              style={{
                width: bush.size * 0.6,
                height: 3,
                background: "rgba(0, 60, 0, 0.3)",
                transform: "translateX(-50%)",
              }}
            />
            <svg width={bush.size} height={bush.size * 0.6} viewBox="0 0 30 18">
              <ellipse cx="15" cy="12" rx="14" ry="8" fill="#228B22" />
              <ellipse cx="10" cy="10" rx="8" ry="6" fill="#2E8B2E" />
              <ellipse cx="20" cy="10" rx="8" ry="6" fill="#1E7B1E" />
              {/* Flowers */}
              {i % 3 === 0 && (
                <>
                  <circle cx="8" cy="6" r="2" fill="#FF69B4" />
                  <circle cx="22" cy="7" r="2" fill="#FFD700" />
                </>
              )}
            </svg>
          </div>
        ))}
      </div>

      {/* Temple appearing in distance (visible from 40% progress) */}
      {progress > 40 && (
        <TempleInDistance progress={progress} />
      )}
    </div>
  );
}
