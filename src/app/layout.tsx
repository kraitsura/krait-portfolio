import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Inter, Roboto_Mono, Playfair_Display, Press_Start_2P } from "next/font/google";
import Header from "@/components/custom/Header";
import VideoPreloader from "@/components/VideoPreloader";
import { GlobalKeybinds } from "@/components/GlobalKeybinds";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TouchProvider } from "@/contexts/TouchContext";
import { ThemeColorProvider } from "@/contexts/ThemeColorContext";
import { AppThemeProvider } from "@/contexts/AppThemeContext";
import { RocketSceneProvider } from "@/contexts/RocketSceneContext";
import "./globals.css";

const geistSans = localFont({
  src: "../assets/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: 'swap',
});

const geistMono = localFont({
  src: "../assets/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-roboto-mono',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-playfair',
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-press-start',
});

export const metadata: Metadata = {
  title: "kraitsura",
  description: "Created by Aarya",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`scroll-smooth ${geistSans.variable} ${geistMono.variable} ${inter.variable} ${robotoMono.variable} ${playfair.variable} ${pressStart2P.variable}`}
    >
      <head>
        {process.env.NODE_ENV === "development" && (
          <>
            <Script
              src="//unpkg.com/react-grab/dist/index.global.js"
              strategy="beforeInteractive"
            />
            <Script
              src="//unpkg.com/@react-grab/claude-code/dist/client.global.js"
              strategy="lazyOnload"
            />
          </>
        )}
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider>
          <AppThemeProvider>
            <ThemeColorProvider>
              <TouchProvider>
                <RocketSceneProvider>
                  <GlobalKeybinds />
                  <VideoPreloader />
                  <Header />
                  <main className="flex-grow">{children}</main>
                </RocketSceneProvider>
              </TouchProvider>
            </ThemeColorProvider>
          </AppThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
