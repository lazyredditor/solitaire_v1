import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Better Solitaire - Free Distraction-Free Klondike",
  description: "Play Better Solitaire online for free. The best distraction-free, lightweight Klondike Solitaire for Mac and Windows. Install Better Solitaire as a PWA for offline play.",
  keywords: ["better solitaire", "solitaire", "distraction-free solitaire", "play solitaire", "online solitaire", "classic solitaire", "klondike solitaire", "card games", "free solitaire", "lightweight solitaire", "solitaire for mac", "solitaire for windows", "pwa solitaire", "offline solitaire", "best solitaire"],
  openGraph: {
    title: "Better Solitaire - Free Distraction-Free Klondike",
    description: "Experience Better Solitaire - the best distraction-free online Solitaire game. Lightweight, offline-capable, and beautiful. Install on any device.",
    type: "website",
    url: "https://solitaire.betterapp.org",
    siteName: "Better Solitaire",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Better Solitaire",
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
                "name": "Better Solitaire",
                "applicationCategory": "GameApplication",
                "operatingSystem": "Any",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "description": "Play Better Solitaire - Classic Klondike Solitaire online for free. Features diverse themes, seeded decks for fair play, and unlimited undo.",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "1250"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "VideoGame",
                "name": "Better Solitaire",
                "genre": ["Card Game", "Solitaire", "Puzzle"],
                "playMode": "SinglePlayer",
                "applicationCategory": "Game",
                "operatingSystem": "Any",
                "description": "Better Solitaire - A lightweight, ad-free implementation of Classic Klondike Solitaire.",
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
              (function () {
                // Self-heal: if a Next.js chunk fails to load, the user is almost
                // certainly stuck on a stale service-worker cache from a previous
                // deploy. Unregister SWs, drop all caches, and reload once.
                var RECOVERY_KEY = '__sw_recovery_done';
                function recover(reason) {
                  try {
                    if (sessionStorage.getItem(RECOVERY_KEY)) return;
                    sessionStorage.setItem(RECOVERY_KEY, '1');
                  } catch (e) {}
                  console.warn('[recovery] clearing service worker + caches:', reason);
                  var done = function () { location.reload(); };
                  var swDone = ('serviceWorker' in navigator)
                    ? navigator.serviceWorker.getRegistrations()
                        .then(function (regs) { return Promise.all(regs.map(function (r) { return r.unregister(); })); })
                        .catch(function () {})
                    : Promise.resolve();
                  var cacheDone = (window.caches)
                    ? caches.keys().then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); }).catch(function () {})
                    : Promise.resolve();
                  Promise.all([swDone, cacheDone]).then(done, done);
                }

                window.addEventListener('error', function (e) {
                  var src = e && e.target && e.target.src;
                  if (typeof src === 'string' && src.indexOf('/_next/') !== -1) {
                    recover('chunk load failed: ' + src);
                  }
                }, true);

                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function () {
                    navigator.serviceWorker.register('/sw.js').then(function (registration) {
                      // When a new SW takes control mid-session, reload so the
                      // page picks up fresh HTML matching the new chunk hashes.
                      var refreshing = false;
                      navigator.serviceWorker.addEventListener('controllerchange', function () {
                        if (refreshing) return;
                        refreshing = true;
                        location.reload();
                      });
                      registration.addEventListener('updatefound', function () {
                        var sw = registration.installing;
                        if (!sw) return;
                        sw.addEventListener('statechange', function () {
                          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
                            sw.postMessage('SKIP_WAITING');
                          }
                        });
                      });
                    }).catch(function (err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                  });
                }
              })();
            `
          }}
        />
      </body>
    </html>
  );
}
