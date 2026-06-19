import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GAME_VERSION } from "@/features/game/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Slice & Serve — Pizza Restaurant Simulator",
  description:
    "Run your own pizza restaurant. Take orders, build custom pizzas, manage inventory, and grow your reputation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var k="slice-serve-version";var v="${GAME_VERSION}";var prev=localStorage.getItem(k);localStorage.removeItem("snake-arena-version");if(prev&&prev!==v){localStorage.setItem(k,v);location.reload();}else{localStorage.setItem(k,v);}})();`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
