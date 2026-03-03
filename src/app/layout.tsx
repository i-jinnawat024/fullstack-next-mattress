import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { Toaster } from "sonner";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import "./globals.css";

const prompt = Prompt({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mattress City — ใบหม่อน",
  description: "Sales Companion: ค้นหาราคา แสดงของแถมและโปรบัตร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} ${prompt.className} antialiased`}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <Toaster richColors position="top-center" />
        {children}
      </body>
    </html>
  );
}
