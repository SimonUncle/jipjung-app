"use client";

import { Port } from "@/lib/ports";
import { getDistanceBetween } from "@/lib/routes";
import { StoredFocusPurpose } from "@/stores/voyageStore";
import { Ship, Anchor } from "lucide-react";

interface BoardingPassProps {
  departurePort: Port;
  arrivalPort: Port;
  duration: number;
  cabinNumber: string | null;
  focusPurpose: StoredFocusPurpose | null;
  customPurposeText?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

// Port code generator (first 3 letters)
function getPortCode(port: Port): string {
  return port.id.slice(0, 3).toUpperCase();
}

export function BoardingPass({
  departurePort,
  arrivalPort,
  duration,
  cabinNumber,
  focusPurpose,
  customPurposeText,
  onConfirm,
  onCancel,
}: BoardingPassProps) {
  const distance = getDistanceBetween(departurePort.id, arrivalPort.id);
  const today = new Date();
  const dateStr = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\. /g, "/").replace(".", "");

  const purposeText = focusPurpose?.id === "custom" && customPurposeText
    ? customPurposeText
    : focusPurpose?.labelKo ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-in zoom-in-95 duration-300">
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-blue-100/70 uppercase tracking-widest">
                  Boarding Pass
                </p>
                <p className="text-lg font-bold text-white">승선권</p>
              </div>
              <Ship className="w-8 h-8 text-white/80" />
            </div>
          </div>

          <div className="px-5 py-5">
            {/* Route - Airport code style */}
            <div className="flex items-center justify-between mb-6">
              {/* Departure */}
              <div className="text-left">
                <p className="text-3xl font-bold font-mono text-white tracking-wider">
                  {getPortCode(departurePort)}
                </p>
                <p className="text-sm text-slate-400">{departurePort.nameKo}</p>
              </div>

              {/* Arrow */}
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-px bg-gradient-to-r from-transparent to-cyan-400" />
                  <Ship className="w-5 h-5 text-cyan-400" />
                  <div className="w-8 h-px bg-gradient-to-r from-cyan-400 to-transparent" />
                </div>
              </div>

              {/* Arrival */}
              <div className="text-right">
                <p className="text-3xl font-bold font-mono text-white tracking-wider">
                  {getPortCode(arrivalPort)}
                </p>
                <p className="text-sm text-slate-400">{arrivalPort.nameKo}</p>
              </div>
            </div>

            {/* Dashed separator with notches */}
            <div className="relative my-5">
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/70 rounded-full" />
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/70 rounded-full" />
              <div className="border-t-2 border-dashed border-white/10" />
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Cabin */}
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                  Cabin
                </p>
                <p className="text-xl font-bold font-mono text-white">
                  {cabinNumber ?? "-"}
                </p>
              </div>

              {/* Duration */}
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                  Duration
                </p>
                <p className="text-xl font-bold font-mono text-cyan-400">
                  {duration}
                  <span className="text-sm text-cyan-400/70 ml-1">min</span>
                </p>
                <p className="text-xs text-slate-400">
                  {distance.toLocaleString()} km
                </p>
              </div>
            </div>

            {/* Focus Purpose */}
            {focusPurpose && (
              <div className="bg-white/5 rounded-lg p-3 mb-5">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                  Focus Purpose
                </p>
                <p className="text-lg font-medium text-white">
                  {purposeText}
                </p>
              </div>
            )}

            {/* Date and Boarding */}
            <div className="flex justify-between text-xs">
              <div>
                <p className="text-slate-500 uppercase tracking-wider">Date</p>
                <p className="text-white font-mono">{dateStr}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 uppercase tracking-wider">Boarding</p>
                <p className="text-green-400 font-medium">Now</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="px-5 pb-5 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium
                       hover:bg-white/20 transition-colors"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500
                       text-white font-bold shadow-lg shadow-blue-500/30
                       hover:from-blue-400 hover:to-cyan-400 transition-all
                       flex items-center justify-center gap-2"
            >
              <Anchor className="w-4 h-4" />
              출항하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
