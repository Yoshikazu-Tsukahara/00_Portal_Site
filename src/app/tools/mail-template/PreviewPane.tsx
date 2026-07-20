"use client";

import CopyMenu from "./CopyMenu";

/** 件名・本文を分離したプレビュー＆コピー */
export default function PreviewPane({
  subject,
  body,
  combinedText,
  emptyLabels,
}: {
  /** 変数置換済みの件名 */
  subject: string;
  /** 変数置換済みの本文 */
  body: string;
  /** 件名＋本文の結合テキスト */
  combinedText: string;
  emptyLabels: string[];
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-zinc-500">プレビュー</p>
        <CopyMenu
          subjectText={subject}
          bodyText={body}
          combinedText={combinedText}
          emptyLabels={emptyLabels}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {/* 件名 */}
        <div className="shrink-0 rounded-md border border-zinc-200/80 bg-white p-3">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            件名
          </p>
          <p className="text-sm font-medium leading-snug text-zinc-900">
            {subject.trim() ? subject : (
              <span className="font-normal text-zinc-400">（件名なし）</span>
            )}
          </p>
        </div>

        {/* 本文 */}
        <div className="min-h-0 flex-1 rounded-md border border-zinc-200/80 bg-zinc-50/50 p-3">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            本文
          </p>
          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-zinc-800">
            {body.trim() ? body : "（本文なし）"}
          </pre>
        </div>
      </div>
    </div>
  );
}
