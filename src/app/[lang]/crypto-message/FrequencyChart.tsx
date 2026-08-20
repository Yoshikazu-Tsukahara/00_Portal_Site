import type { FrequencyEntry } from "./lib/caesar";

type Props = {
  entries: FrequencyEntry[];
  emptyLabel: string;
};

/**
 * 文字の出現頻度グラフ（棒グラフ）。
 * 「解読チャレンジ」モードで、暗号文の法則性を探る補助ツールとして使う。
 */
export default function FrequencyChart({ entries, emptyLabel }: Props) {
  if (entries.length === 0) {
    return <p className="cm-freq-empty">{emptyLabel}</p>;
  }

  const max = Math.max(...entries.map((e) => e.count));

  return (
    <div className="cm-freq-chart" role="img" aria-label={emptyLabel}>
      {entries.map((entry) => (
        <div key={entry.char} className="cm-freq-col">
          <span className="cm-freq-col__count">{entry.count}</span>
          <div className="cm-freq-col__track">
            <div
              className="cm-freq-col__fill"
              style={{ height: `${Math.max(8, (entry.count / max) * 100)}%` }}
            />
          </div>
          <span className="cm-freq-col__char">
            {entry.char === " " ? "␣" : entry.char}
          </span>
        </div>
      ))}
    </div>
  );
}
