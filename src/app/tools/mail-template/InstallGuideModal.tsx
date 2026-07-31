"use client";

import { useId, type ReactNode } from "react";
import type { MailTemplateDict } from "@/i18n/apps/mailTemplate";

type GuideVariant = "ios" | "desktop";

/** ホーム画面追加の操作ガイド（iOS / PC・Android 共通枠） */
export default function InstallGuideModal({
  open,
  variant,
  copy,
  onClose,
}: {
  open: boolean;
  variant: GuideVariant;
  copy: MailTemplateDict["install"];
  onClose: () => void;
}) {
  const titleId = useId();
  if (!open) return null;

  const isIos = variant === "ios";
  const title = isIos ? copy.modalTitle : copy.desktopTitle;
  const lead = isIos ? copy.modalLead : copy.desktopLead;
  const steps = isIos
    ? [
        {
          n: 1,
          title: copy.step1Title,
          body: copy.step1Body,
          icon: <ShareIcon />,
        },
        {
          n: 2,
          title: copy.step2Title,
          body: copy.step2Body,
          icon: <HomeAddIcon />,
        },
      ]
    : [
        {
          n: 1,
          title: copy.desktopStep1Title,
          body: copy.desktopStep1Body,
          icon: <BrowserIcon />,
        },
        {
          n: 2,
          title: copy.desktopStep2Title,
          body: copy.desktopStep2Body,
          icon: <InstallIcon />,
        },
      ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-zinc-950/45 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="lunch-install-modal w-full max-w-sm overflow-hidden rounded-t-3xl border border-zinc-200/80 bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-5 pb-2 pt-5 text-center">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl"
            aria-hidden
          >
            📱
          </div>
          <h2
            id={titleId}
            className="text-lg font-semibold tracking-tight text-zinc-900"
          >
            {title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{lead}</p>
        </div>

        <ol className="space-y-3 px-5 py-4">
          {steps.map((s) => (
            <Step
              key={s.n}
              n={s.n}
              title={s.title}
              body={s.body}
              icon={s.icon}
            />
          ))}
        </ol>

        <div className="border-t border-zinc-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full !py-3 !text-sm"
          >
            {copy.modalClose}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  body,
  icon,
}: {
  n: number;
  title: string;
  body: string;
  icon: ReactNode;
}) {
  return (
    <li className="flex gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 px-3.5 py-3">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white"
        aria-hidden
      >
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-zinc-700" aria-hidden>
            {icon}
          </span>
          <p className="text-sm font-semibold text-zinc-900">{title}</p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{body}</p>
      </div>
    </li>
  );
}

function ShareIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

function HomeAddIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
      <path d="M12 14v4" />
      <path d="M10 16h4" />
    </svg>
  );
}

function BrowserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 8h18" />
      <path d="M8 4v4" />
    </svg>
  );
}

function InstallIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}
