/**
 * YouTube は HTML スクレイプが本番（データセンター IP）で弾かれやすい。
 * oEmbed + 動画 ID からタイトル／サムネを取る。
 */

const OEMBED_TIMEOUT_MS = 8_000;

export function extractYoutubeVideoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return isVideoId(id) ? id : null;
  }

  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    const v = url.searchParams.get("v");
    if (v && isVideoId(v)) return v;

    const parts = url.pathname.split("/").filter(Boolean);
    if (
      parts.length >= 2 &&
      ["shorts", "embed", "live", "v", "watch"].includes(parts[0]) &&
      isVideoId(parts[1])
    ) {
      return parts[1];
    }
  }

  return null;
}

export function isYoutubeUrl(url: URL): boolean {
  return extractYoutubeVideoId(url) !== null || isYoutubeHost(url);
}

function isYoutubeHost(url: URL): boolean {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  return (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtu.be" ||
    host === "youtube-nocookie.com"
  );
}

function isVideoId(id: string): boolean {
  return /^[\w-]{11}$/.test(id);
}

/** スクレイプ失敗時にありがちな弱いタイトルか */
export function isWeakYoutubeTitle(title: string | undefined | null): boolean {
  if (!title) return true;
  const t = title.trim().toLowerCase();
  if (!t) return true;
  if (t === "youtube" || t === "- youtube" || t === "youtube -") return true;
  if (t === "youtube.com" || t === "www.youtube.com") return true;
  if (t.endsWith(" - youtube") && t.replace(/\s*-\s*youtube$/, "").length < 2) {
    return true;
  }
  return false;
}

export type YoutubeOembed = {
  title: string;
  description: string;
  image: string;
  siteName: string;
};

/** oEmbed で取得。失敗時は動画 ID からサムネだけ組み立てる */
export async function fetchYoutubeMeta(
  pageUrl: URL,
): Promise<YoutubeOembed | null> {
  const videoId = extractYoutubeVideoId(pageUrl);
  if (!videoId) return null;

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const fallbackImage = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OEMBED_TIMEOUT_MS);

  try {
    const oembedUrl =
      "https://www.youtube.com/oembed?format=json&url=" +
      encodeURIComponent(watchUrl);
    const res = await fetch(oembedUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const json = (await res.json()) as {
        title?: string;
        thumbnail_url?: string;
        author_name?: string;
        provider_name?: string;
      };
      const title = json.title?.trim();
      if (title) {
        return {
          title: title.slice(0, 200),
          description: json.author_name
            ? `${json.author_name} · YouTube`.slice(0, 400)
            : "",
          image: json.thumbnail_url || fallbackImage,
          siteName: json.provider_name || "YouTube",
        };
      }
    }
  } catch {
    // oEmbed 失敗時はサムネだけでも返す
  } finally {
    clearTimeout(timer);
  }

  return {
    title: `YouTube 動画 (${videoId})`,
    description: "",
    image: fallbackImage,
    siteName: "YouTube",
  };
}
