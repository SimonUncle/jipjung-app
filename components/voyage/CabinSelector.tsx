"use client";

import { CabinType } from "@/types";

interface CabinSelectorProps {
  selected: CabinType;
  onSelect: (cabin: CabinType) => void;
}

const CABIN_OPTIONS: {
  type: CabinType;
  name: string;
  nameKo: string;
  emoji: string;
  description: string;
  feature: string;
}[] = [
  {
    type: "standard",
    name: "Standard",
    nameKo: "일반",
    emoji: "🚢",
    description: "맑은 날씨의 바다 전망",
    feature: "기본 바다 뷰",
  },
  {
    type: "premium",
    name: "Premium",
    nameKo: "프리미엄",
    emoji: "🌅",
    description: "황홀한 선셋 뷰 + 갈매기",
    feature: "선셋 뷰 & 갈매기",
  },
];

export function CabinSelector({ selected, onSelect }: CabinSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-xs text-blue-300/70 block">객실 선택</label>

      <div className="grid grid-cols-2 gap-3">
        {CABIN_OPTIONS.map((cabin) => {
          const isSelected = selected === cabin.type;

          return (
            <button
              key={cabin.type}
              onClick={() => onSelect(cabin.type)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left
                ${
                  isSelected
                    ? cabin.type === "premium"
                      ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-400/50"
                      : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
            >
              {/* 프리미엄 뱃지 */}
              {cabin.type === "premium" && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  추천
                </div>
              )}

              {/* 아이콘 */}
              <div className="text-3xl mb-2">{cabin.emoji}</div>

              {/* 이름 */}
              <div
                className={`font-bold text-base mb-1 ${
                  isSelected ? "text-white" : "text-blue-200/70"
                }`}
              >
                {cabin.nameKo}
              </div>

              {/* 설명 */}
              <div
                className={`text-xs ${
                  isSelected ? "text-blue-200/80" : "text-blue-300/50"
                }`}
              >
                {cabin.description}
              </div>

              {/* 선택 표시 */}
              {isSelected && (
                <div className="absolute bottom-2 right-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      cabin.type === "premium" ? "bg-amber-500" : "bg-blue-500"
                    }`}
                  >
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 객실 특전 */}
      <div className="bg-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
        <span className="text-lg">
          {selected === "premium" ? "✨" : "🎫"}
        </span>
        <span className="text-xs text-blue-200/60">
          {selected === "premium"
            ? "프리미엄: 황홀한 선셋 뷰와 갈매기가 함께합니다"
            : "일반: 맑은 날씨의 청명한 바다를 감상하세요"}
        </span>
      </div>
    </div>
  );
}
