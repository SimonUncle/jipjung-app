"use client";

import { useState } from "react";
import { TimerMode, TIMER_MODES, TEST_MODE } from "@/lib/timerModes";
import { useTimerStore } from "@/stores/timerStore";
import { Toggle, Input, Button } from "@/components/ui";

interface ModeSelectorProps {
  onModeSelect?: (mode: TimerMode) => void;
  showTestMode?: boolean;
}

export function ModeSelector({ onModeSelect, showTestMode = false }: ModeSelectorProps) {
  const {
    timerMode,
    setTimerMode,
    customFocusMinutes,
    customShortBreakMinutes,
    customLongBreakMinutes,
    setCustomTimerSettings,
    isAutoCycleEnabled,
    setAutoCycleEnabled,
  } = useTimerStore();

  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [customFocus, setCustomFocus] = useState(customFocusMinutes);
  const [customShortBreak, setCustomShortBreak] = useState(customShortBreakMinutes);
  const [customLongBreak, setCustomLongBreak] = useState(customLongBreakMinutes);

  const modes = showTestMode ? [...TIMER_MODES, TEST_MODE] : TIMER_MODES;

  const handleModeSelect = (mode: TimerMode) => {
    setTimerMode(mode.id);

    if (mode.id === "custom") {
      setShowCustomSettings(true);
    } else {
      setShowCustomSettings(false);
    }

    onModeSelect?.(mode);
  };

  const handleCustomSave = () => {
    setCustomTimerSettings(customFocus, customShortBreak, customLongBreak);
    setShowCustomSettings(false);
  };

  return (
    <div className="space-y-4">
      {/* 모드 선택 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeSelect(mode)}
            className={`
              relative p-4 rounded-xl text-left transition-all
              ${timerMode.id === mode.id
                ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400"
                : "bg-white/5 border border-white/10 hover:bg-white/10"
              }
            `}
          >
            {/* 선택 표시 */}
            {timerMode.id === mode.id && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full" />
            )}

            {/* 아이콘 & 이름 */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{mode.icon}</span>
              <span className="font-medium text-white">{mode.nameKo}</span>
            </div>

            {/* 설명 */}
            <p className="text-sm text-white/60">{mode.description}</p>

            {/* 상세 시간 (커스텀 제외) */}
            {mode.id !== "custom" && (
              <div className="mt-2 flex gap-2 text-xs">
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">
                  {mode.focusMinutes}분
                </span>
                <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded">
                  +{mode.shortBreakMinutes}분 휴식
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 커스텀 설정 패널 */}
      {timerMode.id === "custom" && showCustomSettings && (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
          <h3 className="font-medium text-white">커스텀 설정</h3>

          <div className="space-y-3">
            <Input
              type="number"
              label="집중 시간 (분)"
              value={customFocus}
              onChange={(e) => setCustomFocus(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={120}
            />
            <Input
              type="number"
              label="짧은 휴식 (분)"
              value={customShortBreak}
              onChange={(e) => setCustomShortBreak(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={30}
            />
            <Input
              type="number"
              label="긴 휴식 (분) - 4회 후"
              value={customLongBreak}
              onChange={(e) => setCustomLongBreak(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={60}
            />
          </div>

          <Button onClick={handleCustomSave} fullWidth size="sm">
            저장
          </Button>
        </div>
      )}

      {/* 자동 반복 토글 */}
      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
        <Toggle
          checked={isAutoCycleEnabled}
          onChange={setAutoCycleEnabled}
          label="자동 반복"
          description="완료 후 자동으로 휴식 → 다음 세션 시작"
        />
      </div>

      {/* 현재 선택 요약 */}
      <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">{timerMode.icon}</span>
          <div>
            <p className="text-white font-medium">
              {timerMode.nameKo} 모드
            </p>
            <p className="text-xs text-white/60">
              {timerMode.id === "custom"
                ? `${customFocusMinutes}분 집중 + ${customShortBreakMinutes}분 휴식`
                : `${timerMode.focusMinutes}분 집중 + ${timerMode.shortBreakMinutes}분 휴식`
              }
              {isAutoCycleEnabled && " (자동 반복)"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
