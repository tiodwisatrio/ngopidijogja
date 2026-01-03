import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://wfcjogja.vercel.app'), // Ganti dengan domain production Anda
  title: {
    default: 'WFC Jogja - WiFi Friendly Cafe di Yogyakarta',
    template: '%s | WFC Jogja'
  },
  description: 'Temukan cafe dengan WiFi cepat dan nyaman untuk bekerja di Yogyakarta. Direktori lengkap WiFi Friendly Cafe (WFC) dengan informasi lokasi, harga, fasilitas, dan jam buka.',
  keywords: [
    'cafe jogja',
    'wifi friendly cafe yogyakarta',
    'tempat kerja wifi jogja',
    'coworking space jogja',
    'cafe wifi cepat yogyakarta',
    'cafe untuk kerja jogja',
    'tempat nongkrong wifi jogja',
    'wfc jogja',
    'cafe laptop friendly yogyakarta',
    'tempat meeting cafe jogja'
  ],
  authors: [{ name: 'WFC Jogja Team' }],
  creator: 'WFC Jogja',
  publisher: 'WFC Jogja',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://wfcjogja.vercel.app',
    siteName: 'WFC Jogja',
    title: 'WFC Jogja - WiFi Friendly Cafe di Yogyakarta',
    description: 'Temukan cafe dengan WiFi cepat dan nyaman untuk bekerja di Yogyakarta. Direktori lengkap cafe dengan informasi lokasi, harga, fasilitas, dan jam buka.',
    images: [
      {
        url: '/og-image.png', // Buat file ini nanti
        width: 1200,
        height: 630,
        alt: 'WFC Jogja - WiFi Friendly Cafe Yogyakarta',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WFC Jogja - WiFi Friendly Cafe di Yogyakarta',
    description: 'Temukan cafe dengan WiFi cepat dan nyaman untuk bekerja di Yogyakarta',
    images: ['/og-image.png'],
    creator: '@wfcjogja', // Ganti dengan Twitter handle Anda
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://wfcjogja.vercel.app',
  },
  verification: {
    google: 'your-google-verification-code', // Tambahkan setelah verifikasi Google Search Console
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'WFC Jogja',
              description: 'Direktori WiFi Friendly Cafe di Yogyakarta',
              url: 'https://wfcjogja.vercel.app',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://wfcjogja.vercel.app/?q={search_term_string}'
                },
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'WFC Jogja',
              description: 'Platform pencarian WiFi Friendly Cafe di Yogyakarta',
              url: 'https://wfcjogja.vercel.app',
              logo: 'https://wfcjogja.vercel.app/logo.png',
              sameAs: [
                'https://www.instagram.com/wfcjogja',
                'https://twitter.com/wfcjogja',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                availableLanguage: ['Indonesian']
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
