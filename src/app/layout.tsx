import type { Metadata } from "next";
import { Inter, DM_Sans, Playfair_Display } from "next/font/google";
import Script from "next/script";
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
  title: "Bytescart - The Fastest Way to Build an Ecommerce Store",
  description: "Turn one idea into a live ecommerce store. Launch in 60 seconds with everything you need built in.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P12DQ0HH5K"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P12DQ0HH5K');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${dmSans.variable} ${playfair.variable} ${inter.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
