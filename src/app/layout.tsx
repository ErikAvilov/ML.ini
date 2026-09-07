import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { ProgressProvider } from "@/lib/progress-context";
import { LocaleProvider } from "@/i18n/locale-context";
import { SiteHeader } from "@/components/ui/SiteHeader";
import "./globals.css";

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Source_Serif_4({
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
  title: "Mlini — École technique de l'IA",
  description:
    "Une école technique de l'IA déguisée en jeu vidéo. Construis ton premier système IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-theme="arcane-academy"
      className={`${body.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden bg-ml-bg-0 text-ml-text-body">
        <LocaleProvider>
          <ProgressProvider>
            <SiteHeader />
            <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
          </ProgressProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
