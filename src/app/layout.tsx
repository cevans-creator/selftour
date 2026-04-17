import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Montserrat, Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KeySherpa — Self-Guided Tour Software for Homebuilders",
    template: "%s | KeySherpa",
  },
  description: "KeySherpa automates self-guided home tours for homebuilders. Smart lock hubs, AI visitor Q&A, automated access codes, and full tour analytics — so buyers can tour 24/7.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.keysherpa.io"),
  keywords: [
    "self-guided tours", "self-guided home tours", "homebuilder tour software",
    "self-tour technology", "smart lock tours", "model home tours",
    "home tour automation", "new construction tours", "tour scheduling software",
    "UTour alternative", "self-tour platform", "homebuilder SaaS",
    "Z-Wave smart lock", "AI tour assistant", "self-guided touring",
  ],
  authors: [{ name: "KeySherpa" }],
  creator: "KeySherpa",
  publisher: "KeySherpa",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.keysherpa.io",
    siteName: "KeySherpa",
    title: "KeySherpa — Self-Guided Tour Software for Homebuilders",
    description: "Smart lock hubs, AI visitor Q&A, automated access codes, and tour analytics. Buyers tour 24/7 while your sales team focuses on closing.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KeySherpa — Self-Guided Tour Software for Homebuilders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KeySherpa — Self-Guided Tour Software for Homebuilders",
    description: "Smart lock hubs, AI visitor Q&A, automated access codes, and tour analytics. Buyers tour 24/7.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.keysherpa.io",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${montserrat.variable} ${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-DX24YYMJBB" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-DX24YYMJBB');`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
