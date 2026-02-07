"use client";

interface MiniMapProps {
  progress: number;
}

export function MiniMap({ progress }: MiniMapProps) {
  // 구간별 색상 (지형에 맞춤)
  const getSegmentColor = (segmentProgress: number) => {
    if (segmentProgress < 20) return "#2d5a27"; // 숲 - 녹색
    if (segmentProgress < 35) return "#c2b280"; // 사막 - 모래색
    if (segmentProgress < 55) return "#6b7280"; // 황무지 - 회색
    if (segmentProgress < 75) return "#bfdbfe"; // 설원 - 연한 파랑
    return "#e0f2fe"; // 정상 - 밝은 하늘색
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[120px]">
      {/* 라벨 */}
      <div className="text-white/60 text-[10px] mb-1.5 text-center">
        여정 진행
      </div>

      {/* 미니맵 바 */}
      <div className="relative h-3 bg-dark-bg/60 rounded-full overflow-hidden">
        {/* 구간별 배경 */}
        <div className="absolute inset-0 flex">
          <div className="w-[20%] bg-[#2d5a27]/30" /> {/* 숲 */}
          <div className="w-[15%] bg-[#c2b280]/30" /> {/* 사막 */}
          <div className="w-[20%] bg-[#6b7280]/30" /> {/* 황무지 */}
          <div className="w-[20%] bg-[#bfdbfe]/30" /> {/* 설원 */}
          <div className="w-[25%] bg-[#e0f2fe]/30" /> {/* 정상 */}
        </div>

        {/* 진행 바 */}
        <div
          className="absolute h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${getSegmentColor(0)}, ${getSegmentColor(progress)})`
          }}
        />

        {/* 현재 위치 마커 (캐릭터) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
          style={{ left: `calc(${Math.min(progress, 96)}% - 4px)` }}
        >
          <div className="w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50 animate-pulse" />
        </div>
      </div>

      {/* 시작/도착 아이콘 */}
      <div className="flex justify-between mt-1 text-[10px]">
        <span>🏠</span>
        <span className="text-white/40">{Math.round(progress)}%</span>
        <span>⛺</span>
      </div>
    </div>
  );
}
