"use client";

import React, { useMemo } from "react";

interface TempleStairsBackgroundProps {
  progress: number; // 0-100 within segment
}

export function TempleStairsBackground({ progress }: TempleStairsBackgroundProps) {
  // 카메라 상승 효과 - progress가 높을수록 위로 올라간 느낌
  // 배경은 아래로 스크롤됨

  // 패럴랙스 속도 (멀리 있는 것은 느리게, 가까운 것은 빠르게)
  const farLayerOffset = progress * 0.5;    // 먼 배경 (천장/아치)
  const midLayerOffset = progress * 1.5;    // 중간 (벽 조각, 룬)
  const nearLayerOffset = progress * 2.5;   // 가까운 (기둥, 횃불)

  // 깊이감 조명 - 위로 갈수록 밝아짐
  const topBrightness = Math.min(0.3, progress / 100 * 0.3);
  const bottomDarkness = Math.min(0.5, progress / 100 * 0.5);

  // 출구 빛 - progress가 높을수록 밝아짐
  const exitLightOpacity = Math.max(0, (progress - 50) / 50);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 신전 내부 배경 - 어두운 석조 느낌 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a08] via-[#1a1510] to-[#0d0a08]" />

      {/* === 먼 레이어 (천장) - 느리게 스크롤 === */}
      <div
        className="absolute top-0 left-0 right-0 h-40"
        style={{
          transform: `translateY(${farLayerOffset}%)`,
          transition: "transform 150ms ease-out",
        }}
      >
        {/* 천장 아치 */}
        <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ceilingGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#0a0805" />
              <stop offset="100%" stopColor="#1a1510" />
            </linearGradient>
          </defs>
          <path
            d="M0 120 L0 80 Q50 30 100 50 Q150 10 200 5 Q250 10 300 50 Q350 30 400 80 L400 120 Z"
            fill="url(#ceilingGrad)"
          />
          {/* 천장 돔 중앙 */}
          <circle cx="200" cy="40" r="20" fill="#15120d" />
          <circle cx="200" cy="40" r="12" fill="#1a1510" />
          {/* 천장 문양 */}
          <path d="M150 65 Q175 45 200 65 Q225 45 250 65" stroke="#2a2520" strokeWidth="3" fill="none" />
        </svg>
      </div>

      {/* === 중간 레이어 (벽 조각, 룬) === */}
      {/* 왼쪽 벽 */}
      <div className="absolute left-0 top-0 bottom-0 w-28">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2a2520] via-[#353025] to-[#1a1510]" />

        {/* 벽 돌 패턴 */}
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
          {Array.from({ length: 20 }, (_, i) => (
            <g key={i}>
              <rect x="0" y={i * 30} width="80" height="28" stroke="#151210" strokeWidth="2" fill="none" />
              <rect x="40" y={i * 30 + 15} width="40" height="13" stroke="#151210" strokeWidth="1" fill="none" />
            </g>
          ))}
        </svg>

        {/* 기둥 (가까운 레이어처럼 빠르게 움직임) */}
        <div
          className="absolute right-0 top-0 w-10 h-full bg-gradient-to-r from-[#3a3530] to-[#2a2520]"
          style={{
            transform: `translateY(${nearLayerOffset * 0.3}%)`,
            transition: "transform 150ms ease-out",
          }}
        >
          <div className="absolute left-1 top-0 bottom-0 w-1 bg-[#4a4540]/40" />
          <div className="absolute left-3 top-0 bottom-0 w-1 bg-[#4a4540]/40" />
          <div className="absolute left-5 top-0 bottom-0 w-1 bg-[#4a4540]/40" />
        </div>

        {/* 벽 조각들 (중간 속도) */}
        <WallCarvings offset={midLayerOffset} side="left" />
      </div>

      {/* 오른쪽 벽 */}
      <div className="absolute right-0 top-0 bottom-0 w-28">
        <div className="absolute inset-0 bg-gradient-to-l from-[#2a2520] via-[#353025] to-[#1a1510]" />

        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
          {Array.from({ length: 20 }, (_, i) => (
            <g key={i}>
              <rect x="10" y={i * 30} width="80" height="28" stroke="#151210" strokeWidth="2" fill="none" />
              <rect x="10" y={i * 30 + 15} width="40" height="13" stroke="#151210" strokeWidth="1" fill="none" />
            </g>
          ))}
        </svg>

        {/* 기둥 */}
        <div
          className="absolute left-0 top-0 w-10 h-full bg-gradient-to-l from-[#3a3530] to-[#2a2520]"
          style={{
            transform: `translateY(${nearLayerOffset * 0.3}%)`,
            transition: "transform 150ms ease-out",
          }}
        >
          <div className="absolute right-1 top-0 bottom-0 w-1 bg-[#4a4540]/40" />
          <div className="absolute right-3 top-0 bottom-0 w-1 bg-[#4a4540]/40" />
          <div className="absolute right-5 top-0 bottom-0 w-1 bg-[#4a4540]/40" />
        </div>

        <WallCarvings offset={midLayerOffset} side="right" />
      </div>

      {/* === 가까운 레이어 (횃불) - 빠르게 스크롤 === */}
      <TorchLayer offset={nearLayerOffset} />

      {/* 룬 문자들 (중간 속도) */}
      <RuneSymbols offset={midLayerOffset} />

      {/* 바닥 - 캐릭터가 서있는 돌바닥 */}
      <div className="absolute bottom-0 left-0 right-0 h-28">
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

        {/* 바닥 타일 패턴 (원근감) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          <line x1="0" y1="8" x2="400" y2="8" stroke="#1a1510" strokeWidth="2" />
          <line x1="0" y1="25" x2="400" y2="25" stroke="#1a1510" strokeWidth="1.5" />
          <line x1="0" y1="50" x2="400" y2="50" stroke="#1a1510" strokeWidth="1" />
          <line x1="0" y1="78" x2="400" y2="78" stroke="#1a1510" strokeWidth="0.5" />

          <line x1="50" y1="0" x2="100" y2="100" stroke="#1a1510" strokeWidth="1" />
          <line x1="100" y1="0" x2="130" y2="100" stroke="#1a1510" strokeWidth="1" />
          <line x1="150" y1="0" x2="165" y2="100" stroke="#1a1510" strokeWidth="1" />
          <line x1="200" y1="0" x2="200" y2="100" stroke="#1a1510" strokeWidth="1" />
          <line x1="250" y1="0" x2="235" y2="100" stroke="#1a1510" strokeWidth="1" />
          <line x1="300" y1="0" x2="270" y2="100" stroke="#1a1510" strokeWidth="1" />
          <line x1="350" y1="0" x2="300" y2="100" stroke="#1a1510" strokeWidth="1" />
        </svg>

        <div className="absolute top-0 left-28 right-28 h-1 bg-gradient-to-r from-transparent via-[#4a4540]/50 to-transparent" />
      </div>

      {/* 위쪽 출구 빛 (progress가 높을 때) */}
      {progress > 40 && (
        <ExitLight opacity={exitLightOpacity} />
      )}

      {/* 떨어지는 먼지 파티클 (위로 이동할 때 아래로 떨어짐) */}
      <FallingDust progress={progress} />

      {/* === 깊이감 조명 효과 === */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 상단 밝아짐 */}
        <div
          className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-amber-100/10 to-transparent"
          style={{ opacity: topBrightness }}
        />
        {/* 하단 어두워짐 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent"
          style={{ opacity: 0.4 + bottomDarkness }}
        />
        {/* 사이드 비네트 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
      </div>
    </div>
  );
}

// 벽 조각/부조 컴포넌트
function WallCarvings({ offset, side }: { offset: number; side: "left" | "right" }) {
  const carvings = [
    { y: 20 },
    { y: 55 },
    { y: 90 },
  ];

  return (
    <>
      {carvings.map((carving, i) => (
        <div
          key={i}
          className={`absolute w-12 ${side === "left" ? "left-2" : "right-2"}`}
          style={{
            top: `${carving.y + offset * 0.5}%`,
            transition: "top 150ms ease-out",
          }}
        >
          <svg width="48" height="64" viewBox="0 0 48 64">
            <rect x="2" y="2" width="44" height="60" fill="#201a15" stroke="#2a2520" strokeWidth="2" />
            <rect x="8" y="8" width="32" height="48" fill="#151210" />
            <ellipse cx="24" cy="24" rx="10" ry="6" fill="none" stroke="#3a3530" strokeWidth="2" />
            <circle cx="24" cy="24" r="3" fill="#3a3530" />
            <path d="M24 38 L14 52 L34 52 Z" fill="none" stroke="#3a3530" strokeWidth="2" />
            <line x1="12" y1="14" x2="36" y2="14" stroke="#3a3530" strokeWidth="1" />
          </svg>
        </div>
      ))}
    </>
  );
}

// 횃불 레이어
function TorchLayer({ offset }: { offset: number }) {
  const torches = [
    { y: 15, side: "left" },
    { y: 15, side: "right" },
    { y: 45, side: "left" },
    { y: 45, side: "right" },
    { y: 75, side: "left" },
    { y: 75, side: "right" },
  ];

  return (
    <>
      {torches.map((torch, i) => (
        <div
          key={i}
          className={`absolute ${torch.side === "left" ? "left-24" : "right-24"}`}
          style={{
            top: `${torch.y + offset * 0.4}%`,
            transition: "top 150ms ease-out",
          }}
        >
          <Torch flickerDelay={i * 0.12} />
        </div>
      ))}
    </>
  );
}

// 횃불 컴포넌트
function Torch({ flickerDelay }: { flickerDelay: number }) {
  return (
    <div className="relative">
      <svg width="28" height="44" viewBox="0 0 28 44">
        <path d="M0 20 L6 20 L6 24 L10 24 L10 44 L6 44 L6 28 L0 28 Z" fill="#2a2015" />
        <rect x="8" y="16" width="7" height="20" fill="#4a3020" rx="1" />
        <rect x="9" y="18" width="2" height="16" fill="#3a2010" />
      </svg>

      <div
        className="absolute -top-2 left-3"
        style={{
          animation: `flicker 0.18s ease-in-out infinite alternate`,
          animationDelay: `${flickerDelay}s`,
        }}
      >
        <svg width="20" height="28" viewBox="0 0 20 28">
          <defs>
            <linearGradient id="flameGrad" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#ff4500" />
              <stop offset="40%" stopColor="#ff8c00" />
              <stop offset="100%" stopColor="#ffd700" />
            </linearGradient>
          </defs>
          <path d="M10 28 Q3 21 3 15 Q3 8 10 0 Q17 8 17 15 Q17 21 10 28 Z" fill="url(#flameGrad)" />
          <path d="M10 28 Q5 23 5 19 Q5 14 10 6 Q15 14 15 19 Q15 23 10 28 Z" fill="#ffff00" opacity="0.6" />
        </svg>
      </div>

      <div className="absolute -top-3 left-3 w-14 h-14 bg-orange-500/40 rounded-full blur-xl" />
      <div className="absolute -top-1 left-5 w-7 h-7 bg-yellow-400/50 rounded-full blur-md" />

      <style jsx>{`
        @keyframes flicker {
          0% { transform: scaleY(1) scaleX(1); }
          100% { transform: scaleY(1.12) scaleX(0.92); }
        }
      `}</style>
    </div>
  );
}

// 룬 문자들
function RuneSymbols({ offset }: { offset: number }) {
  const runes = [
    { symbol: "ᚠ", x: 30, y: 30 },
    { symbol: "ᚢ", x: 70, y: 30 },
    { symbol: "ᚦ", x: 30, y: 60 },
    { symbol: "ᚨ", x: 70, y: 60 },
  ];

  return (
    <>
      {runes.map((rune, i) => (
        <div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${rune.x}%`,
            top: `${rune.y + offset * 0.3}%`,
            color: "#ffd700",
            textShadow: "0 0 12px #ffd700, 0 0 25px #ff8c00",
            animation: `runeGlow 2.5s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            transition: "top 150ms ease-out",
          }}
        >
          {rune.symbol}
        </div>
      ))}
      <style jsx>{`
        @keyframes runeGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </>
  );
}

// 출구 빛
function ExitLight({ opacity }: { opacity: number }) {
  return (
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2"
      style={{ opacity }}
    >
      <div className="relative">
        <svg width="140" height="100" viewBox="0 0 140 100">
          <rect x="25" y="0" width="90" height="100" fill="#3a3530" />
          <rect x="35" y="10" width="70" height="80" fill="#ffd89b" opacity="0.85" />
          <path d="M70 90 L30 180 L110 180 Z" fill="#ffd89b" opacity="0.3" />
        </svg>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-amber-200/25 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

// 떨어지는 먼지 파티클
function FallingDust({ progress }: { progress: number }) {
  const particles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      x: 20 + Math.random() * 60,
      startY: Math.random() * 100,
      speed: 2 + Math.random() * 3,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute bg-amber-200/25 rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            animation: `dustFall ${p.speed}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes dustFall {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
