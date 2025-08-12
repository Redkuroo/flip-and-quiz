import type { Metadata } from "next";
import { Chivo, Tinos } from "next/font/google";
import "./globals.css";

const chivo = Chivo({
  variable: "--font-chivo",
  subsets: ["latin"],
  display: "swap",
});

const tinos = Tinos({
  variable: "--font-tinos",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Flip & Quiz",
  description: "A colorful, responsive flip card quiz built with Next.js + Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
  <body className={`${chivo.variable} ${tinos.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
