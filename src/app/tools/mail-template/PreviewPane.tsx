"use client";

import { useI18n } from "@/i18n";
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
  const { t } = useI18n();
  const mt = t.apps.mailTemplate;

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col gap-2 overflow-hidden">
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-medium text-zinc-500">
          {mt.preview.heading}
        </p>
        <CopyMenu
          subjectText={subject}
          bodyText={body}
          combinedText={combinedText}
          emptyLabels={emptyLabels}
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto overscroll-contain">
        {/* 件名 */}
        <div className="min-w-0 shrink-0 rounded-md border border-zinc-200/80 bg-white p-2 md:p-3">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            {mt.preview.subject}
          </p>
          <p className="break-words text-sm font-medium leading-snug text-zinc-900">
            {subject.trim() ? subject : (
              <span className="font-normal text-zinc-400">
                {mt.preview.emptySubject}
              </span>
            )}
          </p>
        </div>

        {/* 本文 */}
        <div className="min-h-0 min-w-0 flex-1 rounded-md border border-zinc-200/80 bg-zinc-50/50 p-2 md:p-3">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            {mt.preview.body}
          </p>
          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-zinc-800">
            {body.trim() ? body : mt.preview.emptyBody}
          </pre>
        </div>
      </div>
    </div>
  );
}
