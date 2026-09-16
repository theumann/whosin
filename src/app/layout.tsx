import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const description = "Event Attendance Management and WhatsApp Group Notifications";

export const metadata: Metadata = {
  // Absolute base for the Open Graph image URL, so link previews resolve it.
  metadataBase: new URL("https://whosin.team"),
  title: "whosIn",
  description,
  manifest: "/manifest.webmanifest",
  openGraph: { type: "website", siteName: "whosIn", title: "whosIn", description },
  twitter: { card: "summary_large_image", title: "whosIn", description },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="m-0 bg-slate-50 font-sans text-slate-900 antialiased">
        <div className="pb-16">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
