import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "부상 | Focus Submarine",
  robots: { index: false },
};

export default function FailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
