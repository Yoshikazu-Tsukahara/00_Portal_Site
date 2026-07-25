import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { browserLikeHeaders, parsePublicHttpUrl } from "./safeUrl";
import {
  fetchYoutubeMeta,
  isWeakYoutubeTitle,
  isYoutubeUrl,
} from "./youtube";

export const runtime = "nodejs";

/** OGP 取得の上限（巨大 HTML を避ける） */
const MAX_BYTES = 1_500_000;
const FETCH_TIMEOUT_MS = 12_000;

type OgpResult = {
  url: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
};

type ClientHints = {
  title?: string;
  description?: string;
  image?: string;
};

function absUrl(maybe: string | undefined, base: URL): string | null {
  if (!maybe) return null;
  const trimmed = maybe.trim();
  if (!trimmed) return null;
  if (/^data:\s*,?$/i.test(trimmed) || trimmed === "data:,") return null;
  try {
    const abs = new URL(trimmed, base);
    if (abs.protocol !== "http:" && abs.protocol !== "https:") return null;
    return abs.href;
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

function pickLinkHref(
  $: cheerio.CheerioAPI,
  selectors: string[],
): string | undefined {
  for (const sel of selectors) {
    const val = $(sel).attr("href")?.trim();
    if (val) return val;
  }
  return undefined;
}

function readHints(body: unknown): ClientHints {
  if (!body || typeof body !== "object") return {};
  const o = body as Record<string, unknown>;
  const hints: ClientHints = {};
  if (typeof o.title === "string" && o.title.trim()) {
    hints.title = o.title.trim().slice(0, 200);
  }
  if (typeof o.description === "string" && o.description.trim()) {
    hints.description = o.description.trim().slice(0, 400);
  }
  if (typeof o.image === "string" && o.image.trim()) {
    hints.image = o.image.trim();
  }
  return hints;
}

function looksLikeChallengeHtml(html: string, title: string): boolean {
  const t = title.toLowerCase();
  if (t.includes("just a moment") || t.includes("attention required")) {
    return true;
  }
  if (t.includes("cloudflare") && html.length < 8000) return true;
  if (/cf-browser-verification|challenge-platform|__cf_chl/i.test(html)) {
    return true;
  }
  return false;
}

async function fetchHtml(target: URL): Promise<{
  ok: boolean;
  status: number;
  html: string;
  finalUrl: URL;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(target.href, {
      signal: controller.signal,
      redirect: "follow",
      headers: browserLikeHeaders(target),
      cache: "no-store",
    });

    const finalUrl = parsePublicHttpUrl(res.url) ?? target;
    if (!res.ok) {
      return { ok: false, status: res.status, html: "", finalUrl };
    }

    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > MAX_BYTES ? buf.slice(0, MAX_BYTES) : buf;
    const charset = /charset=([^\s;]+)/i.exec(
      res.headers.get("content-type") ?? "",
    )?.[1];
    let html: string;
    try {
      html = new TextDecoder(charset || "utf-8").decode(slice);
    } catch {
      html = new TextDecoder("utf-8").decode(slice);
    }

    return { ok: true, status: res.status, html, finalUrl };
  } finally {
    clearTimeout(timer);
  }
}

function parseOgp(html: string, finalUrl: URL): OgpResult {
  const $ = cheerio.load(html);

  const title =
    pickMeta($, [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'meta[itemprop="name"]',
    ]) ||
    $("title").first().text().trim() ||
    finalUrl.hostname;

  const description =
    pickMeta($, [
      'meta[property="og:description"]',
      'meta[name="description"]',
      'meta[name="twitter:description"]',
      'meta[itemprop="description"]',
    ]) || "";

  const image = absUrl(
    pickMeta($, [
      'meta[property="og:image:secure_url"]',
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'meta[name="twitter:image:src"]',
      'meta[itemprop="image"]',
    ]) ||
      pickLinkHref($, [
        'link[rel="image_src"]',
        'link[rel="apple-touch-icon"]',
      ]),
    finalUrl,
  );

  const siteName =
    pickMeta($, ['meta[property="og:site_name"]']) || finalUrl.hostname;

  const favicon = absUrl(
    pickLinkHref($, [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ]),
    finalUrl,
  );

  return {
    url: finalUrl.href,
    title: title.slice(0, 200),
    description: description.slice(0, 400),
    image,
    siteName,
    favicon,
  };
}

function mergeWithHints(
  base: Partial<OgpResult> & { url: string },
  hints: ClientHints,
  pageUrl: URL,
): OgpResult {
  const hintImage = hints.image ? absUrl(hints.image, pageUrl) : null;
  return {
    url: base.url,
    title: (base.title || hints.title || pageUrl.hostname).slice(0, 200),
    description: (base.description || hints.description || "").slice(0, 400),
    image: base.image || hintImage,
    siteName: base.siteName || pageUrl.hostname,
    favicon: base.favicon ?? null,
  };
}

function needsYoutubeEnrichment(result: OgpResult, pageUrl: URL): boolean {
  if (!isYoutubeUrl(pageUrl)) return false;
  if (!result.image) return true;
  if (isWeakYoutubeTitle(result.title)) return true;
  return false;
}

/** YouTube は oEmbed でタイトル／サムネを補完（本番スクレイプ失敗対策） */
async function applyYoutubeEnrichment(
  result: OgpResult,
  pageUrl: URL,
): Promise<OgpResult> {
  if (!needsYoutubeEnrichment(result, pageUrl)) return result;
  const yt = await fetchYoutubeMeta(pageUrl);
  if (!yt) return result;

  const weak = isWeakYoutubeTitle(result.title);
  return {
    ...result,
    title: weak ? yt.title : result.title,
    description: result.description || yt.description,
    image: result.image || yt.image,
    siteName: result.siteName || yt.siteName,
    favicon: result.favicon || "https://www.youtube.com/favicon.ico",
  };
}

async function youtubeOnlyResult(pageUrl: URL): Promise<OgpResult | null> {
  if (!isYoutubeUrl(pageUrl)) return null;
  const yt = await fetchYoutubeMeta(pageUrl);
  if (!yt) return null;
  return {
    url: pageUrl.href,
    title: yt.title,
    description: yt.description,
    image: yt.image,
    siteName: yt.siteName,
    favicon: "https://www.youtube.com/favicon.ico",
  };
}

/**
 * URL の HTML から OGP / 基本メタを抽出する。
 * クライアント直 fetch は CORS で失敗するため、サーバー側で取得する。
 * YouTube は oEmbed で本番でもタイトル／サムネを取れるようにする。
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

  const target = parsePublicHttpUrl(rawUrl);
  if (!target) {
    return NextResponse.json(
      { error: "invalid_url", message: "http(s) の公開 URL を指定してください" },
      { status: 400 },
    );
  }

  const hints = readHints(body);
  const hasHints = Boolean(hints.title || hints.image || hints.description);

  try {
    // YouTube は先に oEmbed（HTML スクレイプより確実）
    if (isYoutubeUrl(target)) {
      const ytFirst = await youtubeOnlyResult(target);
      if (ytFirst && !isWeakYoutubeTitle(ytFirst.title) && ytFirst.image) {
        return NextResponse.json(mergeWithHints(ytFirst, hints, target));
      }
    }

    let fetched = await fetchHtml(target);

    // 一時的な拒否は1回だけリトライ
    if (
      !fetched.ok &&
      (fetched.status === 403 ||
        fetched.status === 429 ||
        fetched.status === 503)
    ) {
      await new Promise((r) => setTimeout(r, 350));
      fetched = await fetchHtml(target);
    }

    if (fetched.ok && fetched.html) {
      const parsed = parseOgp(fetched.html, fetched.finalUrl);
      const challenged = looksLikeChallengeHtml(fetched.html, parsed.title);

      if (!challenged) {
        const merged = mergeWithHints(parsed, hints, fetched.finalUrl);
        const enriched = await applyYoutubeEnrichment(merged, target);
        return NextResponse.json(enriched);
      }
    }

    // スクレイプ失敗 → YouTube oEmbed / クライアントヒントで救済
    const ytFallback = await youtubeOnlyResult(target);
    if (ytFallback) {
      return NextResponse.json(mergeWithHints(ytFallback, hints, target));
    }

    if (hasHints) {
      return NextResponse.json(
        mergeWithHints(
          {
            url: target.href,
            title: hints.title,
            description: hints.description,
            image: null,
            siteName: target.hostname,
            favicon: null,
          },
          hints,
          target,
        ),
      );
    }

    if (!fetched.ok) {
      return NextResponse.json(
        {
          error: "fetch_failed",
          message: `サイトの取得に失敗しました（${fetched.status}）`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        error: "blocked",
        message:
          "サイトがボット対策中のため情報を取得できませんでした。ブックマークレットからの登録を試してください",
      },
      { status: 502 },
    );
  } catch (err) {
    const aborted =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.includes("abort"));

    const ytFallback = await youtubeOnlyResult(target);
    if (ytFallback) {
      return NextResponse.json(mergeWithHints(ytFallback, hints, target));
    }

    if (hasHints) {
      return NextResponse.json(
        mergeWithHints(
          {
            url: target.href,
            title: hints.title,
            description: hints.description,
            image: null,
            siteName: target.hostname,
            favicon: null,
          },
          hints,
          target,
        ),
      );
    }

    return NextResponse.json(
      {
        error: aborted ? "timeout" : "fetch_error",
        message: aborted
          ? "タイムアウトしました。別の URL を試してください"
          : "サイトの取得中にエラーが発生しました",
      },
      { status: aborted ? 504 : 502 },
    );
  }
}
