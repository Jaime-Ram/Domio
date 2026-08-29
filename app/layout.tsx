import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { RouteProvider } from "@/providers/route-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Domio",
  description: "Alles-in-één vastgoedbeheerplatform voor vastgoedbeheerders, huurders en verhuurders",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f4" },
    { media: "(prefers-color-scheme: dark)", color: "#262626" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Theme color for browser chrome */}
        <meta name="theme-color" content="#f4f4f4" />
        {process.env.NODE_ENV === 'production' && (
          <>
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
          </>
        )}
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
