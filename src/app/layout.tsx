import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import Header from "@/components/custom/Header";
import StartSh from "@/components/custom/StartSh";
import { TouchProvider } from "@/contexts/TouchContext";
import { ThemeColorProvider } from "@/contexts/ThemeColorContext";
import "./globals.css";

const geistSans = localFont({
  src: "../assets/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../assets/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const inter = Inter({ subsets: ["latin"] });

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
      className={`scroll-smooth ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeColorProvider>
          <TouchProvider>
            <StartSh>
              <Header />
              <main className="flex-grow">{children}</main>
            </StartSh>
          </TouchProvider>
        </ThemeColorProvider>
      </body>
    </html>
  );
}
