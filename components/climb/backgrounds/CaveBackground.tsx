"use client";

import React, { useMemo } from "react";

interface CaveBackgroundProps {
  progress: number;
}

export function CaveBackground({ progress }: CaveBackgroundProps) {
  const offset = progress * 2;

  const stalactites = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      x: i * 15 + 3,
      height: 30 + (i % 4) * 20,
    }));
  }, []);

  const crystals = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      x: i * 25 + 10,
      y: 60 + (i % 3) * 10,
      color: ["#9370DB", "#00CED1", "#FF69B4", "#7B68EE"][i % 4],
      size: 15 + (i % 3) * 8,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 픽셀 동굴 배경 - 단색 */}
      <div className="absolute inset-0" style={{ background: "#15152a" }} />

      {/* Stalactites on ceiling */}
      <div
        className="absolute top-0 left-0 w-[300%]"
        style={{
          transform: `translateX(-${offset * 0.5}%)`,
          transition: "transform 150ms ease-out",
        }}
      >
        {stalactites.map((stal, i) => (
          <div
            key={i}
            className="absolute top-0"
            style={{ left: `${stal.x}%` }}
          >
            <svg width="20" height={stal.height} viewBox="0 0 20 60">
              <path
                d={`M10 0 L5 ${stal.height * 0.3} L8 ${stal.height * 0.5} L6 ${stal.height * 0.7} L10 ${stal.height} L14 ${stal.height * 0.7} L12 ${stal.height * 0.5} L15 ${stal.height * 0.3} Z`}
                fill="#3a3a4a"
              />
              <path
                d={`M10 0 L7 ${stal.height * 0.3} L10 ${stal.height * 0.6} L13 ${stal.height * 0.3} Z`}
                fill="#4a4a5a"
                opacity="0.5"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Cave walls */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#2a2a3a] to-transparent">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path d="M0 0 Q16 50 8 100 Q20 150 12 200 Q18 250 10 300 L0 300 Z" fill="#3a3a4a" />
        </svg>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#2a2a3a] to-transparent">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path d="M16 0 Q0 50 8 100 Q-4 150 4 200 Q-2 250 6 300 L16 300 Z" fill="#3a3a4a" />
        </svg>
      </div>

      {/* Glowing crystals */}
      <div
        className="absolute bottom-0 left-0 w-[400%]"
        style={{
          transform: `translateX(-${offset}%)`,
          transition: "transform 150ms ease-out",
        }}
      >
        {crystals.map((crystal, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${crystal.x}%`,
              bottom: `${100 - crystal.y}%`,
            }}
          >
            {/* 픽셀 크리스탈 그림자 - blur 제거 */}
            <div
              className="absolute left-1/2 -bottom-1"
              style={{
                width: crystal.size,
                height: 4,
                background: crystal.color,
                opacity: 0.2,
                transform: "translateX(-50%)",
              }}
            />
            <div className="relative">
              <svg width={crystal.size} height={crystal.size * 1.5} viewBox="0 0 20 30">
                {/* 픽셀 크리스탈 - 그라데이션 제거 */}
                <path d="M10 0 L2 20 L10 30 L18 20 Z" fill={crystal.color} />
                <path d="M10 0 L6 15 L10 25 L14 15 Z" fill="white" opacity="0.3" />
              </svg>
              {/* 픽셀 크리스탈 빛 - blur 제거 */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: crystal.color,
                  opacity: 0.2,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 픽셀 동굴 지면 - 타일 패턴 */}
      <div className="absolute bottom-0 left-0 right-0 h-20">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="caveTile" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="4" fill="#2a2a3a" />
              <rect y="4" width="8" height="4" fill="#1a1a2a" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#caveTile)" />
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

      {/* Bats (occasional) */}
      {progress > 30 && progress < 70 && (
        <div
          className="absolute"
          style={{
            top: "20%",
            left: `${70 - offset * 0.5}%`,
            animation: "batFly 1s ease-in-out infinite",
          }}
        >
          <svg width="24" height="12" viewBox="0 0 24 12">
            <path d="M12 6 L0 0 L4 6 L0 12 L12 6 L24 0 L20 6 L24 12 Z" fill="#1a1a2a" />
          </svg>
        </div>
      )}

      {/* 픽셀 안개 - 단순화 */}
      <div className="absolute bottom-16 left-0 right-0 h-8" style={{ background: "rgba(100, 50, 150, 0.1)" }} />
    </div>
  );
}
