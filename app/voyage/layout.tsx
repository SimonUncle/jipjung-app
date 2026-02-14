import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "잠항 중 | Focus Submarine",
  robots: { index: false },
};

export default function VoyageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
