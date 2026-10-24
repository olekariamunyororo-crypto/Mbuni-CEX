import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/opencex/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mbuni CEX — Spot Cryptocurrency Exchange",
  description:
    "Mbuni CEX — A modern, high-performance spot cryptocurrency exchange. Rust matching engine, Go services, React frontend. Professional CLOB terminal, swap, hybrid custody wallet, and admin back-office.",
  keywords: [
    "Mbuni CEX",
    "cryptocurrency exchange",
    "CLOB",
    "trading terminal",
    "Rust",
    "Go",
    "React",
    "matching engine",
  ],
  authors: [{ name: "Mbuni CEX Team" }],
  icons: {
    icon: "/ostrich.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
