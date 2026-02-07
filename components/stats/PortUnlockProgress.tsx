"use client";

import { ClimbFocusData } from "@/types";
import { PORT_UNLOCK_TIERS, getNextUnlockInfo } from "@/lib/portUnlocks";
import { getPortById, PORTS } from "@/lib/ports";
import { Lock, Unlock, MapPin } from "lucide-react";
import { ProgressBar } from "@/components/ui";

interface PortUnlockProgressProps {
  data: ClimbFocusData;
}

export function PortUnlockProgress({ data }: PortUnlockProgressProps) {
  const totalMinutes = data.stats?.totalFocusMinutes || 0;
  const unlockedPorts = data.unlocks?.ports || ["busan", "osaka", "tokyo"];
  const nextUnlockInfo = getNextUnlockInfo(totalMinutes);

  // 다음에 해금될 항구 정보
  const nextPorts = nextUnlockInfo.nextTier?.portIds.map((id) => getPortById(id)).filter(Boolean) || [];

  return (
    <div className="bg-black/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          항구 해금
        </h3>
        <span className="text-xs text-white/60">
          {unlockedPorts.length} / {PORTS.length} 해금
        </span>
      </div>

      {/* 전체 진행률 바 */}
      <div className="mb-4">
        <ProgressBar
          value={unlockedPorts.length}
          max={PORTS.length}
          variant="primary"
        />
      </div>

      {/* 다음 해금 정보 */}
      {nextUnlockInfo.nextTier ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">다음 해금까지</span>
            <span className="text-cyan-400 font-medium">
              {nextUnlockInfo.minutesRemaining}분 남음
            </span>
          </div>

          {/* 다음 해금 항구들 */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-white/50 mb-2">
              {nextUnlockInfo.nextTier.requiredMinutes}분 달성 시 해금:
            </div>
            <div className="flex flex-wrap gap-2">
              {nextPorts.map((port) => port && (
                <div
                  key={port.id}
                  className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full"
                >
                  <span className="text-base">{port.countryFlag}</span>
                  <span className="text-xs text-white/80">{port.nameKo}</span>
                  <Lock className="w-3 h-3 text-white/30" />
                </div>
              ))}
            </div>
          </div>

          {/* 티어별 진행률 */}
          <ProgressBar
            value={nextUnlockInfo.progress}
            max={100}
            variant="primary"
            size="sm"
          />
        </div>
      ) : (
        <div className="text-center py-4">
          <Unlock className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 font-medium">모든 항구 해금 완료!</p>
          <p className="text-xs text-white/50 mt-1">세계 일주가 가능합니다</p>
        </div>
      )}

      {/* 해금 티어 목록 (접힌 상태) */}
      <details className="mt-4">
        <summary className="text-xs text-white/40 cursor-pointer hover:text-white/60">
          전체 해금 조건 보기
        </summary>
        <div className="mt-3 space-y-2 text-xs">
          {PORT_UNLOCK_TIERS.map((tier, index) => {
            const tierPorts = tier.portIds.map((id) => getPortById(id)).filter(Boolean);
            const isUnlocked = totalMinutes >= tier.requiredMinutes;

            return (
              <div
                key={index}
                className={`flex items-center justify-between py-1.5 px-2 rounded ${
                  isUnlocked ? "bg-green-500/10" : "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <Unlock className="w-3 h-3 text-green-400" />
                  ) : (
                    <Lock className="w-3 h-3 text-white/30" />
                  )}
                  <span className={isUnlocked ? "text-white/80" : "text-white/50"}>
                    {tier.requiredMinutes}분
                  </span>
                </div>
                <div className="flex gap-1">
                  {tierPorts.map((port) => port && (
                    <span key={port.id} title={port.nameKo}>
                      {port.countryFlag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
