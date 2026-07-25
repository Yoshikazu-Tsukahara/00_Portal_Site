import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** OGP 取得の上限（巨大 HTML を避ける） */
const MAX_BYTES = 1_500_000;
const FETCH_TIMEOUT_MS = 10_000;

type OgpResult = {
  url: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
};

function isHttpUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

function absUrl(maybe: string | undefined, base: URL): string | null {
  if (!maybe) return null;
  const trimmed = maybe.trim();
  if (!trimmed) return null;
  // 空 data URI などは無効扱い
  if (/^data:\s*,?$/i.test(trimmed) || trimmed === "data:,") return null;
  try {
    return new URL(trimmed, base).href;
  } catch {
    return null;
  }
}

function pickMeta(
  $: cheerio.CheerioAPI,
  selectors: string[],
): string | undefined {
  for (const sel of selectors) {
    const val = $(sel).attr("content")?.trim();
    if (val) return val;
  }
  return undefined;
}

/**
 * URL の HTML から OGP / 基本メタを抽出する。
 * クライアント直 fetch は CORS で失敗するため、サーバー側で取得する。
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "JSON ボディが必要です" },
      { status: 400 },
    );
  }

  const rawUrl =
    typeof body === "object" &&
    body !== null &&
    "url" in body &&
    typeof (body as { url: unknown }).url === "string"
      ? (body as { url: string }).url.trim()
      : "";

  const target = isHttpUrl(rawUrl);
  if (!target) {
    return NextResponse.json(
      { error: "invalid_url", message: "http(s) の URL を指定してください" },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(target.href, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MyToolBoxLinkStocker/1.0; +https://localhost)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "fetch_failed",
          message: `サイトの取得に失敗しました（${res.status}）`,
        },
        { status: 502 },
      );
    }

    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > MAX_BYTES ? buf.slice(0, MAX_BYTES) : buf;
    const charset = /charset=([^\s;]+)/i.exec(
      res.headers.get("content-type") ?? "",
    )?.[1];
    const html = new TextDecoder(charset || "utf-8").decode(slice);

    const $ = cheerio.load(html);
    const finalUrl = isHttpUrl(res.url) ?? target;

    const title =
      pickMeta($, [
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
      ]) ||
      $("title").first().text().trim() ||
      finalUrl.hostname;

    const description =
      pickMeta($, [
        'meta[property="og:description"]',
        'meta[name="description"]',
        'meta[name="twitter:description"]',
      ]) || "";

    const image = absUrl(
      pickMeta($, [
        'meta[property="og:image:secure_url"]',
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
      ]),
      finalUrl,
    );

    const siteName =
      pickMeta($, ['meta[property="og:site_name"]']) || finalUrl.hostname;

    const favicon = absUrl(
      $('link[rel="icon"]').attr("href") ||
        $('link[rel="shortcut icon"]').attr("href") ||
        $('link[rel="apple-touch-icon"]').attr("href"),
      finalUrl,
    );

    const payload: OgpResult = {
      url: finalUrl.href,
      title: title.slice(0, 200),
      description: description.slice(0, 400),
      image,
      siteName,
      favicon,
    };

    return NextResponse.json(payload);
  } catch (err) {
    const aborted =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.includes("abort"));
    return NextResponse.json(
      {
        error: aborted ? "timeout" : "fetch_error",
        message: aborted
          ? "タイムアウトしました。別の URL を試してください"
          : "サイトの取得中にエラーが発生しました",
      },
      { status: aborted ? 504 : 502 },
    );
  } finally {
    clearTimeout(timer);
  }
}
