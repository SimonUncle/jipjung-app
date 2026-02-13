"use client";

// 조종석 뷰 - 소나, 계기판, 시스템 상태

import { useEffect, useState } from "react";

interface ControlRoomViewProps {
  progress: number;
  fromName?: string;
  toName?: string;
}

export function ControlRoomView({ progress, fromName = "부산", toName = "도쿄" }: ControlRoomViewProps) {
  const [sonarAngle, setSonarAngle] = useState(0);
  const [blips, setBlips] = useState<{ id: number; angle: number; distance: number }[]>([]);

  // 소나 스캔 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setSonarAngle(prev => (prev + 3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 랜덤 블립 (물고기 등)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newBlip = {
          id: Date.now(),
          angle: Math.random() * 360,
          distance: Math.random() * 0.7 + 0.2,
        };
        setBlips(prev => [...prev.slice(-5), newBlip]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 블립 페이드아웃
  useEffect(() => {
    const timeout = setTimeout(() => {
      setBlips(prev => prev.slice(1));
    }, 8000);
    return () => clearTimeout(timeout);
  }, [blips]);

  const depth = 200; // 고정 수심
  const oxygen = 85 + Math.floor(progress * 0.1);
  const power = 98 - Math.floor(progress * 0.1);

  return (
    <div className="relative w-full h-full bg-slate-950 p-4 font-mono text-green-400 overflow-hidden">
      {/* CRT 스캔라인 효과 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)",
        }}
      />

      {/* 상단: 상태 표시 */}
      <div className="flex justify-between items-center mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>STATUS: DIVING</span>
        </div>
        <div className="text-green-300">
          {new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* 메인 그리드 */}
      <div className="grid grid-cols-3 gap-3 h-[calc(100%-80px)]">
        {/* 왼쪽: 소나 */}
        <div className="col-span-1 flex flex-col gap-2">
          <div className="text-xs text-center text-green-300">SONAR</div>
          <div
            className="relative aspect-square rounded-full border-2 border-green-500/50 overflow-hidden"
            style={{ background: "radial-gradient(circle, #0a2010 0%, #051008 100%)" }}
          >
            {/* 동심원 */}
            {[0.25, 0.5, 0.75, 1].map((r, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-green-500/20"
                style={{
                  top: `${50 - r * 50}%`,
                  left: `${50 - r * 50}%`,
                  width: `${r * 100}%`,
                  height: `${r * 100}%`,
                }}
              />
            ))}

            {/* 십자선 */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-green-500/20" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-green-500/20" />

            {/* 스캔 라인 */}
            <div
              className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
              style={{
                background: "linear-gradient(90deg, #22c55e 0%, transparent 100%)",
                transform: `rotate(${sonarAngle}deg)`,
                boxShadow: "0 0 10px #22c55e",
              }}
            />

            {/* 스캔 잔상 */}
            <div
              className="absolute top-1/2 left-1/2 w-1/2 h-full origin-left opacity-30"
              style={{
                background: `conic-gradient(from ${sonarAngle - 30}deg, transparent 0deg, rgba(34,197,94,0.3) 30deg, transparent 30deg)`,
              }}
            />

            {/* 블립 (물고기 등) */}
            {blips.map((blip) => {
              const x = 50 + Math.cos((blip.angle * Math.PI) / 180) * blip.distance * 45;
              const y = 50 + Math.sin((blip.angle * Math.PI) / 180) * blip.distance * 45;
              return (
                <div
                  key={blip.id}
                  className="absolute w-2 h-2 rounded-full bg-green-400 animate-pulse"
                  style={{
                    top: `${y}%`,
                    left: `${x}%`,
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 6px #22c55e",
                  }}
                />
              );
            })}

            {/* 중심점 */}
            <div className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-green-500 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* 중앙: 깊이계 + 진행률 */}
        <div className="col-span-1 flex flex-col gap-2">
          {/* 깊이계 */}
          <div className="flex-1 border border-green-500/30 rounded p-2">
            <div className="text-xs text-center text-green-300 mb-1">DEPTH</div>
            <div className="relative h-full">
              {/* 수직 게이지 */}
              <div className="absolute left-4 top-2 bottom-2 w-3 bg-green-900/50 rounded">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-green-400 rounded"
                  style={{ height: `${(depth / 500) * 100}%` }}
                />
              </div>
              {/* 수치 */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-right">
                <div className="text-2xl font-bold text-green-400">{depth}</div>
                <div className="text-xs text-green-300">meters</div>
              </div>
              {/* 눈금 */}
              {[0, 100, 200, 300, 400, 500].map((d) => (
                <div
                  key={d}
                  className="absolute left-10 text-[8px] text-green-500/50"
                  style={{ bottom: `${(d / 500) * 100}%`, transform: "translateY(50%)" }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* 진행률 */}
          <div className="border border-green-500/30 rounded p-2">
            <div className="text-xs text-center text-green-300 mb-1">PROGRESS</div>
            <div className="text-3xl font-bold text-center">{progress}%</div>
          </div>
        </div>

        {/* 오른쪽: 나침반 + 상태 */}
        <div className="col-span-1 flex flex-col gap-2">
          {/* 나침반 */}
          <div className="flex-1 border border-green-500/30 rounded p-2 flex items-center justify-center">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* 외곽 원 */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.3" />
                {/* 방위 표시 */}
                <text x="50" y="15" textAnchor="middle" fill="#22c55e" fontSize="10">N</text>
                <text x="50" y="92" textAnchor="middle" fill="#22c55e" fontSize="10">S</text>
                <text x="8" y="54" textAnchor="middle" fill="#22c55e" fontSize="10">W</text>
                <text x="92" y="54" textAnchor="middle" fill="#22c55e" fontSize="10">E</text>
                {/* 나침반 바늘 */}
                <polygon points="50,20 45,50 50,45 55,50" fill="#ef4444" />
                <polygon points="50,80 45,50 50,55 55,50" fill="#22c55e" />
              </svg>
            </div>
          </div>

          {/* 상태 */}
          <div className="border border-green-500/30 rounded p-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span>HEADING</span>
              <span>095°</span>
            </div>
            <div className="flex justify-between">
              <span>SPEED</span>
              <span>12 kts</span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 경로 + 시스템 상태 */}
      <div className="mt-3 space-y-2">
        {/* 경로 바 */}
        <div className="border border-green-500/30 rounded p-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>{fromName}</span>
            <span>{toName}</span>
          </div>
          <div className="relative h-2 bg-green-900/50 rounded-full">
            <div
              className="absolute h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-green-400 rounded-full border-2 border-green-300"
              style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
            />
          </div>
        </div>

        {/* 시스템 바 */}
        <div className="flex gap-3 text-xs">
          <div className="flex-1">
            <div className="flex justify-between mb-0.5">
              <span>O2</span>
              <span>{oxygen}%</span>
            </div>
            <div className="h-1.5 bg-green-900/50 rounded-full">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${oxygen}%` }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-0.5">
              <span>PWR</span>
              <span>{power}%</span>
            </div>
            <div className="h-1.5 bg-green-900/50 rounded-full">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${power}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CRT 글로우 효과 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 100px rgba(34,197,94,0.1)",
        }}
      />
    </div>
  );
}

export default ControlRoomView;
