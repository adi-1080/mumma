import type { Metadata, Viewport } from "next";
import { Lilita_One, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const lilita = Lilita_One({
  variable: "--font-lilita",
  subsets: ["latin"],
  weight: "400",
});

const nunito = Nunito({
  variable: "--font-nunito", 
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Mumma's Kitchen - AI Cooking Assistant",
  description: "Cook with Mumma - Step-by-step AI cooking assistant for beginners",
  themeColor: '#FFD966',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mumma\'s Kitchen',
  },
  openGraph: {
    title: 'Mumma\'s Kitchen - AI Cooking Assistant',
    description: 'Cook with Mumma - Step-by-step AI cooking assistant for beginners',
    type: 'website',
    locale: 'en_US',
    siteName: 'Mumma\'s Kitchen',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mumma\'s Kitchen - AI Cooking Assistant',
    description: 'Cook with Mumma - Step-by-step AI cooking assistant for beginners',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lilita.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream font-nunito text-dark">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
