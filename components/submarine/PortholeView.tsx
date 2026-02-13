"use client";

// 선창 뷰 - 동그란 창문으로 바다를 바라보는 시점

import { useEffect, useState } from "react";
import { UnderwaterView } from "./UnderwaterView";

interface WaterDrop {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface CuriousFish {
  id: number;
  active: boolean;
  x: number;
  y: number;
  type: "small" | "medium" | "large";
}

export function PortholeView() {
  const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);
  const [curiousFish, setCuriousFish] = useState<CuriousFish | null>(null);

  // 물방울 생성
  useEffect(() => {
    const initialDrops: WaterDrop[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 8 + 4,
    }));
    setWaterDrops(initialDrops);

    // 새 물방울 추가
    const dropInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newDrop: WaterDrop = {
          id: Date.now(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 30 + 10, // 위쪽에 주로 생김
          size: Math.random() * 10 + 4,
        };
        setWaterDrops(prev => [...prev.slice(-12), newDrop]);
      }
    }, 3000);

    return () => clearInterval(dropInterval);
  }, []);

  // 호기심 많은 물고기 이벤트
  useEffect(() => {
    const fishInterval = setInterval(() => {
      if (Math.random() > 0.7 && !curiousFish) {
        const types: CuriousFish["type"][] = ["small", "medium", "large"];
        setCuriousFish({
          id: Date.now(),
          active: true,
          x: Math.random() * 40 + 30,
          y: Math.random() * 40 + 30,
          type: types[Math.floor(Math.random() * types.length)],
        });

        // 몇 초 후 사라짐
        setTimeout(() => {
          setCuriousFish(null);
        }, 4000);
      }
    }, 8000);

    return () => clearInterval(fishInterval);
  }, [curiousFish]);

  return (
    <div className="relative w-full h-full bg-slate-800 overflow-hidden">
      {/* 잠수함 내부 벽 (금속 질감) */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #374151 0%, #1f2937 50%, #111827 100%)",
        }}
      />

      {/* 리벳/볼트 패턴 */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gray-400"
            style={{
              top: `${(i % 5) * 25 + 5}%`,
              left: `${Math.floor(i / 5) * 25 + 5}%`,
              boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.5)",
            }}
          />
        ))}
      </div>

      {/* 창문 (Porthole) */}
      <div className="absolute inset-8 flex items-center justify-center">
        <div
          className="relative w-full h-full max-w-[280px] max-h-[280px] aspect-square rounded-full overflow-hidden"
          style={{
            boxShadow: "inset 0 0 50px rgba(0,0,0,0.5)",
          }}
        >
          {/* 해저 뷰 (기존 컴포넌트 재사용) */}
          <div className="absolute inset-0">
            <UnderwaterView />
          </div>

          {/* 호기심 많은 물고기 */}
          {curiousFish && (
            <div
              className="absolute z-20 pointer-events-none"
              style={{
                left: `${curiousFish.x}%`,
                top: `${curiousFish.y}%`,
                transform: "translate(-50%, -50%)",
                animation: "fishApproach 4s ease-in-out forwards",
              }}
            >
              <svg
                width={curiousFish.type === "large" ? 80 : curiousFish.type === "medium" ? 50 : 30}
                height={curiousFish.type === "large" ? 50 : curiousFish.type === "medium" ? 30 : 18}
                viewBox="0 0 60 36"
              >
                {/* 물고기 몸통 */}
                <ellipse cx="30" cy="18" rx="25" ry="14" fill="#4a90a4" />
                <ellipse cx="35" cy="18" rx="18" ry="10" fill="#5ba3b8" />
                {/* 눈 (크게) */}
                <circle cx="45" cy="14" r="6" fill="white" />
                <circle cx="46" cy="14" r="3" fill="#1a1a2e" />
                <circle cx="47" cy="13" r="1" fill="white" />
                {/* 꼬리 */}
                <polygon points="5,18 0,8 0,28" fill="#4a90a4" />
                {/* 지느러미 */}
                <path d="M25,8 Q30,0 35,8" fill="#5ba3b8" />
              </svg>
            </div>
          )}

          {/* 창문 유리 반사 효과 */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.1) 100%)",
            }}
          />

          {/* 물방울 (결로) */}
          {waterDrops.map((drop) => (
            <div
              key={drop.id}
              className="absolute z-10 pointer-events-none"
              style={{
                left: `${drop.x}%`,
                top: `${drop.y}%`,
                width: drop.size,
                height: drop.size * 1.3,
                borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(200,220,240,0.2) 50%, transparent 70%)",
                animation: "dropSlide 20s ease-in-out infinite",
                animationDelay: `${drop.id * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* 창문 프레임 (금속 테두리) */}
        <div
          className="absolute w-full h-full max-w-[300px] max-h-[300px] aspect-square rounded-full pointer-events-none"
          style={{
            border: "16px solid #4b5563",
            boxShadow: "inset 4px 4px 10px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.1), 0 0 20px rgba(0,0,0,0.5)",
            background: "transparent",
          }}
        />

        {/* 볼트 (8개) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const radius = 48; // %
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          return (
            <div
              key={i}
              className="absolute w-4 h-4 rounded-full pointer-events-none"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                background: "linear-gradient(135deg, #6b7280 0%, #374151 50%, #1f2937 100%)",
                boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {/* 볼트 홈 */}
              <div
                className="absolute top-1/2 left-1/2 w-2/3 h-0.5 bg-gray-800 -translate-x-1/2 -translate-y-1/2"
                style={{ transform: `translate(-50%, -50%) rotate(${i * 45}deg)` }}
              />
            </div>
          );
        })}
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes dropSlide {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          50% {
            transform: translateY(5px);
            opacity: 0.8;
          }
        }

        @keyframes fishApproach {
          0% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0;
          }
          30% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          70% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-150%, -50%) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default PortholeView;
