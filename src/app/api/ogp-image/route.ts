import { NextResponse } from "next/server";
import { imageFetchHeaderAttempts, parsePublicHttpUrl } from "../ogp/safeUrl";

export const runtime = "nodejs";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BYTES = 5_000_000;
const ALLOWED_TYPES = /^(image\/|application\/octet-stream|binary\/octet-stream)/i;

/**
 * 外部サムネを同一オリジン経由で返すプロキシ。
 * 本番ドメインからのホットリンク拒否を回避する。
 * Referer の有無で弾かれる CDN があるため、複数ヘッダーパターンを試す。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url")?.trim() ?? "";
  const target = parsePublicHttpUrl(raw);
  if (!target) {
    return NextResponse.json(
      { error: "invalid_url", message: "不正な画像 URL です" },
      { status: 400 },
    );
  }

  const attempts = imageFetchHeaderAttempts(target);
  let lastStatus = 0;

  for (let i = 0; i < attempts.length; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(target.href, {
        signal: controller.signal,
        redirect: "follow",
        headers: attempts[i],
        cache: "force-cache",
      });

      lastStatus = res.status;
      if (!res.ok) continue;

      const contentType = res.headers.get("content-type") || "image/jpeg";
      if (
        !ALLOWED_TYPES.test(contentType) &&
        !/\.(png|jpe?g|gif|webp|avif|svg|ico)(\?|$)/i.test(target.pathname)
      ) {
        // HTML チャレンジページ等は次のヘッダーパターンへ
        if (/text\/html/i.test(contentType)) continue;
        return NextResponse.json(
          { error: "not_image", message: "画像以外の応答です" },
          { status: 415 },
        );
      }

      const buf = await res.arrayBuffer();
      if (buf.byteLength === 0) continue;
      if (buf.byteLength > MAX_BYTES) {
        return NextResponse.json(
          { error: "too_large", message: "画像が大きすぎます" },
          { status: 413 },
        );
      }

      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": contentType.includes("image/")
            ? contentType
            : "image/jpeg",
          "Cache-Control":
            "public, max-age=86400, stale-while-revalidate=604800",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (err) {
      const aborted =
        err instanceof Error &&
        (err.name === "AbortError" || err.message.includes("abort"));
      // タイムアウトは即終了、それ以外は次のパターンへ
      if (aborted) {
        return NextResponse.json(
          {
            error: "timeout",
            message: "画像取得がタイムアウトしました",
          },
          { status: 504 },
        );
      }
    } finally {
      clearTimeout(timer);
    }
  }

  return NextResponse.json(
    {
      error: "fetch_failed",
      message: lastStatus
        ? `画像取得失敗（${lastStatus}）`
        : "画像取得に失敗しました",
    },
    { status: 502 },
  );
}
