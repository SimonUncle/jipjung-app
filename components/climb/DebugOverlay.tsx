"use client";

interface DebugOverlayProps {
  worldX: number;
  screenX: number;
  cameraX: number;
  levelWidth: number;
  currentLevel: string;
  currentLevelIndex: number;
  totalProgress: number;
  isTransitioning: boolean;
  rightEdge: number;
}

export function DebugOverlay({
  worldX,
  screenX,
  cameraX,
  levelWidth,
  currentLevel,
  currentLevelIndex,
  totalProgress,
  isTransitioning,
  rightEdge,
}: DebugOverlayProps) {
  const stageProgress = (worldX / levelWidth) * 100;

  return (
    <div className="fixed top-20 left-4 bg-black/80 text-white text-xs p-2 rounded font-mono z-50 space-y-0.5">
      <div className="text-yellow-400 font-bold mb-1">DEBUG</div>
      <div>
        worldX: <span className="text-green-400">{worldX.toFixed(1)}</span>
      </div>
      <div>
        screenX: <span className="text-blue-400">{screenX.toFixed(1)}</span>
      </div>
      <div>
        cameraX: <span className="text-purple-400">{cameraX.toFixed(1)}</span>
      </div>
      <div>
        levelWidth: <span className="text-orange-400">{levelWidth}</span>
      </div>
      <div>
        rightEdge: <span className="text-red-400">{rightEdge}</span>
      </div>
      <div className="border-t border-white/20 pt-1 mt-1">
        level[{currentLevelIndex}]:{" "}
        <span className="text-cyan-400">{currentLevel}</span>
      </div>
      <div>
        isTransitioning:{" "}
        <span className={isTransitioning ? "text-red-400 font-bold" : "text-green-400"}>
          {isTransitioning ? "YES" : "no"}
        </span>
      </div>
      <div>
        stageProgress:{" "}
        <span className="text-pink-400">{stageProgress.toFixed(1)}%</span>
      </div>
      <div>
        totalProgress:{" "}
        <span className="text-yellow-400">{totalProgress.toFixed(1)}%</span>
      </div>
    </div>
  );
}
