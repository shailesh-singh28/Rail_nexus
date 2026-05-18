import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DevToolHider from "@/components/DevToolHider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RailNexus | Telecom Maintenance System",
  description: "Advanced maintenance and reporting system for railway telecommunication assets.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <DevToolHider />
        {children}
      </body>
    </html>
  );
}
