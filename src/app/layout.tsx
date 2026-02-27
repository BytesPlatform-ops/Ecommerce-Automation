import type { Metadata } from "next";
import { Inter, DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import "@uploadthing/react/styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Bytescart - AI-Powered Ecommerce Empire Builder",
  description: "Turn one idea into a live ecommerce empire. AI-powered store generation in 60 seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} ${playfair.variable} ${inter.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
