import { Noto_Sans_JP, Space_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import SiteChrome from "@/components/SiteChrome";
import {
  fromUrlLocale,
  I18nProvider,
  toHrefLang,
  URL_LOCALES,
  type UrlLocale,
} from "@/i18n";
import { LAYOUT_MODE_BOOTSTRAP_SCRIPT, LayoutProvider } from "@/lib/layout";

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

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

/** 対応言語だけ静的生成 */
export function generateStaticParams() {
  return URL_LOCALES.map((lang) => ({ lang }));
}

/**
 * 言語プレフィックス付きルートのレイアウト。
 * URL の `[lang]` を `<html lang>` と I18nProvider に渡す。
 */
export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  const locale = fromUrlLocale(lang);
  if (!locale) notFound();

  const hrefLang = toHrefLang(locale);
  const urlLang = lang.toLowerCase() as UrlLocale;

  return (
    <html
      lang={hrefLang}
      className={`${spaceMono.variable} ${notoSansJp.variable} h-full antialiased`}
      // bootstrap が data-layout-mode を付けるため、属性不一致を許容する
      suppressHydrationWarning
      data-url-lang={urlLang}
    >
      <head>
        {/* ペイント前に表示幅を復元（遷移・リロード時の「標準」フラッシュ防止） */}
        <script
          dangerouslySetInnerHTML={{ __html: LAYOUT_MODE_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--background)] font-sans text-[var(--foreground)]">
        <I18nProvider initialLocale={locale}>
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
