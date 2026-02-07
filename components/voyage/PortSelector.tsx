"use client";

import { useState, useRef, useEffect } from "react";
import { Port, PORTS } from "@/lib/ports";
import { getPortUnlockTier } from "@/lib/portUnlocks";
import { Lock } from "lucide-react";

interface PortSelectorProps {
  selectedPort: Port | null;
  unlockedPorts: string[];
  excludePort?: Port | null;  // 제외할 항구 (출발↔목적지 충돌 방지)
  totalFocusMinutes?: number;
  onSelect: (port: Port) => void;
  label: string;
}

export function PortSelector({
  selectedPort,
  unlockedPorts,
  excludePort,
  totalFocusMinutes = 0,
  onSelect,
  label,
}: PortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // 모든 항구 표시 (제외 항구 필터링)
  const allPorts = PORTS.filter(
    (port) => !excludePort || port.id !== excludePort.id
  );

  const handlePortClick = (port: Port, isUnlocked: boolean) => {
    if (isUnlocked) {
      onSelect(port);
      setIsOpen(false);
    }
    // 잠긴 항구는 클릭해도 아무 동작 없음 (해금 조건만 표시)
  };

  return (
    <div className="relative">
      <label className="text-xs text-blue-300/70 mb-1 block">{label}</label>

      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selectedPort ? `${label}: ${selectedPort.nameKo}` : `${label} 선택`}
        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl
                   border border-white/20 text-left transition-all
                   hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
      >
        {selectedPort ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedPort.countryFlag}</span>
            <div>
              <p className="font-medium text-white">{selectedPort.nameKo}</p>
              <p className="text-xs text-blue-200/60">{selectedPort.country}</p>
            </div>
          </div>
        ) : (
          <span className="text-blue-200/50">항구를 선택하세요</span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
            aria-label="드롭다운 닫기"
            tabIndex={-1}
          />

          {/* Dropdown */}
          <div
            ref={dropdownRef}
            role="listbox"
            aria-label={label}
            className="absolute top-full left-0 right-0 mt-2 z-50
                          bg-slate-800/95 backdrop-blur-lg rounded-xl
                          border border-white/20 shadow-2xl
                          max-h-64 overflow-y-auto">
            {allPorts.map((port) => {
              const isUnlocked = unlockedPorts.includes(port.id);
              const unlockTier = getPortUnlockTier(port.id);
              const minutesRemaining = unlockTier
                ? unlockTier.requiredMinutes - totalFocusMinutes
                : 0;

              return (
                <button
                  key={port.id}
                  role="option"
                  aria-selected={selectedPort?.id === port.id}
                  aria-disabled={!isUnlocked}
                  onClick={() => handlePortClick(port, isUnlocked)}
                  className={`w-full px-4 py-3 flex items-center gap-3
                             transition-colors text-left
                             border-b border-white/5 last:border-b-0
                             ${isUnlocked
                               ? "hover:bg-white/10 cursor-pointer"
                               : "opacity-50 cursor-not-allowed"
                             }`}
                >
                  <span className={`text-2xl ${!isUnlocked ? "grayscale" : ""}`}>
                    {port.countryFlag}
                  </span>
                  <div className="flex-1">
                    <p className={`font-medium ${isUnlocked ? "text-white" : "text-white/50"}`}>
                      {port.nameKo}
                    </p>
                    {isUnlocked ? (
                      <p className="text-xs text-blue-200/60">{port.name}, {port.country}</p>
                    ) : (
                      <p className="text-xs text-amber-400/70">
                        {minutesRemaining}분 더 집중하면 해금
                      </p>
                    )}
                  </div>
                  {isUnlocked ? (
                    port.landmark && (
                      <span className="text-xs text-blue-300/50 hidden sm:block">
                        {port.landmark}
                      </span>
                    )
                  ) : (
                    <Lock className="w-4 h-4 text-amber-400/50" />
                  )}
                </button>
              );
            })}

            {allPorts.length === 0 && (
              <div className="px-4 py-6 text-center text-blue-200/50">
                <p>선택 가능한 항구가 없습니다</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
