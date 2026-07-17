import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MINOXIPLUS — Free Hair Loss Assessment",
    template: "%s · MINOXIPLUS",
  },
  description:
    "MINOXIPLUS free hair loss assessment. Takes 90 seconds — find out the right routine for you.",
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
