"use client";

import type { ScrambleChar } from "./useScrambleReveal";

type Props = {
  chars: ScrambleChar[];
  /** 何も解読していない時のプレースホルダー文言 */
  placeholder?: string;
};

/**
 * スクランブル解読アニメーションの表示コンポーネント。
 * 未確定文字はランダム記号のまま淡く、確定した瞬間の文字だけ
 * 一瞬拡大＋発光してから元のサイズへ戻る（CSS側で制御）。
 */
export default function ScrambleText({ chars, placeholder }: Props) {
  if (chars.length === 0) {
    return (
      <p className="cm-scramble-text cm-scramble-text--empty">
        {placeholder ?? "ここに解読結果が表示されます…"}
      </p>
    );
  }

  return (
    <p className="cm-scramble-text" aria-live="polite">
      {chars.map((c, i) => (
        <span
          key={i}
          className={[
            "cm-scramble-char",
            c.locked ? "cm-scramble-char--locked" : "cm-scramble-char--pending",
            c.justLocked ? "cm-scramble-char--pop" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {c.char}
        </span>
      ))}
    </p>
  );
}
