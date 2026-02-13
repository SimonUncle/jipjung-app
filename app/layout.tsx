import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Focus Submarine",
  description: "집중하면 잠수함이 목적지를 향해 잠항하는 감성 집중 타이머",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Focus Submarine",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-dark-bg text-white antialiased">
        <AuthProvider>
          <main className="min-h-screen flex flex-col">{children}</main>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
