import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthProvider";
import CesaAssistant from "@/components/CesaAssistant";

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
    url: "https://cesa.unison.mx",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased overflow-x-hidden w-full">
        <AuthProvider>
          {children}
          <CesaAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
