import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Silke Pilon | Full Stack Developer",
  description:
    "Full stack developer based in the Netherlands. I build polished React interfaces, Node.js backends, and Linux servers. Open source contributor.",
  authors: [{ name: "Silke Pilon" }],
  keywords: [
    "full stack developer",
    "React",
    "Node.js",
    "Next.js",
    "open source",
    "Netherlands",
  ],
  openGraph: {
    title: "Silke Pilon | Full Stack Developer",
    description:
      "Full stack developer based in the Netherlands. I build polished React interfaces, Node.js backends, and Linux servers.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Silke Pilon | Full Stack Developer",
    description:
      "Full stack developer based in the Netherlands. I build polished React interfaces, Node.js backends, and Linux servers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
