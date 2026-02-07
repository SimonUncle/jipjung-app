"use client";

import { formatDistance, getJourneyInfo } from "@/lib/distance";
import { TimerDuration } from "@/types";

interface DistanceDisplayProps {
  distance: number;
  selectedDuration: TimerDuration;
  className?: string;
}

export function DistanceDisplay({
  distance,
  selectedDuration,
  className = "",
}: DistanceDisplayProps) {
  const journeyInfo = getJourneyInfo(selectedDuration);

  return (
    <div className={`text-center space-y-1 ${className}`}>
      {/* 현재 거리 */}
      <div className="timer-display text-5xl md:text-6xl font-bold text-white tracking-wide">
        {formatDistance(distance)}
      </div>

      {/* 목표 정보 */}
      <div className="text-sm text-dark-muted">
        <span className="text-white/60">{journeyInfo.journeyName}</span>
        <span className="mx-2">·</span>
        <span>목표 {journeyInfo.maxDistance}km</span>
      </div>
    </div>
  );
}
