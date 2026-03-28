import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevMap — Tu Waze de Código",
  description: "Transforma tus ideas en rutas de desarrollo épicas con IA. Elimina la parálisis y empieza a construir hoy mismo.",
  openGraph: {
    title: "DevMap — Tu Waze de Código",
    description: "Rutas de desarrollo visuales impulsadas por IA estilo quest.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevMap",
    description: "Visualiza tu próximo gran proyecto con DevMap.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
