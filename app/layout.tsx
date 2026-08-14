import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "$KORAT | The lucky cat on Robinhood Chain",
  description:
    "Meet $KORAT, the silver-blue good luck cat bringing centuries of Thai lore to Robinhood Chain.",
  openGraph: {
    title: "$KORAT | The lucky cat on Robinhood Chain",
    description: "Ancient luck. Sharp eyes. Onchain energy.",
    images: [{ url: "/images/korat-hero.png", width: 1680, height: 945 }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={mono.variable}>{children}</body>
    </html>
  );
}
