import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Mario Party - Camera Game",
  description: "An interactive web game using your camera, inspired by Super Mario Party",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

