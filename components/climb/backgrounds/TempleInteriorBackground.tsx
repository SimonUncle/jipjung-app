"use client";

import React, { useMemo } from "react";

interface TempleInteriorBackgroundProps {
  progress: number; // 0-100 within segment (cameraX based)
}

export function TempleInteriorBackground({ progress }: TempleInteriorBackgroundProps) {
  // 횡스크롤 패럴랙스 오프셋
  const farLayerOffset = progress * 0.3;    // 먼 배경 (벽)
  const midLayerOffset = progress * 0.8;    // 중간 (룬, 조각)
  const nearLayerOffset = progress * 1.5;   // 가까운 (기둥, 횃불)

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 신전 내부 배경 - 어두운 석조 느낌 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a08] via-[#15120d] to-[#0d0a08]" />

      {/* === 먼 레이어 (뒤쪽 벽) - 느리게 스크롤 === */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateX(-${farLayerOffset}%)`,
          transition: "transform 150ms ease-out",
        }}
      >
        {/* 벽 타일 패턴 - 넓은 영역으로 반복 */}
        <svg
          className="absolute inset-0 w-[300%] h-full opacity-20"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          {/* 벽돌 패턴 */}
          {Array.from({ length: 40 }, (_, row) => (
            Array.from({ length: 30 }, (_, col) => (
              <rect
                key={`${row}-${col}`}
                x={col * 40 + (row % 2 === 0 ? 0 : 20)}
                y={row * 20}
                width="38"
                height="18"
                fill="none"
                stroke="#2a2520"
                strokeWidth="1"
              />
            ))
          ))}
        </svg>
      </div>

      {/* === 중간 레이어 (벽 조각, 룬) === */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateX(-${midLayerOffset}%)`,
          transition: "transform 150ms ease-out",
        }}
      >
        <WallCarvingsHorizontal />
        <RuneSymbolsHorizontal />
      </div>

      {/* === 가까운 레이어 (기둥) - 빠르게 스크롤 === */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateX(-${nearLayerOffset}%)`,
          transition: "transform 150ms ease-out",
        }}
      >
        <PillarsLayer />
        <TorchLayerHorizontal />
      </div>

      {/* 천장 아치 (고정) */}
      <div className="absolute top-0 left-0 right-0 h-32">
        <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ceilingGradH" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#0a0805" />
              <stop offset="100%" stopColor="#1a1510" />
            </linearGradient>
          </defs>
          <path
            d="M0 120 L0 60 Q100 20 200 15 Q300 20 400 60 L400 120 Z"
            fill="url(#ceilingGradH)"
          />
          {/* 천장 아치 라인 */}
          <path d="M50 90 Q200 40 350 90" stroke="#2a2520" strokeWidth="3" fill="none" />
          <path d="M80 100 Q200 55 320 100" stroke="#2a2520" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* 바닥 - 캐릭터가 서있는 돌바닥 */}
      <div className="absolute bottom-0 left-0 right-0 h-24">
        <div className="absolute inset-0 bg-gradient-to-b from-[#353025] to-[#252015]" />

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

        {/* 바닥 타일 패턴 */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 100" preserveAspectRatio="none">
          <line x1="0" y1="10" x2="400" y2="10" stroke="#1a1510" strokeWidth="2" />
          <line x1="0" y1="35" x2="400" y2="35" stroke="#1a1510" strokeWidth="1" />
          <line x1="0" y1="65" x2="400" y2="65" stroke="#1a1510" strokeWidth="0.5" />

          {/* 세로 줄 */}
          {Array.from({ length: 10 }, (_, i) => (
            <line
              key={i}
              x1={i * 45}
              y1="0"
              x2={i * 45}
              y2="100"
              stroke="#1a1510"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      {/* 먼지 파티클 */}
      <FloatingDust />

      {/* === 깊이감 조명 효과 === */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 상단 어두움 */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
        {/* 하단 어두움 */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/40 to-transparent" />
        {/* 사이드 비네트 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]" />
      </div>
    </div>
  );
}

// 횡스크롤용 기둥 레이어
function PillarsLayer() {
  const pillars = [
    { x: 10 },
    { x: 35 },
    { x: 60 },
    { x: 85 },
    { x: 110 },
    { x: 135 },
    { x: 160 },
    { x: 185 },
  ];

  return (
    <>
      {pillars.map((pillar, i) => (
        <div
          key={i}
          className="absolute top-20 bottom-24"
          style={{
            left: `${pillar.x}%`,
            width: 32,
          }}
        >
          {/* 기둥 본체 */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3a3530] via-[#4a4540] to-[#2a2520]" />
          {/* 기둥 세로 홈 */}
          <div className="absolute left-1 top-0 bottom-0 w-1 bg-[#252015]" />
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[#4a4540]/50" />
          <div className="absolute right-1 top-0 bottom-0 w-1 bg-[#1a1510]" />
          {/* 기둥 상단 장식 */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-4 bg-[#3a3530]" />
          {/* 기둥 하단 장식 */}
          <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-10 h-3 bg-[#3a3530]" />
        </div>
      ))}
    </>
  );
}

// 횡스크롤용 횃불 레이어
function TorchLayerHorizontal() {
  const torches = [
    { x: 22, y: 30 },
    { x: 47, y: 30 },
    { x: 72, y: 30 },
    { x: 97, y: 30 },
    { x: 122, y: 30 },
    { x: 147, y: 30 },
  ];

  return (
    <>
      {torches.map((torch, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${torch.x}%`,
            top: `${torch.y}%`,
          }}
        >
          <TorchSmall flickerDelay={i * 0.15} />
        </div>
      ))}
    </>
  );
}

// 작은 횃불 컴포넌트
function TorchSmall({ flickerDelay }: { flickerDelay: number }) {
  return (
    <div className="relative">
      <svg width="20" height="32" viewBox="0 0 20 32">
        <rect x="7" y="12" width="6" height="20" fill="#4a3020" rx="1" />
        <rect x="8" y="14" width="2" height="16" fill="#3a2010" />
      </svg>

      <div
        className="absolute -top-1 left-2"
        style={{
          animation: `flickerH 0.2s ease-in-out infinite alternate`,
          animationDelay: `${flickerDelay}s`,
        }}
      >
        <svg width="16" height="20" viewBox="0 0 16 20">
          <defs>
            <linearGradient id="flameGradH" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#ff4500" />
              <stop offset="50%" stopColor="#ff8c00" />
              <stop offset="100%" stopColor="#ffd700" />
            </linearGradient>
          </defs>
          <path d="M8 20 Q2 15 2 10 Q2 5 8 0 Q14 5 14 10 Q14 15 8 20 Z" fill="url(#flameGradH)" />
          <path d="M8 20 Q4 16 4 12 Q4 8 8 4 Q12 8 12 12 Q12 16 8 20 Z" fill="#ffff00" opacity="0.5" />
        </svg>
      </div>

      <div className="absolute -top-2 left-1 w-10 h-10 bg-orange-500/30 rounded-full blur-xl" />
      <div className="absolute top-0 left-3 w-5 h-5 bg-yellow-400/40 rounded-full blur-md" />

      <style jsx>{`
        @keyframes flickerH {
          0% { transform: scaleY(1) scaleX(1); }
          100% { transform: scaleY(1.1) scaleX(0.9); }
        }
      `}</style>
    </div>
  );
}

// 횡스크롤용 벽 조각
function WallCarvingsHorizontal() {
  const carvings = [
    { x: 20, y: 45 },
    { x: 50, y: 40 },
    { x: 80, y: 45 },
    { x: 110, y: 40 },
    { x: 140, y: 45 },
  ];

  return (
    <>
      {carvings.map((carving, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${carving.x}%`,
            top: `${carving.y}%`,
          }}
        >
          <svg width="40" height="56" viewBox="0 0 40 56">
            <rect x="2" y="2" width="36" height="52" fill="#201a15" stroke="#2a2520" strokeWidth="2" />
            <rect x="6" y="6" width="28" height="44" fill="#151210" />
            <ellipse cx="20" cy="20" rx="8" ry="5" fill="none" stroke="#3a3530" strokeWidth="2" />
            <circle cx="20" cy="20" r="2" fill="#3a3530" />
            <path d="M20 32 L12 44 L28 44 Z" fill="none" stroke="#3a3530" strokeWidth="1.5" />
          </svg>
        </div>
      ))}
    </>
  );
}

// 횡스크롤용 룬 문자
function RuneSymbolsHorizontal() {
  const runes = [
    { symbol: "ᚠ", x: 15, y: 35 },
    { symbol: "ᚢ", x: 40, y: 55 },
    { symbol: "ᚦ", x: 65, y: 35 },
    { symbol: "ᚨ", x: 90, y: 55 },
    { symbol: "ᚱ", x: 115, y: 35 },
    { symbol: "ᚲ", x: 140, y: 55 },
  ];

  return (
    <>
      {runes.map((rune, i) => (
        <div
          key={i}
          className="absolute text-xl"
          style={{
            left: `${rune.x}%`,
            top: `${rune.y}%`,
            color: "#ffd700",
            textShadow: "0 0 10px #ffd700, 0 0 20px #ff8c00",
            animation: `runeGlowH 2.5s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        >
          {rune.symbol}
        </div>
      ))}
      <style jsx>{`
        @keyframes runeGlowH {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </>
  );
}

// 떠다니는 먼지 파티클
function FloatingDust() {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 100,
      y: 20 + Math.random() * 60,
      size: 1 + Math.random() * 2,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute bg-amber-200/20 rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animation: `floatDust ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes floatDust {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-15px) translateX(10px);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
