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
  title: "Mumma's Kitchen",
  description: "Cook with Mumma - Step-by-step AI cooking assistant for beginners",
  manifest: '/manifest.json',
  icons: {
    icon: '/mummalogo.png',
    shortcut: '/mummalogo.png',
    apple: '/mummalogo.png',
  },
  themeColor: '#FFD966',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mumma\'s Kitchen',
    startupImage: '/mummalogo.png',
  },
  openGraph: {
    title: 'Mumma\'s Kitchen',
    description: 'Cook with Mumma - Step-by-step AI cooking assistant for beginners',
    type: 'website',
    locale: 'en_US',
    siteName: 'Mumma\'s Kitchen',
    images: [
      {
        url: '/mummalogo.png',
        width: 512,
        height: 512,
        alt: 'Mumma\'s Kitchen Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mumma\'s Kitchen',
    description: 'Cook with Mumma - Step-by-step AI cooking assistant for beginners',
    images: ['/mummalogo.png'],
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
      <head>
        <link rel="icon" type="image/png" href="/mummalogo.png?v=2" />
        <link rel="shortcut icon" type="image/png" href="/mummalogo.png?v=2" />
        <link rel="apple-touch-icon" type="image/png" href="/mummalogo.png?v=2" />
      </head>
      <body className="min-h-full flex flex-col bg-cream font-nunito text-dark">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
