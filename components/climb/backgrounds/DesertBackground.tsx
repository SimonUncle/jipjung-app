"use client";

import React, { useMemo } from "react";

interface DesertBackgroundProps {
  progress: number;
}

export function DesertBackground({ progress }: DesertBackgroundProps) {
  const offset = progress * 2;

  const cacti = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      x: i * 20 + 5,
      height: 40 + (i % 3) * 15,
      variant: i % 2,
    }));
  }, []);

  const dunes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      x: i * 30,
      height: 30 + (i % 3) * 20,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 픽셀 사막 하늘 - 단색 */}
      <div className="absolute inset-0" style={{ background: "#ffa07a" }} />

      {/* 픽셀 태양 - blur 제거 */}
      <div className="absolute top-6 right-20">
        <div className="w-16 h-16 bg-[#FFD700]" />
        <div className="absolute inset-2 bg-[#FFF8B8]" />
      </div>

      {/* Far dunes */}
      <svg
        className="absolute bottom-0 left-0 w-[300%] h-40"
        style={{
          transform: `translateX(-${offset * 0.3}%)`,
          transition: "transform 150ms ease-out",
        }}
        viewBox="0 0 900 120"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 120 Q75 60 150 100 Q225 50 300 90 Q375 40 450 85 Q525 45 600 95 Q675 55 750 100 Q825 60 900 90 L900 120 Z"
          fill="#d4a76a"
          opacity="0.6"
        />
      </svg>

      {/* Mid dunes with sand ripples */}
      <div
        className="absolute bottom-16 left-0 w-[400%] h-32"
        style={{
          transform: `translateX(-${offset * 0.8}%)`,
          transition: "transform 150ms ease-out",
        }}
      >
        {dunes.map((dune, i) => (
          <div
            key={i}
            className="absolute bottom-0"
            style={{ left: `${dune.x}%` }}
          >
            <svg width="120" height={dune.height + 20} viewBox="0 0 120 60">
              {/* Dune shape */}
              <path
                d="M0 60 Q30 20 60 40 Q90 10 120 60 Z"
                fill="#d4a76a"
              />
              <path
                d="M0 60 Q30 30 60 45 Q90 25 120 60 Z"
                fill="#c4966a"
              />
              {/* Sand ripples */}
              <path d="M20 50 Q40 48 60 50 Q80 48 100 50" stroke="#b4865a" strokeWidth="1" fill="none" opacity="0.5" />
              <path d="M25 55 Q45 53 65 55 Q85 53 105 55" stroke="#b4865a" strokeWidth="1" fill="none" opacity="0.3" />
            </svg>
          </div>
        ))}
      </div>

      {/* 픽셀 지면 - 타일 패턴 */}
      <div className="absolute bottom-0 left-0 right-0 h-20">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="sandTile" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="4" fill="#e4b87a" />
              <rect y="4" width="8" height="4" fill="#c4966a" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sandTile)" />
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

      {/* Cacti */}
      <div
        className="absolute bottom-16 left-0 w-[500%]"
        style={{
          transform: `translateX(-${offset * 1.5}%)`,
          transition: "transform 150ms ease-out",
        }}
      >
        {cacti.map((cactus, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: `${cactus.x}%`, bottom: -1 }}
          >
            {/* 픽셀 선인장 그림자 - blur 제거 */}
            <div
              className="absolute bottom-0 left-1/2"
              style={{
                width: 16,
                height: 4,
                background: "rgba(100, 60, 20, 0.3)",
                transform: "translateX(-50%)",
              }}
            />
            <svg width="30" height={cactus.height} viewBox="0 0 30 50">
              {cactus.variant === 0 ? (
                // 픽셀 Saguaro - rx 제거, path를 rect로
                <>
                  <rect x="12" y="10" width="6" height="40" fill="#2d5a2d" />
                  <rect x="5" y="25" width="7" height="15" fill="#2d5a2d" />
                  <rect x="5" y="38" width="7" height="4" fill="#2d5a2d" />
                  <rect x="18" y="20" width="7" height="15" fill="#2d5a2d" />
                  <rect x="14" y="12" width="2" height="4" fill="#4a7a4a" />
                </>
              ) : (
                // 픽셀 둥근 선인장 - 사각형으로
                <>
                  <rect x="6" y="34" width="18" height="14" fill="#2d5a2d" />
                  <rect x="8" y="22" width="14" height="18" fill="#3d6a3d" />
                  <rect x="12" y="18" width="6" height="6" fill="#ff69b4" />
                </>
              )}
            </svg>
          </div>
        ))}
      </div>

      {/* 픽셀 열기 효과 - 단순화 */}
      <div
        className="absolute bottom-20 left-0 right-0 h-4 opacity-10"
        style={{ background: "#ffffff" }}
      />
    </div>
  );
}
