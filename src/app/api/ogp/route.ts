import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import {
  faviconFallbackUrl,
  headersForProfile,
  parsePublicHttpUrl,
  type FetchProfileName,
} from "./safeUrl";
import {
  fetchYoutubeMeta,
  isWeakYoutubeTitle,
  isYoutubeUrl,
} from "./youtube";

export const runtime = "nodejs";

/** OGP 取得の上限（巨大 HTML を避ける） */
const MAX_BYTES = 1_500_000;
const FETCH_TIMEOUT_MS = 12_000;

/** 本番で通りやすい順。SNS クローラー UA を先に試す */
const FETCH_PROFILES: FetchProfileName[] = [
  "facebook",
  "twitter",
  "slack",
  "browser",
];

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
  const trimmed = maybe.trim().replace(/^<|>$/g, "");
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
  if (
    t.includes("just a moment") ||
    t.includes("attention required") ||
    t.includes("access denied") ||
    t.includes("permission denied") ||
    t.includes("robot check") ||
    t.includes("are you a robot") ||
    t.includes("verify you are human") ||
    t.includes("checking your browser")
  ) {
    return true;
  }
  if (t.includes("cloudflare") && html.length < 12_000) return true;
  if (
    /cf-browser-verification|challenge-platform|__cf_chl|captcha-delivery|hcaptcha|challenges\.cloudflare/i.test(
      html,
    )
  ) {
    return true;
  }
  // ほぼ空のチャレンジシェル
  if (html.length < 1500 && /enable javascript|ddos protection/i.test(html)) {
    return true;
  }
  return false;
}

/** JSON-LD から title / image / description を拾う（OGP 欠落サイト向け） */
function pickFromJsonLd(
  $: cheerio.CheerioAPI,
  base: URL,
): Partial<Pick<OgpResult, "title" | "description" | "image">> {
  const out: Partial<Pick<OgpResult, "title" | "description" | "image">> = {};

  $('script[type="application/ld+json"]').each((_, el) => {
    if (out.title && out.image) return;
    const raw = $(el).contents().text().trim();
    if (!raw) return;
    try {
      const parsed: unknown = JSON.parse(raw);
      const nodes = flattenJsonLd(parsed);
      for (const node of nodes) {
        if (!out.title) {
          const t =
            asString(node.headline) ||
            asString(node.name) ||
            asString(node.title);
          if (t) out.title = t.slice(0, 200);
        }
        if (!out.description) {
          const d = asString(node.description);
          if (d) out.description = d.slice(0, 400);
        }
        if (!out.image) {
          const img = firstImageFromJsonLd(node.image, base);
          if (img) out.image = img;
        }
      }
    } catch {
      // JSON-LD 破損は無視
    }
  });

  return out;
}

function flattenJsonLd(value: unknown): Record<string, unknown>[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((v) => flattenJsonLd(v));
  }
  if (typeof value !== "object") return [];
  const obj = value as Record<string, unknown>;
  const graph = obj["@graph"];
  if (Array.isArray(graph)) {
    return [obj, ...graph.flatMap((v) => flattenJsonLd(v))];
  }
  return [obj];
}

function asString(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

function firstImageFromJsonLd(value: unknown, base: URL): string | null {
  if (!value) return null;
  if (typeof value === "string") return absUrl(value, base);
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstImageFromJsonLd(item, base);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    return (
      absUrl(asString(o.url), base) ||
      absUrl(asString(o.contentUrl), base) ||
      absUrl(asString(o["@id"]), base)
    );
  }
  return null;
}

async function fetchHtml(
  target: URL,
  profile: FetchProfileName,
): Promise<{
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
      headers: headersForProfile(profile, target),
      cache: "no-store",
    });

    const finalUrl = parsePublicHttpUrl(res.url) ?? target;
    if (!res.ok) {
      return { ok: false, status: res.status, html: "", finalUrl };
    }

    const contentType = res.headers.get("content-type") || "";
    // HTML 以外（PDF 直リンク等）はパース対象外
    if (
      contentType &&
      !/text\/html|application\/xhtml|application\/xml|text\/xml/i.test(
        contentType,
      ) &&
      !/text\/plain/i.test(contentType)
    ) {
      return { ok: false, status: res.status, html: "", finalUrl };
    }

    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > MAX_BYTES ? buf.slice(0, MAX_BYTES) : buf;
    const charset = /charset=([^\s;]+)/i.exec(contentType)?.[1];
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

/** HTML 内の oEmbed エンドポイント URL を探す */
function findOembedEndpoint($: cheerio.CheerioAPI, base: URL): string | null {
  const href =
    pickLinkHref($, [
      'link[rel="alternate"][type="application/json+oembed"]',
      'link[type="application/json+oembed"]',
      'link[rel="alternate"][type="text/json+oembed"]',
    ]) ||
    undefined;
  return absUrl(href, base);
}

async function fetchOembed(
  endpoint: string,
): Promise<Partial<Pick<OgpResult, "title" | "description" | "image">> | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (compatible; LinkStockerBot/1.0)",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      title?: string;
      author_name?: string;
      provider_name?: string;
      thumbnail_url?: string;
    };
    const title = json.title?.trim();
    if (!title && !json.thumbnail_url) return null;
    return {
      title: title
        ? title.slice(0, 200)
        : json.author_name
          ? `${json.author_name}${json.provider_name ? ` · ${json.provider_name}` : ""}`.slice(
              0,
              200,
            )
          : undefined,
      description: json.author_name
        ? `${json.author_name}${json.provider_name ? ` · ${json.provider_name}` : ""}`.slice(
            0,
            400,
          )
        : undefined,
      image: json.thumbnail_url || undefined,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function parseOgp(html: string, finalUrl: URL): OgpResult {
  const $ = cheerio.load(html);
  const jsonLd = pickFromJsonLd($, finalUrl);

  const title =
    pickMeta($, [
      'meta[property="og:title"]',
      'meta[name="og:title"]',
      'meta[name="twitter:title"]',
      'meta[property="twitter:title"]',
      'meta[itemprop="name"]',
      'meta[name="title"]',
    ]) ||
    jsonLd.title ||
    $("title").first().text().trim() ||
    finalUrl.hostname;

  const description =
    pickMeta($, [
      'meta[property="og:description"]',
      'meta[name="og:description"]',
      'meta[name="description"]',
      'meta[name="twitter:description"]',
      'meta[property="twitter:description"]',
      'meta[itemprop="description"]',
    ]) ||
    jsonLd.description ||
    "";

  const image = absUrl(
    pickMeta($, [
      'meta[property="og:image:secure_url"]',
      'meta[property="og:image:url"]',
      'meta[property="og:image"]',
      'meta[name="og:image"]',
      'meta[name="twitter:image"]',
      'meta[name="twitter:image:src"]',
      'meta[property="twitter:image"]',
      'meta[itemprop="image"]',
      'meta[name="thumbnail"]',
    ]) ||
      pickLinkHref($, [
        'link[rel="image_src"]',
        'link[rel="thumbnail"]',
        'link[rel="apple-touch-icon"]',
      ]) ||
      jsonLd.image ||
      undefined,
    finalUrl,
  );

  const siteName =
    pickMeta($, [
      'meta[property="og:site_name"]',
      'meta[name="og:site_name"]',
      'meta[name="application-name"]',
    ]) || finalUrl.hostname;

  const favicon =
    absUrl(
      pickLinkHref($, [
        'link[rel="apple-touch-icon"]',
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
      ]),
      finalUrl,
    ) || faviconFallbackUrl(finalUrl.hostname);

  return {
    url: finalUrl.href,
    title: title.replace(/\s+/g, " ").slice(0, 200),
    description: description.replace(/\s+/g, " ").slice(0, 400),
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
  const host = (() => {
    try {
      return new URL(base.url).hostname;
    } catch {
      return pageUrl.hostname;
    }
  })();

  return {
    url: base.url,
    title: (base.title || hints.title || host).slice(0, 200),
    description: (base.description || hints.description || "").slice(0, 400),
    image: base.image || hintImage,
    siteName: base.siteName || host,
    favicon: base.favicon || faviconFallbackUrl(host),
  };
}

/** 結果の充実度（高いほど採用） */
function scoreOgp(result: OgpResult, pageUrl: URL): number {
  let score = 0;
  const host = pageUrl.hostname.replace(/^www\./, "").toLowerCase();
  const title = result.title.trim();
  const titleLower = title.toLowerCase();
  const hostLower = host.toLowerCase();

  if (!title) return 0;
  if (looksLikeChallengeHtml("", title)) return 0;

  if (titleLower === hostLower || titleLower === `www.${hostLower}`) {
    score += 0;
  } else if (titleLower.includes(hostLower) && title.length < host.length + 8) {
    score += 1;
  } else {
    score += 3;
  }

  if (result.image) score += 4;
  if (result.description && result.description.length > 20) score += 1;
  if (result.siteName && result.siteName !== pageUrl.hostname) score += 1;

  // タイトルがドメイン丸出しより少しマシ、程度
  if (score === 0 && title.length > 0) score = 1;
  return score;
}

function isUsefulOgp(result: OgpResult, pageUrl: URL): boolean {
  return scoreOgp(result, pageUrl) >= 3;
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
 * 複数 UA で順に取得し、いちばん充実した OGP を返す。
 * 本番 IP だとブラウザ UA だけだと弾かれることが多い。
 */
async function fetchBestOgp(target: URL): Promise<{
  result: OgpResult | null;
  lastStatus: number;
  challenged: boolean;
}> {
  let best: OgpResult | null = null;
  let bestScore = 0;
  let lastStatus = 0;
  let challenged = false;
  let oembedTried: string | null = null;

  for (const profile of FETCH_PROFILES) {
    let fetched = await fetchHtml(target, profile);

    if (
      !fetched.ok &&
      (fetched.status === 403 ||
        fetched.status === 429 ||
        fetched.status === 503)
    ) {
      await new Promise((r) => setTimeout(r, 200));
      fetched = await fetchHtml(target, profile);
    }

    lastStatus = fetched.status;

    if (!fetched.ok || !fetched.html) continue;

    const $ = cheerio.load(fetched.html);
    let parsed = parseOgp(fetched.html, fetched.finalUrl);
    if (looksLikeChallengeHtml(fetched.html, parsed.title)) {
      challenged = true;
      continue;
    }

    // OGP が薄いときだけ oEmbed を足す（1 エンドポイントにつき 1 回）
    if (!parsed.image || scoreOgp(parsed, fetched.finalUrl) < 5) {
      const endpoint = findOembedEndpoint($, fetched.finalUrl);
      if (endpoint && endpoint !== oembedTried) {
        oembedTried = endpoint;
        const oem = await fetchOembed(endpoint);
        if (oem) {
          parsed = {
            ...parsed,
            title: parsed.title || oem.title || parsed.title,
            description: parsed.description || oem.description || "",
            image: parsed.image || oem.image || null,
          };
          // ホスト名だけのタイトルを oEmbed で上書き
          if (
            oem.title &&
            parsed.title.replace(/^www\./, "").toLowerCase() ===
              fetched.finalUrl.hostname.replace(/^www\./, "").toLowerCase()
          ) {
            parsed.title = oem.title;
          }
        }
      }
    }

    const score = scoreOgp(parsed, fetched.finalUrl);
    if (score > bestScore) {
      best = parsed;
      bestScore = score;
    }

    // タイトル＋画像が揃えば打ち切り（待ち時間短縮）
    if (isUsefulOgp(parsed, fetched.finalUrl) && parsed.image) {
      return { result: parsed, lastStatus, challenged: false };
    }
  }

  return { result: best, lastStatus, challenged };
}

function softFallbackResult(target: URL, hints: ClientHints): OgpResult {
  return mergeWithHints(
    {
      url: target.href,
      title: hints.title || target.hostname,
      description: hints.description || "",
      image: null,
      siteName: target.hostname,
      favicon: faviconFallbackUrl(target.hostname),
    },
    hints,
    target,
  );
}

/**
 * URL の HTML から OGP / 基本メタを抽出する。
 * クライアント直 fetch は CORS で失敗するため、サーバー側で取得する。
 * 本番では SNS クローラー UA を優先し、失敗時もドメイン＋ファビコンで返す。
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

    const { result, lastStatus, challenged } = await fetchBestOgp(target);

    if (result) {
      const merged = mergeWithHints(result, hints, target);
      const enriched = await applyYoutubeEnrichment(merged, target);
      return NextResponse.json(enriched);
    }

    // スクレイプ失敗 → YouTube oEmbed / クライアントヒントで救済
    const ytFallback = await youtubeOnlyResult(target);
    if (ytFallback) {
      return NextResponse.json(mergeWithHints(ytFallback, hints, target));
    }

    if (hasHints) {
      return NextResponse.json(softFallbackResult(target, hints));
    }

    // 完全失敗でもキープ自体はできるように、ドメイン＋ファビコンで返す
    // （以前は 502 にしていたが、本番で多数サイトが弾かれるため）
    if (challenged || lastStatus === 403 || lastStatus === 429) {
      return NextResponse.json({
        ...softFallbackResult(target, hints),
        warning: "partial",
        message:
          "サイトのボット対策によりタイトル／画像を取得できませんでした。ブックマークレットからの登録だと取得しやすいです",
      });
    }

    if (lastStatus && lastStatus >= 400) {
      return NextResponse.json({
        ...softFallbackResult(target, hints),
        warning: "partial",
        message: `サイトの取得に失敗したためドメイン名のみ登録しました（${lastStatus}）`,
      });
    }

    return NextResponse.json({
      ...softFallbackResult(target, hints),
      warning: "partial",
      message:
        "メタ情報を取得できませんでした。ブックマークレットからの登録を試してください",
    });
  } catch (err) {
    const aborted =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.includes("abort"));

    const ytFallback = await youtubeOnlyResult(target);
    if (ytFallback) {
      return NextResponse.json(mergeWithHints(ytFallback, hints, target));
    }

    if (hasHints) {
      return NextResponse.json(softFallbackResult(target, hints));
    }

    // タイムアウト等でもキープは通す
    return NextResponse.json({
      ...softFallbackResult(target, hints),
      warning: "partial",
      message: aborted
        ? "タイムアウトしたためドメイン名のみ登録しました"
        : "サイトの取得中にエラーが発生したためドメイン名のみ登録しました",
    });
  }
}
