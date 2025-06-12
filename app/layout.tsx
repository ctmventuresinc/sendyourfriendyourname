import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "KATEGORIE",
  description: "Challenge your friends to a word game",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "KATEGORIE",
    description: "Challenge your friends to a word game",
    images: [
      {
        url: "/share-card.png",
        width: 1200,
        height: 630,
        alt: "KATEGORIE - Challenge your friends to a word game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KATEGORIE",
    description: "Challenge your friends to a word game",
    images: ["/share-card.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
