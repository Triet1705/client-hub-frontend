import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

// Network disabled mock for Google Fonts
const inter = { variable: "font-inter", className: "font-inter" };
const spaceGrotesk = { variable: "font-space-grotesk", className: "font-space-grotesk" };
const jetbrainsMono = { variable: "font-jetbrains-mono", className: "font-jetbrains-mono" };

export const metadata: Metadata = {
  title: "Client Hub | Web3 Freelance Platform",
  description: "Secure, transparent freelance workspace built on Polygon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans bg-surface-base text-content-primary`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
