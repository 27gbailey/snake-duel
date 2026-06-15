import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ARENA_VERSION } from "@/lib/game/constants";
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
  title: "Snake.IO",
  description: "Single-player Snake.IO arena — trap rivals and steal their points",
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
            __html: `(function(){var k="snake-arena-version";var v="${ARENA_VERSION}";var p=localStorage.getItem(k);if(p&&p!==v){localStorage.setItem(k,v);location.reload();}else{localStorage.setItem(k,v);}})();`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
