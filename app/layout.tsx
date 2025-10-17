import Script from "next/script";
import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentKit demo",
  description: "Demo of ChatKit with hosted workflow",
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dancing = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`antialiased ${inter.variable} ${dancing.variable} ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
