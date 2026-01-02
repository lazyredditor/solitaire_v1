import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Solitaire (No Ads) - Fast & Lightweight Klondike",
  description: "Play Classic Solitaire (Klondike) online for free. A premium, ad-free, lightweight card game for Mac and Windows. Install as a PWA for offline play.",
  keywords: ["solitaire", "play solitaire", "online solitaire", "classic solitaire", "klondike solitaire", "card games", "free solitaire", "ad-free solitaire", "lightweight solitaire", "solitaire for mac", "solitaire for windows", "pwa solitaire", "offline solitaire"],
  openGraph: {
    title: "Free Solitaire (No Ads) - Fast & Lightweight Klondike",
    description: "Experience the best free online Solitaire game. Distraction-free, offline-capable, and beautiful. Install on any device.",
    type: "website",
    url: "https://solitaire.betterapp.org",
    siteName: "Better Solitaire",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Solitaire",
  },
  formatDetection: {
    telephone: false,
  },
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
            __html: JSON.stringify([
              {
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
              },
              {
                "@context": "https://schema.org",
                "@type": "VideoGame",
                "name": "Classic Solitaire",
                "genre": ["Card Game", "Solitaire", "Puzzle"],
                "playMode": "SinglePlayer",
                "applicationCategory": "Game",
                "operatingSystem": "Any",
                "description": "A lightweight, ad-free implementation of Classic Klondike Solitaire.",
                "url": "https://solitaire.betterapp.org",
                "sameAs": [
                  "https://en.wikipedia.org/wiki/Klondike_(solitaire)"
                ]
              }
            ])
          }}
        />
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
                    if ('serviceWorker' in navigator) {
                        window.addEventListener('load', function() {
                            navigator.serviceWorker.register('/sw.js').then(function(registration) {
                                console.log('ServiceWorker registration successful with scope: ', registration.scope);
                            }, function(err) {
                                console.log('ServiceWorker registration failed: ', err);
                            });
                        });
                    }
                `
          }}
        />
      </body>
    </html>
  );
}
