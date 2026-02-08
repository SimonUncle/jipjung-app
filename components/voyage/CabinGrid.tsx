"use client";

import { useState, useEffect, useRef } from "react";
import { getCabinsByType, type Cabin } from "@/lib/cabins";
import { type CabinType } from "@/types";

interface CabinGridProps {
  isOpen: boolean;
  cabinType: CabinType;
  onSelect: (cabinNumber: string) => void;
  onClose: () => void;
}

export function CabinGrid({
  isOpen,
  cabinType,
  onSelect,
  onClose,
}: CabinGridProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const cabins = getCabinsByType(cabinType);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus first cabin button when opened
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const firstButton = containerRef.current.querySelector('button[role="radio"]');
      (firstButton as HTMLElement)?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Group cabins by deck
  const cabinsByDeck = cabins.reduce((acc, cabin) => {
    if (!acc[cabin.deck]) {
      acc[cabin.deck] = [];
    }
    acc[cabin.deck].push(cabin);
    return acc;
  }, {} as Record<number, Cabin[]>);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cabin-grid-title"
    >
      <div ref={containerRef} className="w-full max-w-sm animate-in zoom-in-95 duration-300 my-auto">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          {/* Header */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="cabin-grid-title" className="text-xl font-bold text-white">객실 선택</h2>
                <p className="text-sm text-slate-400 mt-1">
                  {cabinType === "premium" ? "프리미엄 (오션뷰)" : "일반"} 객실
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                cabinType === "premium"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}>
                {cabinType === "premium" ? "Deck 1" : "Deck 2-3"}
              </div>
            </div>
          </div>

          {/* Ship Outline */}
          <div className="px-5 py-4">
            <div className="relative bg-slate-700/50 rounded-xl p-4">
              {/* Ship direction indicator */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-600 px-3 py-1 rounded-full">
                <span className="text-xs text-white/70">선수 (앞)</span>
              </div>

              {/* Deck sections */}
              {Object.entries(cabinsByDeck).map(([deck, deckCabins]) => (
                <div key={deck} className="mb-4 last:mb-0">
                  <p className="text-xs text-slate-400 mb-2">Deck {deck}</p>
                  <div role="radiogroup" aria-label={`Deck ${deck} 객실`} className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {deckCabins.map((cabin) => {
                      const isSelected = selected === cabin.number;
                      return (
                        <button
                          key={cabin.number}
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`객실 ${cabin.number}${cabin.isOceanView ? ", 오션뷰" : ""}`}
                          onClick={() => setSelected(cabin.number)}
                          className={`
                            relative aspect-square rounded-lg border-2 transition-all duration-200
                            flex flex-col items-center justify-center
                            ${
                              isSelected
                                ? cabinType === "premium"
                                  ? "border-amber-400 bg-amber-500/30"
                                  : "border-cyan-400 bg-cyan-500/30"
                                : "border-white/20 bg-white/5 hover:bg-white/10"
                            }
                          `}
                        >
                          <span className={`text-sm font-mono font-bold ${
                            isSelected ? "text-white" : "text-white/70"
                          }`}>
                            {cabin.number}
                          </span>
                          {cabin.isOceanView && (
                            <span className="text-[10px] text-amber-400 mt-0.5">
                              VIEW
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Ship direction indicator */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-600 px-3 py-1 rounded-full">
                <span className="text-xs text-white/70">선미 (뒤)</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/10 border border-white/20" />
                <span className="text-xs text-slate-400">선택 가능</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${
                  cabinType === "premium" ? "bg-amber-500/30 border border-amber-400" : "bg-cyan-500/30 border border-cyan-400"
                }`} />
                <span className="text-xs text-slate-400">선택됨</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="px-4 sm:px-5 pb-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 min-h-[44px] rounded-xl bg-white/10 text-white font-medium
                       hover:bg-white/20 transition-colors"
            >
              이전
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="flex-1 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500
                       text-white font-bold shadow-lg shadow-blue-500/30
                       hover:from-blue-400 hover:to-cyan-400 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
