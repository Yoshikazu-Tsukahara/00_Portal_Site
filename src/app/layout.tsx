import type { Metadata } from "next";
import { Noto_Sans_JP, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SiteChrome from "@/components/SiteChrome";
import { I18nProvider } from "@/i18n";
import { LAYOUT_MODE_BOOTSTRAP_SCRIPT, LayoutProvider } from "@/lib/layout";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blank Note",
  description:
    "入力・ファイルは端末内で処理する個人開発ツールを、文房具テイストのランチャーでまとめたポータルサイトです。",
  icons: {
    icon: [
      { url: "/icons/blank-note-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/blank-note-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/blank-note-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/blank-note-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${spaceMono.variable} ${notoSansJp.variable} h-full antialiased`}
      // bootstrap が data-layout-mode を付けるため、属性不一致を許容する
      suppressHydrationWarning
    >
      <head>
        {/* ペイント前に表示幅を復元（遷移・リロード時の「標準」フラッシュ防止） */}
        <script
          dangerouslySetInnerHTML={{ __html: LAYOUT_MODE_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--background)] font-sans text-[var(--foreground)]">
        <I18nProvider>
          <LayoutProvider>
            <SiteChrome>{children}</SiteChrome>
          </LayoutProvider>
        </I18nProvider>
        {/* Cookie 不使用の匿名アクセス解析（Vercel Analytics） */}
        <Analytics />
      </body>
    </html>
  );
}
