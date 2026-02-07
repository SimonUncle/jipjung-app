"use client";

import { useEffect, useRef } from "react";
import { Port, PORTS } from "@/lib/ports";

interface WorldMapProps {
  departurePort: Port;
  arrivalPort: Port;
  currentPosition: { lat: number; lng: number };
  progress: number;
  unlockedPorts: string[];
}

export function WorldMap({
  departurePort,
  arrivalPort,
  currentPosition,
  progress,
  unlockedPorts,
}: WorldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 위도/경도를 캔버스 좌표로 변환
  const geoToCanvas = (lat: number, lng: number, width: number, height: number) => {
    // Mercator projection (simplified)
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 배경
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    // 바다 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#1e3a5f");
    gradient.addColorStop(1, "#0c1929");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 그리드 라인 (위도/경도)
    ctx.strokeStyle = "rgba(59, 130, 246, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const y = (height / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 12; i++) {
      const x = (width / 12) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 해금된 항구들 (작은 점)
    PORTS.forEach((port) => {
      const { x, y } = geoToCanvas(port.coordinates.lat, port.coordinates.lng, width, height);
      const isUnlocked = unlockedPorts.includes(port.id);

      if (isUnlocked) {
        ctx.fillStyle = "rgba(59, 130, 246, 0.5)";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 항로 (점선)
    const from = geoToCanvas(departurePort.coordinates.lat, departurePort.coordinates.lng, width, height);
    const to = geoToCanvas(arrivalPort.coordinates.lat, arrivalPort.coordinates.lng, width, height);

    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 진행된 항로 (실선)
    const current = geoToCanvas(currentPosition.lat, currentPosition.lng, width, height);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    // 출발 항구
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(from.x, from.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // 도착 항구
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(to.x, to.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // 배 아이콘 (현재 위치)
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🚢", current.x, current.y);

    // 출발/도착 레이블
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText(departurePort.nameKo, from.x, from.y - 12);
    ctx.fillText(arrivalPort.nameKo, to.x, to.y - 12);

  }, [departurePort, arrivalPort, currentPosition, progress, unlockedPorts]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="w-full h-full"
        style={{ imageRendering: "crisp-edges" }}
      />

      {/* 진행률 오버레이 */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
          <span className="text-xs text-blue-300">{Math.round(progress)}%</span>
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
