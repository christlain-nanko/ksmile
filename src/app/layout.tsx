import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { brand } from "@/lib/brand";
import "./globals.css";

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

const siteTitle = "Ksmile · Beauté, soins & essentiels";
const siteDescription =
  "Catalogue de droguerie en ligne au Cameroun (Odza). Hygiène, beauté, cheveux, bébé et maison. Préparez votre panier, nous confirmons votre demande.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s · Ksmile",
  },
  description: siteDescription,
  applicationName: "Ksmile",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Ksmile",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-share.png",
        width: 1200,
        height: 630,
        alt: "Catalogue Ksmile — beauté, soins et essentiels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-share.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ksmile",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/brand/icon-32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-48.png?v=3", sizes: "48x48", type: "image/png" },
      { url: "/brand/pwa-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/pwa-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/brand/icon-180.png?v=3", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: brand.green,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        {children}
        <PwaProvider />
      </body>
    </html>
  );
}
