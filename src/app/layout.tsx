import type { Metadata } from "next";
import { Archivo, Syne } from "next/font/google";
import { CartProvider } from "@/components/seydehwon/cart-provider";
import { CartDrawer } from "@/components/seydehwon/cart-drawer";
import { FloatingNav } from "@/components/seydehwon/floating-nav";
import { SiteHeader } from "@/components/seydehwon/site-header";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const archivo = Archivo({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SEYDEHWON® — Virtual Store",
  description:
    "Interactive virtual clothing store demo for Seydehwon — visionary fashion from Detroit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <CartProvider>
          <SiteHeader />
          {children}
          <FloatingNav />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
