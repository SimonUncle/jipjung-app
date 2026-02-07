"use client";

import { formatAltitude, getPeakInfo } from "@/lib/altitude";
import { TimerDuration } from "@/types";

interface AltitudeDisplayProps {
  altitude: number;
  selectedDuration: TimerDuration;
  className?: string;
}

export function AltitudeDisplay({
  altitude,
  selectedDuration,
  className = "",
}: AltitudeDisplayProps) {
  const peakInfo = getPeakInfo(selectedDuration);

  return (
    <div className={`text-center space-y-1 ${className}`}>
      {/* 현재 고도 */}
      <div className="timer-display text-5xl md:text-6xl font-bold text-white tracking-wide">
        {formatAltitude(altitude)}
      </div>

      {/* 목표 정보 */}
      <div className="text-sm text-dark-muted">
        <span className="text-white/60">{peakInfo.peakName}</span>
        <span className="mx-2">·</span>
        <span>정상 {peakInfo.maxAltitude.toLocaleString()}m</span>
      </div>
    </div>
  );
}
