import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const blockFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-block",
});

export const metadata: Metadata = {
  title: "Create Earth",
  description: "Create Earth — build your world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={blockFont.variable}>{children}</body>
    </html>
  );
}
