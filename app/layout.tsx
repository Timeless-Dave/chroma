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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: "Chroma",
  description:
    "A clean, customizable AI chat workspace with knowledge-base and web modes.",
  icons: {
    icon: [{ url: "/brand/chroma-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/chroma-mark.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Chroma",
    description:
      "A clean, customizable AI chat workspace with knowledge-base and web modes.",
    images: [{ url: "/brand/chroma-logo.svg", width: 640, height: 160 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]"
      >
        {children}
      </body>
    </html>
  );
}
