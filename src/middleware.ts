import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE } from "@/i18n/localeMeta";
import {
  getLocaleFromPathname,
  localizedHref,
  matchAcceptLanguageHeader,
  stripLocalePrefix,
} from "@/i18n/localePath";

/**
 * `[lang]` 配下へ App Router のページを移し終えたら true。
 * false の間は言語付き URL を既存ルートへ rewrite する（移行用）。
 */
const LOCALE_APP_ROUTER_READY = true;

/**
 * 言語プレフィックス処理をスキップするパス。
 * API・Next 内部・サイトマップ・拡張子付き静的ファイルなど。
 */
function shouldSkipLocale(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/sitemap.xml" || pathname === "/robots.txt") return true;
  if (pathname === "/favicon.ico") return true;
  // 拡張子付き（/icons/foo.png, /og.png, /sw.js など）
  const last = pathname.split("/").pop() ?? "";
  if (last.includes(".")) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipLocale(pathname)) {
    return NextResponse.next();
  }

  const pathLocale = getLocaleFromPathname(pathname);

  // すでに /[lang]/...
  if (pathLocale) {
    if (LOCALE_APP_ROUTER_READY) {
      return NextResponse.next();
    }
    // 移行中: URL は言語付きのまま、内部は既存ページへ
    const bare = stripLocalePrefix(pathname);
    const url = request.nextUrl.clone();
    url.pathname = bare;
    return NextResponse.rewrite(url);
  }

  // プレフィックス無し → Accept-Language（非対応は en）でリダイレクト
  const detected = matchAcceptLanguageHeader(
    request.headers.get("accept-language"),
  );
  const locale = detected ?? DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = localizedHref(locale, pathname);
  // 移行期は 307。公開後に恒久化する場合は 308 を検討
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: [
    /*
     * 次を除外:
     * - api
     * - _next/static, _next/image
     * - 拡張子付きファイル
     */
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
  ],
};
