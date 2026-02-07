"use client";

import React from "react";
import { type Level } from "@/lib/levels";
import {
  ForestBackground,
  TempleStairsBackground,
  TempleInteriorBackground,
  DesertBackground,
  CaveBackground,
  SnowBackground,
  PeakBackground,
  TransitionEffect,
} from "./backgrounds";

interface PixelBackgroundProps {
  level: Level;
  cameraX: number;
  levelWidth: number;
}

export function PixelBackground({
  level,
  cameraX,
  levelWidth,
}: PixelBackgroundProps) {
  // cameraX를 0-100 범위로 정규화 (배경 패럴랙스용)
  const progress = Math.min(100, (cameraX / levelWidth) * 100);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <LevelBackground theme={level.theme} progress={progress} />
    </div>
  );
}

// Render background based on level theme
function LevelBackground({
  theme,
  progress,
}: {
  theme: string;
  progress: number;
}) {
  // Transition themes (entrance/exit)
  if (
    theme === "temple-entrance" ||
    theme === "temple-exit" ||
    theme === "cave-entrance"
  ) {
    return <TransitionEffect theme={theme} progress={progress} />;
  }

  // Regular backgrounds based on theme
  switch (theme) {
    case "forest":
      return <ForestBackground progress={progress} />;

    case "temple-stairs":
      return <TempleStairsBackground progress={progress} />;

    case "temple-interior":
      return <TempleInteriorBackground progress={progress} />;

    case "desert":
      return <DesertBackground progress={progress} />;

    case "cave":
      return <CaveBackground progress={progress} />;

    case "snow":
      return <SnowBackground progress={progress} />;

    case "peak":
      return <PeakBackground progress={progress} />;

    default:
      return <ForestBackground progress={progress} />;
  }
}
