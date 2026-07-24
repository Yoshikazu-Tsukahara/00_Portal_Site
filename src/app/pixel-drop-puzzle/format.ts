// 極小ピクセル隙間落としパズル: 数値の表示フォーマット（NASA コンソール風）

/** 符号付きpx表記（例: "+0.024100"） */
export function formatSignedPx(value: number, decimals: number): string {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(decimals)}`;
}

/** 符号付きms表記（例: "-12.40"） */
export function formatSignedMs(value: number): string {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(2)}`;
}

/**
 * 「純粋な運だけで許容誤差内に止まる確率」を天文学的な体裁で表記する。
 * 一様分布を仮定した簡易モデル（演出用）。
 */
export function formatOddsRatio(
  tolerancePx: number,
  maxXPx: number,
  locale: "ja" | "en" = "en",
): string {
  if (tolerancePx <= 0 || maxXPx <= 0) return locale === "ja" ? "該当なし" : "N/A";
  const chance = Math.min(1, (2 * tolerancePx) / maxXPx);
  if (chance <= 0) return locale === "ja" ? "∞分の1" : "1 in ∞";
  const n = 1 / chance;
  if (n >= 1e6) {
    const exp = Math.floor(Math.log10(n));
    const mantissa = n / Math.pow(10, exp);
    if (locale === "ja") {
      return `${mantissa.toFixed(3)}×10^${exp}分の1`;
    }
    return `1 in ${mantissa.toFixed(3)} \u00d7 10^${exp}`;
  }
  if (locale === "ja") {
    return `${Math.round(n).toLocaleString("ja-JP")}分の1`;
  }
  return `1 in ${Math.round(n).toLocaleString("en-US")}`;
}

/** 誤差の許容誤差に対する「信頼度」演出値（%、小数6桁） */
export function formatConfidence(absErrorPx: number, tolerancePx: number): string {
  if (tolerancePx <= 0) return "100.000000%";
  const ratio = Math.max(0, 1 - absErrorPx / tolerancePx);
  return `${(ratio * 100).toFixed(6)}%`;
}

/** 観測レポート用のダミーサンプルID */
export function generateSampleId(): string {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `PXD-${time}-${rand}`;
}

/** 観測時刻の表示（HH:MM:SS.mmm） */
export function formatObservedAt(date: Date): string {
  const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(
    date.getMilliseconds(),
    3,
  )}`;
}
