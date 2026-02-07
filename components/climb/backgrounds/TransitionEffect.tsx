"use client";

import React from "react";
import { SegmentTheme } from "@/lib/segments";

interface TransitionEffectProps {
  theme: SegmentTheme;
  progress: number; // 0-100 within transition segment
}

export function TransitionEffect({ theme, progress }: TransitionEffectProps) {
  switch (theme) {
    case "temple-entrance":
      return <TempleEntranceTransition progress={progress} />;
    case "temple-exit":
      return <TempleExitTransition progress={progress} />;
    case "cave-entrance":
      return <CaveEntranceTransition progress={progress} />;
    default:
      return <FadeTransition progress={progress} />;
  }
}

// Temple entrance - approach and door opening animation
function TempleEntranceTransition({ progress }: { progress: number }) {
  // Phase 1 (0-40%): Approaching the temple (horizontal scroll continues)
  // Phase 2 (40-60%): Standing at the door, door begins to open
  // Phase 3 (60-100%): Door fully open, entering temple (fade to interior)

  const approachPhase = Math.min(100, progress * 2.5); // 0-100 during 0-40%
  const doorOpenPhase = progress > 40 ? Math.min(100, (progress - 40) * 5) : 0; // 0-100 during 40-60%
  const enterPhase = progress > 60 ? Math.min(100, (progress - 60) * 2.5) : 0; // 0-100 during 60-100%

  // Temple scale: starts big (already close from forest end) and gets even bigger as we approach
  const templeScale = 1.2 + (approachPhase / 100) * 0.8; // 1.2 → 2.0
  const templeTranslateY = -20 + (approachPhase / 100) * 20; // Slides down as we approach

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky background - fades out as we enter */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#E0F4FF]"
        style={{ opacity: Math.max(0, 1 - enterPhase / 100) }}
      />

      {/* Temple interior darkness appearing */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#2a2015] to-[#1a1510]"
        style={{ opacity: enterPhase / 100 }}
      />

      {/* Ground */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-[#4ade80] to-[#16a34a]"
        style={{ opacity: Math.max(0, 1 - enterPhase / 100) }}
      />

      {/* Large Temple Building */}
      <div
        className="absolute bottom-20 left-0 right-0 flex justify-center"
        style={{
          transform: `scale(${templeScale}) translateY(${templeTranslateY}px)`,
          transformOrigin: "bottom center",
          transition: "transform 200ms ease-out",
        }}
      >
        <svg width="300" height="350" viewBox="0 0 300 350">
          {/* Temple base/platform */}
          <rect x="30" y="280" width="240" height="70" fill="#5a4a3a" />
          <rect x="45" y="265" width="210" height="20" fill="#6a5a4a" />
          <rect x="60" y="250" width="180" height="20" fill="#7a6a5a" />

          {/* Main temple structure */}
          <rect x="60" y="100" width="180" height="150" fill="#4a3a2a" />

          {/* Temple roof - triangular */}
          <polygon points="150,15 30,100 270,100" fill="#3a2a1a" />
          <polygon points="150,30 50,95 250,95" fill="#4a3a2a" />

          {/* Roof decorations */}
          <rect x="143" y="5" width="14" height="25" fill="#8b7355" />
          <circle cx="150" cy="5" r="10" fill="#f59e0b" opacity="0.9" />

          {/* Columns */}
          {[85, 120, 180, 215].map((x, i) => (
            <g key={i}>
              <rect x={x - 7} y="100" width="14" height="150" fill="#6a5a4a" />
              <rect x={x - 8} y="97" width="16" height="10" fill="#7a6a5a" />
              <rect x={x - 8} y="245" width="16" height="10" fill="#7a6a5a" />
            </g>
          ))}

          {/* Large entrance door frame */}
          <rect x="105" y="140" width="90" height="110" fill="#2a1a0a" />

          {/* Door panels - these open! */}
          <g style={{ transition: "transform 300ms ease-out" }}>
            {/* Left door */}
            <rect
              x="108"
              y="143"
              width="42"
              height="104"
              fill="#3a2a1a"
              style={{
                transform: `translateX(-${doorOpenPhase * 0.4}px)`,
                transformOrigin: "left center",
              }}
            />
            {/* Right door */}
            <rect
              x="150"
              y="143"
              width="42"
              height="104"
              fill="#3a2a1a"
              style={{
                transform: `translateX(${doorOpenPhase * 0.4}px)`,
                transformOrigin: "right center",
              }}
            />
          </g>

          {/* Light from inside (visible when door opens) */}
          <rect
            x="110"
            y="145"
            width="80"
            height="100"
            fill="#f59e0b"
            opacity={doorOpenPhase / 200}
          />

          {/* Door frame decoration */}
          <rect x="100" y="133" width="100" height="12" fill="#8b7355" />

          {/* Rune symbols */}
          <text x="75" y="180" fill="#f59e0b" fontSize="20" opacity="0.7">ᚠ</text>
          <text x="75" y="220" fill="#f59e0b" fontSize="20" opacity="0.7">ᚢ</text>
          <text x="215" y="180" fill="#f59e0b" fontSize="20" opacity="0.7">ᚦ</text>
          <text x="215" y="220" fill="#f59e0b" fontSize="20" opacity="0.7">ᚨ</text>

          {/* Torch stands */}
          <rect x="90" y="170" width="6" height="60" fill="#5a4030" />
          <rect x="204" y="170" width="6" height="60" fill="#5a4030" />

          {/* Windows */}
          <rect x="70" y="115" width="25" height="35" fill="#1a0a00" opacity="0.8" />
          <rect x="205" y="115" width="25" height="35" fill="#1a0a00" opacity="0.8" />
        </svg>
      </div>

      {/* Torch glow effects (animated) */}
      <div
        className="absolute left-1/4 top-1/3"
        style={{
          transform: `scale(${templeScale * 0.7})`,
          opacity: Math.max(0, 1 - enterPhase / 100),
        }}
      >
        <TorchGlow />
      </div>
      <div
        className="absolute right-1/4 top-1/3"
        style={{
          transform: `scale(${templeScale * 0.7})`,
          opacity: Math.max(0, 1 - enterPhase / 100),
        }}
      >
        <TorchGlow />
      </div>

      {/* Vignette effect when entering */}
      {enterPhase > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, transparent 0%, rgba(0,0,0,${enterPhase / 100 * 0.8}) 100%)`,
          }}
        />
      )}
    </div>
  );
}

// Temple exit - walking through door to desert
function TempleExitTransition({ progress }: { progress: number }) {
  // Phase 1 (0-30%): 출구 문에 다가감
  // Phase 2 (30-60%): 문이 열림
  // Phase 3 (60-100%): 밖으로 나감 (사막 배경 나타남)

  const doorOpenPhase = progress > 30 ? Math.min(100, (progress - 30) * 3.33) : 0;
  const exitPhase = progress > 60 ? Math.min(100, (progress - 60) * 2.5) : 0;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 신전 내부 배경 */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0d0a08] via-[#1a1510] to-[#0d0a08]"
        style={{ opacity: Math.max(0, 1 - exitPhase / 100) }}
      />

      {/* 사막 배경 (나갈 때 나타남) */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#ff7f50] via-[#ffa07a] to-[#ffd89b]"
        style={{ opacity: exitPhase / 100 }}
      />

      {/* 사막 땅 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-[#e4b87a] to-[#c4966a]"
        style={{ opacity: exitPhase / 100 }}
      />

      {/* 신전 벽과 출구 문 */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: Math.max(0, 1 - exitPhase / 150) }}
      >
        <div className="relative">
          {/* 벽 */}
          <svg width="400" height="350" viewBox="0 0 400 350">
            {/* 어두운 벽 */}
            <rect x="0" y="0" width="400" height="350" fill="#1a1510" />

            {/* 문틀 */}
            <rect x="120" y="50" width="160" height="280" fill="#3a3025" />
            <rect x="130" y="60" width="140" height="260" fill="#2a2015" />

            {/* 문 패널들 (열림) */}
            <g>
              {/* 왼쪽 문 */}
              <rect
                x="133"
                y="63"
                width="65"
                height="254"
                fill="#4a3a2a"
                style={{
                  transform: `translateX(-${doorOpenPhase * 0.6}px)`,
                  transformOrigin: "left center",
                }}
              />
              {/* 오른쪽 문 */}
              <rect
                x="202"
                y="63"
                width="65"
                height="254"
                fill="#4a3a2a"
                style={{
                  transform: `translateX(${doorOpenPhase * 0.6}px)`,
                  transformOrigin: "right center",
                }}
              />
            </g>

            {/* 문 손잡이 */}
            <circle cx="190" cy="200" r="4" fill="#8b7355" style={{ opacity: 1 - doorOpenPhase / 100 }} />
            <circle cx="210" cy="200" r="4" fill="#8b7355" style={{ opacity: 1 - doorOpenPhase / 100 }} />

            {/* 문 위 장식 */}
            <rect x="125" y="45" width="150" height="12" fill="#5a4a3a" />
            <path d="M200 20 L160 45 L240 45 Z" fill="#4a3a2a" />

            {/* 룬 문자 */}
            <text x="85" y="150" fill="#ffd700" fontSize="24" opacity="0.6">ᚠ</text>
            <text x="85" y="250" fill="#ffd700" fontSize="24" opacity="0.6">ᚢ</text>
            <text x="295" y="150" fill="#ffd700" fontSize="24" opacity="0.6">ᚦ</text>
            <text x="295" y="250" fill="#ffd700" fontSize="24" opacity="0.6">ᚨ</text>
          </svg>

          {/* 문 뒤로 보이는 빛/사막 */}
          <div
            className="absolute top-[60px] left-[130px] w-[140px] h-[260px] overflow-hidden"
            style={{ opacity: doorOpenPhase / 100 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#ffd89b] via-[#ffa07a] to-[#e4b87a]" />
            {/* 태양 */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-12 bg-yellow-200 rounded-full blur-sm" />
          </div>
        </div>
      </div>

      {/* 횃불 (양쪽) */}
      <div
        className="absolute left-16 top-1/3"
        style={{ opacity: Math.max(0, 1 - exitPhase / 100) }}
      >
        <TorchGlow />
      </div>
      <div
        className="absolute right-16 top-1/3"
        style={{ opacity: Math.max(0, 1 - exitPhase / 100) }}
      >
        <TorchGlow />
      </div>

      {/* 나갈 때 밝아지는 효과 */}
      {exitPhase > 0 && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"
          style={{ opacity: exitPhase / 100 }}
        />
      )}
    </div>
  );
}

// Cave entrance - going into darkness
function CaveEntranceTransition({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Desert background fading */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#ff7f50] to-[#e4b87a]"
        style={{ opacity: 1 - progress / 100 }}
      />

      {/* Cave darkness */}
      <div
        className="absolute inset-0 bg-[#0a0a15]"
        style={{ opacity: progress / 100 }}
      />

      {/* Cave mouth shape */}
      <div className="absolute inset-0 flex items-end justify-center pb-20">
        <svg width="200" height="160" viewBox="0 0 200 160">
          <defs>
            <linearGradient id="caveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3a3a4a" />
              <stop offset="100%" stopColor="#1a1a2a" />
            </linearGradient>
          </defs>
          {/* Cave opening */}
          <path
            d="M0 160 Q20 140 40 150 Q60 120 80 140 Q100 100 120 130 Q140 110 160 140 Q180 130 200 160 L200 200 L0 200 Z"
            fill="url(#caveGrad)"
          />
          {/* Dark interior */}
          <ellipse
            cx="100"
            cy="140"
            rx="60"
            ry="40"
            fill="#0a0a15"
            style={{ opacity: progress / 100 }}
          />
        </svg>
      </div>

      {/* Bats flying out */}
      {progress > 30 && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${45 + i * 8}%`,
                top: `${50 - (progress - 30) * 0.5 - i * 5}%`,
                opacity: (progress - 30) / 70,
              }}
            >
              <svg width="16" height="8" viewBox="0 0 16 8">
                <path d="M8 4 L0 0 L3 4 L0 8 L8 4 L16 0 L13 4 L16 8 Z" fill="#1a1a2a" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Generic fade transition
function FadeTransition({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: progress < 50 ? progress / 50 * 0.8 : (100 - progress) / 50 * 0.8,
        }}
      />
    </div>
  );
}

// Torch glow component
function TorchGlow() {
  return (
    <div className="relative">
      <div className="w-8 h-8 bg-orange-500/50 rounded-full blur-lg animate-pulse" />
      <div className="absolute inset-0 w-4 h-4 m-auto bg-yellow-400/70 rounded-full blur-sm" />
    </div>
  );
}
