"use client";

import type { DiffChunk } from "./cleanText";

/** 差分チャンクを色分け表示 */
export default function DiffView({ chunks }: { chunks: DiffChunk[] }) {
  if (chunks.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        差分はありません（入力と結果が同じです）。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3 text-[10px] text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-100 ring-1 ring-red-200" />
          削除
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-100 ring-1 ring-emerald-200" />
          追加
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-transparent ring-1 ring-zinc-200" />
          変更なし
        </span>
      </div>
      <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-zinc-700">
        {chunks.map((c, i) => {
          if (c.type === "equal") {
            return <span key={i}>{c.text}</span>;
          }
          if (c.type === "remove") {
            return (
              <span
                key={i}
                className="rounded-sm bg-red-100/90 text-red-800 line-through decoration-red-400/80"
              >
                {c.text}
              </span>
            );
          }
          return (
            <span
              key={i}
              className="rounded-sm bg-emerald-100/90 text-emerald-900"
            >
              {c.text}
            </span>
          );
        })}
      </pre>
    </div>
  );
}
