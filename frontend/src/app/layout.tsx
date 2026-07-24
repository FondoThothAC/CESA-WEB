import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthProvider";
import CesaAssistant from "@/components/CesaAssistant";
import Script from "next/script";


export const metadata: Metadata = {
  metadataBase: new URL("https://cesaunison.fondothoth.com"),
  title: "CESA UNISON | Consejo Estudiantil 2026-2028",
  description: "Portal oficial del Consejo Estudiantil de Sociedades de Alumnos de la Universidad de Sonora. Transformación digital y servicios estudiantiles.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CESA UNISON",
  },
  openGraph: {
    title: "CESA UNISON | Portal Institucional",
    description: "Servicios estudiantiles, Muro Social, Bazar y más. Universidad de Sonora.",
    url: "https://cesaunison.fondothoth.com",
    siteName: "CESA Web",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CESA UNISON 2026-2028",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CESA UNISON",
    description: "Consejo Estudiantil de Sociedades de Alumnos",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico?v=2",
    apple: "/icons/icon-192x192.png?v=2",
  }
};

import PwaRegister from "@/components/PwaRegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NWF6JLRK');
          `}
        </Script>

        {/* Microsoft Clarity Tracking Script */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "x6lrp5ohbx");
          `}
        </Script>

        {/* Google AdSense */}
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6563043041010743"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Google Analytics Tracking Script */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="antialiased overflow-x-hidden w-full">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-NWF6JLRK"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <AuthProvider>
          {children}
          <CesaAssistant />
          <PwaRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
