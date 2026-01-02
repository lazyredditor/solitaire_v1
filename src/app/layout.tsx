import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solitaire - Classic Klondike",
  description: "A premium, beautifully designed Klondike Solitaire web game with seeded shuffling and multiple themes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
