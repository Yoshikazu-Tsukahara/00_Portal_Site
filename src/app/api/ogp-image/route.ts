import { NextResponse } from "next/server";
import { imageFetchHeaders, parsePublicHttpUrl } from "../ogp/safeUrl";

export const runtime = "nodejs";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BYTES = 5_000_000;
const ALLOWED_TYPES = /^(image\/|application\/octet-stream)/i;

/**
 * 外部サムネを同一オリジン経由で返すプロキシ。
 * 本番ドメインからのホットリンク拒否を回避する。
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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(target.href, {
      signal: controller.signal,
      redirect: "follow",
      headers: imageFetchHeaders(target),
      cache: "force-cache",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "fetch_failed", message: `画像取得失敗（${res.status}）` },
        { status: 502 },
      );
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!ALLOWED_TYPES.test(contentType) && !/\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(target.pathname)) {
      return NextResponse.json(
        { error: "not_image", message: "画像以外の応答です" },
        { status: 415 },
      );
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0) {
      return NextResponse.json(
        { error: "empty", message: "空の画像です" },
        { status: 502 },
      );
    }
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
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        // ページ埋め込み用
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    const aborted =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.includes("abort"));
    return NextResponse.json(
      {
        error: aborted ? "timeout" : "fetch_error",
        message: aborted ? "画像取得がタイムアウトしました" : "画像取得に失敗しました",
      },
      { status: aborted ? 504 : 502 },
    );
  } finally {
    clearTimeout(timer);
  }
}
