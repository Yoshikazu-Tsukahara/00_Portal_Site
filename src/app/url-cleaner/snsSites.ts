/** クエリパラメータを丸ごと削除する SNS ドメイン */
const SNS_STRIP_QUERY_BASES = [
  "x.com",
  "twitter.com",
  "instagram.com",
  "tiktok.com",
  "vm.tiktok.com",
] as const;

function isSnsStripQueryHost(host: string): boolean {
  const h = host.toLowerCase();
  return SNS_STRIP_QUERY_BASES.some(
    (base) => h === base || h.endsWith(`.${base}`),
  );
}

/**
 * X / Instagram / TikTok: 共有用クエリをすべて削除（search / hash を空にする）。
 */
export function cleanSnsUrl(url: URL): string | null {
  if (!isSnsStripQueryHost(url.hostname)) return null;

  const next = new URL(url.toString());
  next.search = "";
  next.hash = "";
  return next.toString();
}
