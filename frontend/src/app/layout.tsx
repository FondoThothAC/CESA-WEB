import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/useAuth";

export const metadata: Metadata = {
  title: "CESA UNISON | Consejo Estudiantil 2026-2028",
  description: "Portal oficial del Consejo Estudiantil de Sociedades de Alumnos de la Universidad de Sonora.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
