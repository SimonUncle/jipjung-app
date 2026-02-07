// Web Share API 유틸리티

import { VoyageTicket } from "@/types";
import { getPortById } from "./ports";

export function canShare(): boolean {
  return typeof navigator !== "undefined" && "share" in navigator;
}

export function canShareFiles(): boolean {
  return (
    canShare() &&
    typeof navigator !== "undefined" &&
    "canShare" in navigator &&
    navigator.canShare({ files: [new File([], "test.txt")] })
  );
}

interface ShareVoyageOptions {
  ticket: VoyageTicket;
  includeStats?: boolean;
  totalVoyages?: number;
  totalFocusMinutes?: number;
}

export async function shareVoyage(options: ShareVoyageOptions): Promise<boolean> {
  const { ticket, includeStats, totalVoyages, totalFocusMinutes } = options;

  const departurePort = getPortById(ticket.departurePortId);
  const arrivalPort = getPortById(ticket.arrivalPortId);

  if (!departurePort || !arrivalPort) return false;

  const title = `FocusVoyage - ${departurePort.nameKo} → ${arrivalPort.nameKo}`;

  let text = `🚢 ${departurePort.countryFlag} ${departurePort.nameKo} → ${arrivalPort.countryFlag} ${arrivalPort.nameKo}\n`;
  text += `⏱️ ${ticket.duration}분 집중 완료!\n`;
  text += `📍 ${ticket.distance.toLocaleString()}km 항해\n`;

  if (ticket.focusPurposeText) {
    text += `🎯 ${ticket.focusPurposeText}\n`;
  }

  if (includeStats && totalVoyages && totalFocusMinutes) {
    text += `\n📊 총 ${totalVoyages}회 항해 | ${Math.floor(totalFocusMinutes / 60)}시간 집중\n`;
  }

  text += "\n#FocusVoyage #집중 #생산성";

  if (!canShare()) {
    // Fallback: 클립보드에 복사
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  try {
    await navigator.share({
      title,
      text,
    });
    return true;
  } catch (error) {
    // 사용자가 취소한 경우
    if (error instanceof Error && error.name === "AbortError") {
      return false;
    }
    // 다른 에러: 클립보드 폴백
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}

// 통계 공유
export async function shareStats(
  totalVoyages: number,
  totalFocusMinutes: number,
  visitedPorts: number,
  longestStreak: number
): Promise<boolean> {
  const hours = Math.floor(totalFocusMinutes / 60);
  const minutes = totalFocusMinutes % 60;

  let text = `🚢 FocusVoyage 통계\n\n`;
  text += `📊 총 항해: ${totalVoyages}회\n`;
  text += `⏱️ 총 집중: ${hours}시간 ${minutes}분\n`;
  text += `🌍 방문 항구: ${visitedPorts}곳\n`;
  text += `🔥 최장 연속: ${longestStreak}일\n`;
  text += "\n#FocusVoyage #집중 #생산성";

  if (!canShare()) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  try {
    await navigator.share({
      title: "FocusVoyage 통계",
      text,
    });
    return true;
  } catch {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}
