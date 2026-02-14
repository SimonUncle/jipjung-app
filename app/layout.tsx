import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

export const metadata: Metadata = {
  title: "Focus Submarine",
  description: "집중하면 잠수함이 목적지를 향해 잠항하는 감성 집중 타이머",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Focus Submarine",
  },
  openGraph: {
    title: "Focus Submarine",
    description: "집중하면 잠수함이 목적지를 향해 잠항하는 감성 집중 타이머",
    url: "https://jipjung.vercel.app",
    siteName: "Focus Submarine",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Focus Submarine",
    description: "집중하면 잠수함이 목적지를 향해 잠항하는 감성 집중 타이머",
    images: ["/og-image.png"],
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
          <AnalyticsTracker />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
