import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MINOXIPLUS — Libreng Hair Loss Assessment",
    template: "%s · MINOXIPLUS",
  },
  description:
    "Libreng hair loss assessment ng MINOXIPLUS. 90 seconds lang — malalaman mo ang tamang routine para sa'yo.",
  applicationName: "MINOXIPLUS Assessment",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1f4d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  );
}
