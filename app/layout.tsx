import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

export const metadata: Metadata = {
  metadataBase: new URL("https://jipjung-app.vercel.app"),
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
    url: "https://jipjung-app.vercel.app",
    siteName: "Focus Submarine",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Focus Submarine",
    description: "집중하면 잠수함이 목적지를 향해 잠항하는 감성 집중 타이머",
  },
  verification: {
    google: "n-qG_vyFEswEHZFV0u53YBFwbPUFDa_cTqFCBrOAcIY",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Focus Submarine",
              description:
                "집중하면 잠수함이 목적지를 향해 잠항하는 감성 집중 타이머",
              url: "https://jipjung-app.vercel.app",
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "KRW",
              },
              inLanguage: "ko",
            }),
          }}
        />
      </head>
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
