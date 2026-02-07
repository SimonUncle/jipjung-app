import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Focus Voyage - 집중 항해",
  description: "집중하면 배가 목적지를 향해 항해하는 감성 집중 타이머",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Focus Voyage",
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
      </body>
    </html>
  );
}
