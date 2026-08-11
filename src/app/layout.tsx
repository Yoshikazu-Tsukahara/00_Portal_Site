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

const SITE_TITLE = "Blank Note";
const SITE_DESCRIPTION =
  "日々の「めんどくさい」から脱却、登録不要・完全無料の業務ハックツール箱。サーバーへのデータ送信なしで実務でも安心です。";

/** OGP 用の絶対 URL 解決。本番は Vercel / NEXT_PUBLIC_SITE_URL を優先 */
const siteUrl = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
})();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_TITLE,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1024,
        height: 703,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
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
