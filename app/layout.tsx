import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "orisige 販売店マップ | 茨城県伝統工芸品 河内町 杉折箱",
  description: "茨城県伝統工芸品 河内町杉折箱のorisige商品を取り扱う販売店を地図で確認できます。道の駅や神社で伝統の杉製品をお買い求めいただけます。",
  keywords: "orisige,オリシゲ,茨城県,伝統工芸品,杉折箱,河内町,販売店,道の駅,工芸品",
  openGraph: {
    title: "orisige 販売店マップ | 茨城県伝統工芸品 河内町 杉折箱",
    description: "茨城県伝統工芸品 河内町杉折箱のorisige商品を取り扱う販売店を地図で確認できます。道の駅や神社で伝統の杉製品をお買い求めいただけます。",
    type: "website",
    locale: "ja_JP",
    siteName: "orisige 販売店マップ",
    url: "https://map.orisige.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "orisige 販売店マップ | 茨城県伝統工芸品 河内町 杉折箱",
    description: "茨城県伝統工芸品 河内町杉折箱のorisige商品を取り扱う販売店を地図で確認できます。道の駅や神社で伝統の杉製品をお買い求めいただけます。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
