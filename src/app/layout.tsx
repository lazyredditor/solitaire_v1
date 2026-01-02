import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Play Solitaire Online - Classic Klondike Card Game",
  description: "Play Classic Solitaire (Klondike) online for free. A premium, beautifully designed card game with seeded shuffling, themes, and no download required.",
  keywords: ["solitaire", "play solitaire", "online solitaire", "classic solitaire", "klondike solitaire", "card games", "free solitaire"],
  openGraph: {
    title: "Play Solitaire Online - Classic Klondike Card Game",
    description: "Experience the best free online Solitaire game. Features seeded decks, unlimited undo, and beautiful themes.",
    type: "website",
  },
  manifest: "/manifest.json",
};

import Script from "next/script";

// TODO: Replace with your actual AdSense Publisher ID
const ADSENSE_PUBLISHER_ID = 'ca-pub-1501335036243375';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Script
          id="schema-org-game"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Classic Solitaire",
              "applicationCategory": "GameApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "Play Classic Klondike Solitaire online for free. Features a diverse range of themes, seeded decks for fair play, and unlimited undo.",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
              }
            })
          }}
        />
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        />
      </body>
    </html>
  );
}
