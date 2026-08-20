"use client";

import { useId } from "react";
import type { CryptoMessageDict } from "@/i18n/apps/cryptoMessage";

type GuideVariant = "ios" | "desktop";

/** ホーム画面追加の操作ガイド（iOS / PC・Android） */
export default function InstallGuideModal({
  open,
  variant,
  copy,
  onClose,
}: {
  open: boolean;
  variant: GuideVariant;
  copy: CryptoMessageDict["install"];
  onClose: () => void;
}) {
  const titleId = useId();
  if (!open) return null;

  const isIos = variant === "ios";
  const title = isIos ? copy.modalTitle : copy.desktopTitle;
  const lead = isIos ? copy.modalLead : copy.desktopLead;
  const steps = isIos
    ? [
        { n: 1, title: copy.step1Title, body: copy.step1Body },
        { n: 2, title: copy.step2Title, body: copy.step2Body },
      ]
    : [
        {
          n: 1,
          title: copy.desktopStep1Title,
          body: copy.desktopStep1Body,
        },
        {
          n: 2,
          title: copy.desktopStep2Title,
          body: copy.desktopStep2Body,
        },
      ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-zinc-950/70 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="cm-install-modal w-full max-w-sm overflow-hidden rounded-t-3xl border border-zinc-700 bg-zinc-950 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-5 pb-2 pt-5 text-center">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-2xl"
            aria-hidden
          >
            🔐
          </div>
          <h2
            id={titleId}
            className="text-lg font-semibold tracking-tight text-zinc-50"
          >
            {title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{lead}</p>
        </div>

        <ol className="space-y-3 px-5 py-4">
          {steps.map((s) => (
            <li
              key={s.n}
              className="flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-3"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-xs font-semibold text-zinc-950"
                aria-hidden
              >
                {s.n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-100">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="border-t border-zinc-800 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cm-ghost-btn w-full !py-3 !text-sm"
          >
            {copy.modalClose}
          </button>
        </div>
      </div>
    </div>
  );
}
