import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Playfair_Display,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { ProgressProvider } from "@/lib/progress-context";
import { LocaleProvider } from "@/i18n/locale-context";
import { SiteAtmosphere } from "@/components/ui/SiteAtmosphere";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import {
  HeaderAuth,
  HeaderAuthFallback,
} from "@/components/ui/HeaderAuth";
import { LEGAL_SITE_URL } from "@/data/legal/constants";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(LEGAL_SITE_URL),
  title: "Mlini — Apprends l'IA en la construisant",
  description:
    "Plateforme interactive pour apprendre l'IA par la pratique. Progresse à travers des Royaumes, résous des missions et construis de vrais systèmes.",
};

/** Run serverless functions near Neon (eu-central-1), not us-east by default. */
export const preferredRegion = "fra1";

/**
 * Root layout must NOT await getAuthIdentity().
 * Auth chrome streams via Suspense so /skills and other pages are not blocked
 * by Better Auth + Neon profile/progress (~1.5s+ when sequential on cold path).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-theme="adventure-tech"
      className={`${body.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="relative flex h-dvh flex-col overflow-hidden bg-ml-bg-0 text-ml-text-body">
        <SiteAtmosphere />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <LocaleProvider>
            <ProgressProvider>
              <SiteHeader
                authSlot={
                  <Suspense fallback={<HeaderAuthFallback />}>
                    <HeaderAuth />
                  </Suspense>
                }
              />
              <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
              <SiteFooter />
            </ProgressProvider>
          </LocaleProvider>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
