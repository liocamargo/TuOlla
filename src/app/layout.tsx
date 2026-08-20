import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tu Olla",
  description: "Planificá tu menú semanal y tu lista de compras",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
