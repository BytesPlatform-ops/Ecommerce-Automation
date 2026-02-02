import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@uploadthing/react/styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Chameleon - Create Your Store in 60 Seconds",
  description: "Multi-tenant SaaS platform for creating customized e-commerce storefronts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
