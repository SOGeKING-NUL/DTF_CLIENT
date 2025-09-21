import { Roboto_Mono, Figtree, Instrument_Serif } from "next/font/google";
import { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import mockDataJson from "@/mock.json";
import type { MockData } from "@/types/dashboard";
import { MobileChat } from "@/components/chat/mobile-chat";

const mockData = mockDataJson as MockData;

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

// const rebelGrotesk = localFont({
//   src: "../public/fonts/Rebels-Fett.woff2",
//   variable: "--font-rebels",
//   display: "swap",
// });

export const metadata: Metadata = {
  title: {
    template: "%s – OSMO",
    default: "OSMO",
  },
  description:
    "OSMO lets you compose on‑chain token baskets with rules and rebalancing. Diversify, automate, and invest in crypto narratives with index‑grade simplicity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preload"
          href="/fonts/Rebels-Fett.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
html {
  font-family: ${figtree.style.fontFamily};
  --font-sans: ${figtree.variable};
  --font-mono: ${GeistMono.variable};
  --font-instrument-serif: ${instrumentSerif.variable};
}
          `
        }} />
      </head>
      <body
        className={`${figtree.variable} ${instrumentSerif.variable} ${robotoMono.variable} antialiased`}
      >
        <SidebarProvider>
          <MobileHeader mockData={mockData} />
          <div className="w-full">
            {children}
          </div>

          <MobileChat />
        </SidebarProvider>
      </body>
    </html>
  );
}
