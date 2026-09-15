import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Güneş Sistemi Simülasyonu",
  description:
    "Gerçek yörünge dönemleriyle çalışan interaktif güneş sistemi simülasyonu. Gezegenleri keşfedin, zamanı hızlandırın, kuyruklu yıldızı izleyin.",
  keywords: [
    "güneş sistemi",
    "simülasyon",
    "gezegenler",
    "astronomi",
    "samanyolu",
    "3d",
    "interaktif",
    "teoriler",
  ],
  authors: [{ name: "Z.ai Team" }],
  openGraph: {
    title: "Güneş Sistemi Simülasyonu",
    description: "İnteraktif güneş sistemi simülasyonu",
    siteName: "Güneş Sistemi Simülasyonu",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
