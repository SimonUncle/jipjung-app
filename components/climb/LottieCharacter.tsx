"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottieCharacterProps {
  isClimbing: boolean;
}

export function LottieCharacter({ isClimbing }: LottieCharacterProps) {
  const [idleData, setIdleData] = useState<object | null>(null);
  const [climbData, setClimbData] = useState<object | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const [idleRes, climbRes] = await Promise.all([
          fetch("/assets/lottie/climber_idle.json"),
          fetch("/assets/lottie/climber_climb.json"),
        ]);

        if (idleRes.ok) setIdleData(await idleRes.json());
        if (climbRes.ok) setClimbData(await climbRes.json());
        setLoaded(true);
      } catch {
        setLoaded(true);
      }
    };
    loadAnimations();
  }, []);

  // Lottie 에셋 있으면 Lottie 사용
  if (loaded && (idleData || climbData)) {
    const animationData = isClimbing ? (climbData || idleData) : idleData;
    if (animationData) {
      return (
        <div className="w-16 h-16">
          <Lottie animationData={animationData} loop style={{ width: "100%", height: "100%" }} />
        </div>
      );
    }
  }

  // Fallback: 정적 실루엣 SVG + CSS 애니메이션
  return <SilhouetteCharacter isClimbing={isClimbing} />;
}

// Fallback: 실루엣 캐릭터 (이모지 대신)
function SilhouetteCharacter({ isClimbing }: { isClimbing: boolean }) {
  return (
    <div
      className={`transition-transform duration-300 ${isClimbing ? "scale-105" : ""}`}
      style={{
        animation: isClimbing ? "climb-wobble 0.3s ease-in-out infinite" : "idle-breathe 2s ease-in-out infinite",
      }}
    >
      <svg width="72" height="96" viewBox="0 0 48 64" fill="none">
        {/* 등반가 실루엣 */}
        <ellipse cx="24" cy="12" rx="8" ry="9" fill="#2c3e50" /> {/* 머리 */}
        <rect x="18" y="20" width="12" height="20" rx="3" fill="#2c3e50" /> {/* 몸통 */}
        <rect x="12" y="22" width="6" height="14" rx="2" fill="#2c3e50" transform="rotate(-20 12 22)" /> {/* 왼팔 */}
        <rect x="30" y="22" width="6" height="14" rx="2" fill="#2c3e50" transform="rotate(20 30 22)" /> {/* 오른팔 */}
        <rect x="16" y="38" width="6" height="18" rx="2" fill="#2c3e50" transform="rotate(-5 16 38)" /> {/* 왼다리 */}
        <rect x="26" y="38" width="6" height="18" rx="2" fill="#2c3e50" transform="rotate(5 26 38)" /> {/* 오른다리 */}
        {/* 피켈 */}
        <line x1="8" y1="15" x2="8" y2="35" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 15 L8 12 L12 15" stroke="#7f8c8d" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>

      <style jsx>{`
        @keyframes idle-breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes climb-wobble {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-2deg); }
          75% { transform: translateY(-3px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
