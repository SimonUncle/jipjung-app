import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "도착 | Focus Submarine",
  robots: { index: false },
};

export default function ArrivalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
