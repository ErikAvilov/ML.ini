import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Inter,
} from "next/font/google";
import { LocaleProvider } from "@/i18n/locale-context";
import { getRequestLocale } from "@/i18n/get-request-locale";
import { SiteAtmosphere } from "@/components/ui/SiteAtmosphere";
import { AppSessionShell } from "@/components/auth/AppSessionShell";
import { AppSessionShellFallback } from "@/components/auth/AppSessionShellFallback";
import { LEGAL_SITE_URL } from "@/data/legal/constants";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

/** Body + headings (Editorial Cartographic — product-wide). */
const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Kept for CSS variable continuity; display remaps to Jakarta site-wide. */
const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/** Interface / body copy site-wide. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(LEGAL_SITE_URL),
  title: "Mlini — Learn AI by building it",
  description:
    "Interactive platform to learn AI by practicing. Progress through Kingdoms, complete missions, and build real systems.",
};

/** Run serverless functions near Neon (eu-central-1), not us-east by default. */
export const preferredRegion = "fra1";

/**
 * Locale cookie is cheap; auth+progress stream via Suspense.
 * Fallback never renders SIGN IN or local XP as authenticated truth.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html
      lang={locale}
      data-theme="editorial-cartographic"
      className={`${body.variable} ${display.variable} ${mono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="relative flex h-dvh flex-col overflow-hidden bg-ml-canvas text-ml-text-body">
        <SiteAtmosphere />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <LocaleProvider initialLocale={locale}>
            <Suspense
              fallback={
                <AppSessionShellFallback>{children}</AppSessionShellFallback>
              }
            >
              <AppSessionShell>{children}</AppSessionShell>
            </Suspense>
          </LocaleProvider>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
