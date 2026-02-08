"use client";

import { useState } from "react";
import { Target, X } from "lucide-react";

interface GoalSettingModalProps {
  isOpen: boolean;
  currentDailyGoal: number;
  currentWeeklyGoal: number;
  onSave: (dailyMinutes: number, weeklyMinutes: number) => void;
  onClose: () => void;
}

export function GoalSettingModal({
  isOpen,
  currentDailyGoal,
  currentWeeklyGoal,
  onSave,
  onClose,
}: GoalSettingModalProps) {
  const [dailyGoal, setDailyGoal] = useState(currentDailyGoal);
  const [weeklyGoal, setWeeklyGoal] = useState(currentWeeklyGoal);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(dailyGoal, weeklyGoal);
    onClose();
  };

  const presetDaily = [30, 60, 90, 120];
  const presetWeekly = [180, 300, 420, 600];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">목표 설정</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          <div className="px-5 pb-5 space-y-6">
            {/* 일일 목표 */}
            <div>
              <label className="text-sm text-white/80 block mb-2">
                일일 목표 (분)
              </label>
              <div className="flex gap-2 mb-2">
                {presetDaily.map((val) => (
                  <button
                    key={val}
                    onClick={() => setDailyGoal(val)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      dailyGoal === val
                        ? "bg-cyan-500 text-white"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {val}분
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Math.max(10, Math.min(480, parseInt(e.target.value) || 10)))}
                min={10}
                max={480}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white text-center text-lg"
              />
            </div>

            {/* 주간 목표 */}
            <div>
              <label className="text-sm text-white/80 block mb-2">
                주간 목표 (분)
              </label>
              <div className="flex gap-2 mb-2">
                {presetWeekly.map((val) => (
                  <button
                    key={val}
                    onClick={() => setWeeklyGoal(val)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      weeklyGoal === val
                        ? "bg-blue-500 text-white"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {val >= 60 ? `${Math.floor(val / 60)}h` : `${val}m`}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Math.max(60, Math.min(2400, parseInt(e.target.value) || 60)))}
                min={60}
                max={2400}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white text-center text-lg"
              />
              <p className="text-xs text-white/40 text-center mt-1">
                {Math.floor(weeklyGoal / 60)}시간 {weeklyGoal % 60}분
              </p>
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500
                       text-white font-bold shadow-lg shadow-cyan-500/30
                       hover:from-cyan-400 hover:to-blue-400 transition-all"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
