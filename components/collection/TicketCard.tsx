"use client";

import { VoyageTicket } from "@/types";
import { getPortById } from "@/lib/ports";
import { Ship, Clock, MapPin } from "lucide-react";

interface TicketCardProps {
  ticket: VoyageTicket;
  onClick?: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const departurePort = getPortById(ticket.departurePortId);
  const arrivalPort = getPortById(ticket.arrivalPortId);

  if (!departurePort || !arrivalPort) return null;

  // 날짜 포맷
  const date = new Date(ticket.date);
  const dateStr = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // 포트 코드 (처음 3글자 대문자)
  const fromCode = departurePort.id.slice(0, 3).toUpperCase();
  const toCode = arrivalPort.id.slice(0, 3).toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`
        bg-gradient-to-br from-slate-800/90 to-slate-900/90
        border border-white/10 rounded-xl p-4
        hover:border-cyan-400/30 transition-all cursor-pointer
        ${onClick ? "hover:scale-[1.02]" : ""}
      `}
    >
      {/* 헤더: 날짜 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/50">{dateStr}</span>
        <Ship className="w-4 h-4 text-cyan-400" />
      </div>

      {/* 항로 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <div className="text-2xl mb-1">{departurePort.countryFlag}</div>
          <div className="text-lg font-bold text-white">{fromCode}</div>
          <div className="text-xs text-white/60">{departurePort.nameKo}</div>
        </div>

        <div className="flex-1 px-3">
          <div className="relative">
            <div className="h-px bg-gradient-to-r from-cyan-400/50 via-cyan-400 to-cyan-400/50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border border-cyan-400/50">
                <span className="text-xs">✈️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl mb-1">{arrivalPort.countryFlag}</div>
          <div className="text-lg font-bold text-white">{toCode}</div>
          <div className="text-xs text-white/60">{arrivalPort.nameKo}</div>
        </div>
      </div>

      {/* 정보 */}
      <div className="flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{ticket.duration}분</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{ticket.distance.toLocaleString()}km</span>
        </div>
        {ticket.cabinNumber && (
          <span className="text-cyan-400/70">#{ticket.cabinNumber}</span>
        )}
      </div>

      {/* 집중 목적 */}
      {ticket.focusPurposeText && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <span className="text-xs text-cyan-300/70">{ticket.focusPurposeText}</span>
        </div>
      )}
    </div>
  );
}
