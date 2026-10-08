import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { AppProviders } from "@/lib/AppContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Duolingo – learn Spanish the fun way",
  description: "A Duolingo-style language learning app: skill path, lessons, XP, streaks and hearts.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#58cc02" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
