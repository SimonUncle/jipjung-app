"use client";

import React from "react";

interface PeakBackgroundProps {
  progress: number;
}

export function PeakBackground({ progress }: PeakBackgroundProps) {
  const showTreasure = progress > 60;
  const treasureScale = Math.min(1, (progress - 60) / 30);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Magical sky - night with aurora */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a20] via-[#1a1a40] to-[#2a2a50]" />

      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              left: `${(i * 7 + 3) % 100}%`,
              top: `${(i * 11 + 5) % 60}%`,
              width: i % 4 === 0 ? 3 : 2,
              height: i % 4 === 0 ? 3 : 2,
              animation: i % 3 === 0 ? "twinkle 2s ease-in-out infinite" : undefined,
              animationDelay: `${i * 0.1}s`,
              opacity: 0.6 + (i % 3) * 0.2,
            }}
          />
        ))}
      </div>

      {/* Aurora effect */}
      <div className="absolute top-10 left-0 right-0 h-32 opacity-30">
        <div
          className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/50 to-cyan-400/0"
          style={{ animation: "aurora 8s ease-in-out infinite" }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/30 to-pink-400/0"
          style={{ animation: "aurora 6s ease-in-out infinite reverse", animationDelay: "2s" }}
        />
      </div>

      {/* Moon */}
      <div className="absolute top-12 right-16">
        <div className="w-16 h-16 bg-yellow-100 rounded-full shadow-lg shadow-yellow-100/50" />
        <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-yellow-200/50" />
        <div className="absolute top-6 left-8 w-2 h-2 rounded-full bg-yellow-200/40" />
      </div>

      {/* Mountain peak platform */}
      <div className="absolute bottom-0 left-0 right-0">
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
        <svg className="w-full h-40" viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="peakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a4a6a" />
              <stop offset="100%" stopColor="#2a2a4a" />
            </linearGradient>
          </defs>
          {/* Main platform */}
          <path
            d="M0 120 L0 80 Q50 70 100 75 Q150 65 200 70 Q250 65 300 75 Q350 70 400 80 L400 120 Z"
            fill="url(#peakGrad)"
          />
          {/* Snow on top */}
          <path
            d="M0 80 Q50 70 100 75 Q150 65 200 70 Q250 65 300 75 Q350 70 400 80 L400 85 Q350 75 300 80 Q250 70 200 75 Q150 70 100 80 Q50 75 0 85 Z"
            fill="#e8e8f8"
          />
          {/* Rocks */}
          <ellipse cx="80" cy="100" rx="15" ry="8" fill="#3a3a5a" />
          <ellipse cx="320" cy="105" rx="12" ry="6" fill="#4a4a6a" />
        </svg>
      </div>

      {/* Treasure chest with star */}
      {showTreasure && (
        <div
          className="absolute bottom-28 left-1/2 -translate-x-1/2"
          style={{
            transform: `translateX(-50%) scale(${0.5 + treasureScale * 0.5})`,
            opacity: treasureScale,
          }}
        >
          {/* Glowing aura */}
          <div className="absolute -inset-8 bg-gradient-radial from-yellow-400/30 via-yellow-400/10 to-transparent rounded-full blur-xl animate-pulse" />

          {/* Treasure chest */}
          <svg width="60" height="50" viewBox="0 0 60 50">
            <defs>
              <linearGradient id="chestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="50%" stopColor="#daa520" />
                <stop offset="100%" stopColor="#b8860b" />
              </linearGradient>
              <linearGradient id="chestLidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffeebb" />
                <stop offset="100%" stopColor="#daa520" />
              </linearGradient>
            </defs>
            {/* Chest base */}
            <rect x="5" y="25" width="50" height="25" rx="3" fill="url(#chestGrad)" />
            {/* Chest lid (open) */}
            <path d="M5 25 Q5 10 30 5 Q55 10 55 25 Z" fill="url(#chestLidGrad)" />
            {/* Gold inside */}
            <ellipse cx="30" cy="30" rx="18" ry="8" fill="#ffd700" />
            <circle cx="25" cy="28" r="4" fill="#ffec8b" />
            <circle cx="35" cy="29" r="3" fill="#ffec8b" />
            <circle cx="30" cy="26" r="3" fill="#fff8dc" />
            {/* Gems */}
            <circle cx="22" cy="32" r="2" fill="#ff69b4" />
            <circle cx="38" cy="31" r="2" fill="#00ced1" />
            <circle cx="30" cy="33" r="2" fill="#9370db" />
            {/* Lock */}
            <rect x="27" y="38" width="6" height="5" fill="#8b4513" />
            <circle cx="30" cy="40" r="1.5" fill="#ffd700" />
          </svg>

          {/* Floating star above chest */}
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2"
            style={{ animation: "float 2s ease-in-out infinite" }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40">
              <defs>
                <filter id="starGlow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M20 0 L24 14 L40 14 L27 23 L32 40 L20 30 L8 40 L13 23 L0 14 L16 14 Z"
                fill="#ffd700"
                filter="url(#starGlow)"
              />
              <path
                d="M20 5 L22 14 L32 14 L24 20 L27 32 L20 25 L13 32 L16 20 L8 14 L18 14 Z"
                fill="#ffec8b"
              />
            </svg>
            {/* Star rays */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[0, 45, 90, 135].map((angle) => (
                <div
                  key={angle}
                  className="absolute w-1 h-16 bg-gradient-to-t from-transparent via-yellow-300/50 to-transparent"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    animation: "rayPulse 1.5s ease-in-out infinite",
                    animationDelay: `${angle * 0.01}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Sparkles around treasure */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full"
              style={{
                left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 40}px`,
                top: `${10 + Math.sin(i * 60 * Math.PI / 180) * 30}px`,
                animation: `sparkle 1s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes aurora {
          0%, 100% { transform: translateX(-20%) skewX(-5deg); }
          50% { transform: translateX(20%) skewX(5deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-8px); }
        }
        @keyframes rayPulse {
          0%, 100% { opacity: 0.3; transform: rotate(var(--rotation)) scaleY(1); }
          50% { opacity: 0.6; transform: rotate(var(--rotation)) scaleY(1.2); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
