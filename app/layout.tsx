import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Orbyt Rush | Less Busywork. More Possibilities.",
    template: "%s | Orbyt Rush",
  },
  description:
    "Instant access to industry-leading SEO, outreach, and research tools in one unified launchpad. Pay in PKR with flexible 1 to 30-day passes on Orbyt Rush.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          rel="preload"
          href="/fonts/material-symbols-outlined.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${plusJakarta.variable} font-sans antialiased bg-[#FAF9F5] text-neutral-900`}>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
