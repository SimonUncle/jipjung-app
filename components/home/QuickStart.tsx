"use client";

import { Ship, Zap } from "lucide-react";
import { Port } from "@/lib/ports";

interface QuickStartProps {
  lastDestination: Port | null;
  onQuickStart: () => void;
}

export function QuickStart({ lastDestination, onQuickStart }: QuickStartProps) {
  if (!lastDestination) return null;

  return (
    <button
      onClick={onQuickStart}
      className="w-full py-4 px-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20
                 border border-cyan-400/30 rounded-2xl
                 hover:from-cyan-500/30 hover:to-blue-500/30
                 active:scale-[0.98] transition-all duration-200
                 flex items-center justify-center gap-3"
    >
      <div className="p-2 bg-cyan-500/20 rounded-full">
        <Zap className="w-5 h-5 text-cyan-400" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg">{lastDestination.countryFlag}</span>
        <span className="text-white font-medium">
          {lastDestination.nameKo} 다시 출항
        </span>
      </div>
      <Ship className="w-5 h-5 text-cyan-400 ml-auto" />
    </button>
  );
}
