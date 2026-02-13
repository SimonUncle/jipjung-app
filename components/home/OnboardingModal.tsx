"use client";

import { useState, useEffect } from "react";
import { SubmarineIcon } from "@/components/submarine/SubmarineIcon";
import { Anchor, Eye, Clock, X } from "lucide-react";

interface OnboardingModalProps {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "bg-black/70 backdrop-blur-sm" : "bg-transparent"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-white/10 overflow-hidden transition-all duration-200 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 text-white/50 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header illustration */}
        <div className="relative bg-gradient-to-b from-blue-950 to-slate-800 px-6 pt-8 pb-6 text-center overflow-hidden">
          {/* Bubbles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-300/20 rounded-full animate-ping"
              style={{
                left: `${15 + (i * 11) % 70}%`,
                top: `${20 + (i * 13) % 60}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: "3s",
              }}
            />
          ))}

          <SubmarineIcon size={64} className="mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white">Focus Submarine</h2>
          <p className="text-blue-300/70 text-sm mt-1">
            집중하면 잠수함이 항해합니다
          </p>
        </div>

        {/* Features */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Anchor className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">항구를 선택하고 잠항</p>
              <p className="text-xs text-white/50 mt-0.5">
                전세계 항구를 목적지로 선택하면 거리에 따라 집중 시간이 정해져요
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Eye className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">화면을 벗어나면 실패</p>
              <p className="text-xs text-white/50 mt-0.5">
                다른 앱이나 탭으로 전환하면 3초 안에 돌아와야 해요
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">집중하면 새 항구 해금</p>
              <p className="text-xs text-white/50 mt-0.5">
                누적 집중 시간이 늘면 새로운 항구와 업적이 해금돼요
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={handleClose}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-base shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-400 active:scale-[0.98]"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
