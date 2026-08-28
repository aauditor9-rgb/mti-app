import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const beatrice = localFont({
  variable: "--font-display",
  src: [
    { path: "./fonts/Beatrice-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/Beatrice-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Beatrice-Medium.woff2", weight: "500", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "MTI Maktab",
  description: "Madrasah Talimuddin Islam — maktab management system",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${beatrice.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
