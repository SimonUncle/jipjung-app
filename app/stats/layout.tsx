import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내 기록 | Focus Submarine",
  description: "집중 통계, 주간 차트, 업적을 확인하세요",
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
