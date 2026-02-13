import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { RouteProvider } from "@/providers/route-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Domio",
  description: "Alles-in-één vastgoedbeheerplatform voor vastgoedbeheerders, huurders en verhuurders",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/images/offerla.png', sizes: 'any', type: 'image/png' },
    ],
    apple: [
      { url: '/images/offerla.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [
      { url: '/images/offerla.png', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/images/offerla.png',
        color: '#9AFF7C',
      },
    ],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        {/* Theme color for browser chrome */}
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="mask-icon" href="/images/offerla.png" color="#9AFF7C" />
        <link rel="preconnect" href="https://consent.cookiebot.com" />
        <link rel="dns-prefetch" href="https://consent.cookiebot.com" />
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="89ee426f-246b-433f-beee-676fb434af4f"
          data-blockingmode="auto"
          data-culture="NL"
          strategy="lazyOnload"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <RouteProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </RouteProvider>
      </body>
    </html>
  );
}
