"use client";

import React, { useMemo } from "react";

interface SnowBackgroundProps {
  progress: number;
}

export function SnowBackground({ progress }: SnowBackgroundProps) {
  const offset = progress * 2;

  const snowTrees = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      x: i * 18 + 5,
      height: 50 + (i % 3) * 15,
    }));
  }, []);

  const snowflakes = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      x: (i * 7 + 3) % 100,
      delay: i * 0.2,
      size: 2 + (i % 3),
      duration: 3 + (i % 2),
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 픽셀 겨울 하늘 - 단색 */}
      <div className="absolute inset-0" style={{ background: "#c8d8f0" }} />

      {/* 픽셀 태양 - blur 제거 */}
      <div className="absolute top-10 left-20">
        <div className="w-10 h-10 bg-[#FFFACD]" />
        <div className="absolute inset-1 bg-[#FFFFFF]" />
      </div>

      {/* 픽셀 눈송이 - 사각형으로 */}
      <div className="absolute inset-0 pointer-events-none">
        {snowflakes.map((flake, i) => (
          <div
            key={i}
            className="absolute bg-white"
            style={{
              left: `${flake.x}%`,
              top: `${(i * 7) % 100}%`,
              width: flake.size,
              height: flake.size,
            }}
          />
        ))}
      </div>

      {/* Far snowy mountains */}
      <svg
        className="absolute bottom-0 left-0 w-[300%] h-48"
        style={{
          transform: `translateX(-${offset * 0.3}%)`,
          transition: "transform 150ms ease-out",
        }}
        viewBox="0 0 900 150"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="snowMountain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8f8ff" />
            <stop offset="30%" stopColor="#e8e8f0" />
            <stop offset="100%" stopColor="#c8d0e0" />
          </linearGradient>
        </defs>
        <path
          d="M0 150 L50 60 L100 90 L180 40 L260 70 L340 30 L420 65 L500 35 L580 80 L660 45 L740 70 L820 50 L900 85 L900 150 Z"
          fill="url(#snowMountain)"
        />
        {/* Snow caps */}
        <path d="M180 40 L170 55 L190 55 Z" fill="white" />
        <path d="M340 30 L330 50 L350 50 Z" fill="white" />
        <path d="M500 35 L490 55 L510 55 Z" fill="white" />
      </svg>

      {/* Snow-covered trees */}
      <div
        className="absolute bottom-16 left-0 w-[400%]"
        style={{
          transform: `translateX(-${offset}%)`,
          transition: "transform 150ms ease-out",
        }}
      >
        {snowTrees.map((tree, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: `${tree.x}%`, bottom: -1 }}
          >
            {/* 픽셀 눈나무 그림자 - blur 제거 */}
            <div
              className="absolute bottom-0 left-1/2"
              style={{
                width: 18,
                height: 4,
                background: "rgba(100, 120, 140, 0.25)",
                transform: "translateX(-50%)",
              }}
            />
            <svg width="40" height={tree.height} viewBox="0 0 40 60">
              {/* Tree trunk */}
              <rect x="17" y="45" width="6" height="15" fill="#5a4030" />
              {/* Snow-covered foliage */}
              <path d="M20 0 L5 25 L12 25 L2 45 L38 45 L28 25 L35 25 Z" fill="#2d5a3d" />
              {/* Snow on tree */}
              <path d="M20 0 L10 15 L30 15 Z" fill="#f8f8ff" />
              <path d="M8 25 L5 25 L12 25 L10 20 Z" fill="#f8f8ff" />
              <path d="M32 25 L35 25 L28 25 L30 20 Z" fill="#f8f8ff" />
              <path d="M2 45 L38 45 L35 42 L5 42 Z" fill="#e8e8f0" />
            </svg>
          </div>
        ))}
      </div>

      {/* 픽셀 눈 지면 - 타일 패턴 */}
      <div className="absolute bottom-0 left-0 right-0 h-20">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="snowTile" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="4" fill="#f0f4f8" />
              <rect y="4" width="8" height="4" fill="#e0e8f0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#snowTile)" />
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

      {/* 픽셀 얼음 패치 - 사각형 */}
      <div
        className="absolute bottom-4 left-0 w-[300%]"
        style={{
          transform: `translateX(-${offset * 1.2}%)`,
          transition: "transform 150ms ease-out",
        }}
      >
        {[20, 45, 70, 95].map((x, i) => (
          <div
            key={i}
            className="absolute bottom-0"
            style={{ left: `${x}%` }}
          >
            <div className="w-12 h-2" style={{ background: "rgba(0, 200, 255, 0.3)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
