"use client";

import type { Tool } from "@/data/tools";
import { useI18n } from "@/i18n";

/** ジャンル ID → レアカード風アクセント */
export type CardAccent = "blue" | "rose" | "emerald" | "gold";

const ACCENT_BY_GENRE: Record<string, CardAccent> = {
  business: "blue",
  creators: "rose",
  utilities: "emerald",
  minigames: "gold",
};

/** カード共通：ベース構造（色味はアクセント側で付与） */
const CARD_BASE =
  "portal-tool-card group relative flex h-full min-h-[10.5rem] flex-col rounded-xl bg-white/95 p-5 shadow-md backdrop-blur-[2px] transition-all duration-300 ease-out sm:min-h-[11rem] sm:p-6";

const ACCENT_CLASS: Record<CardAccent, string> = {
  blue: "portal-tool-card--blue",
  rose: "portal-tool-card--rose",
  emerald: "portal-tool-card--emerald",
  gold: "portal-tool-card--gold",
};

/** Coming Soon 用：具体的内容を持たない汎用プレースホルダー */
function ComingSoonCard({
  label,
  hint,
  accent,
}: {
  label: string;
  hint: string;
  accent: CardAccent;
}) {
  return (
    <div
      className={`${CARD_BASE} ${ACCENT_CLASS[accent]} portal-tool-card--muted cursor-default border-dashed opacity-70`}
      aria-disabled="true"
    >
      <span className="absolute right-4 top-4 shrink-0 whitespace-nowrap rounded-full border border-zinc-200/80 bg-white px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-zinc-500 sm:text-[11px]">
        Coming Soon
      </span>

      <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
        <span
          aria-hidden
          className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200/60 bg-white/80 text-xl text-zinc-300 sm:h-12 sm:w-12 sm:text-2xl"
        >
          ···
        </span>
        <p className="text-sm font-medium tracking-tight text-zinc-400">
          {label}
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-400/90">
          {hint}
        </p>
      </div>
    </div>
  );
}

export default function ToolCard({
  tool,
  genreId,
}: {
  tool: Tool;
  /** 所属カテゴリー（business / creators / utilities） */
  genreId: string;
}) {
  const { t } = useI18n();
  const { icon, href, comingSoon, id } = tool;
  const accent = ACCENT_BY_GENRE[genreId] ?? "blue";

  if (comingSoon) {
    return (
      <ComingSoonCard
        label={t.card.comingSoon}
        hint={t.card.comingSoonHint}
        accent={accent}
      />
    );
  }

  const copy = t.tools[id] ?? { title: id, description: "" };
  const { title, description } = copy;

  const content = (
    <>
      <div className="mb-3 flex min-w-0 items-center gap-3 sm:mb-3.5 sm:gap-3.5">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-100 bg-gradient-to-b from-zinc-50 to-zinc-100/80 text-[1.35rem] leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(24,24,27,0.04)] transition-all duration-300 group-hover:border-zinc-200 group-hover:from-white group-hover:to-zinc-50 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_6px_rgba(24,24,27,0.06)] sm:h-12 sm:w-12 sm:text-2xl"
        >
          {icon}
        </span>
        <h3
          title={title}
          className="min-w-0 flex-1 truncate text-[15px] font-semibold leading-tight tracking-tight text-zinc-900 transition-colors duration-300 group-hover:text-zinc-950 sm:text-base"
        >
          {title}
        </h3>
      </div>

      <p className="mb-4 flex-1 text-[13px] leading-[1.65] text-zinc-500 transition-colors duration-300 group-hover:text-zinc-600 sm:text-sm sm:leading-relaxed">
        {description}
      </p>

      <span className="mt-auto inline-flex items-center text-[13px] font-medium text-zinc-600 transition-colors duration-300 group-hover:text-zinc-900 sm:text-sm">
        {t.card.open}
        <span
          aria-hidden
          className="ml-1.5 transition-transform duration-300 group-hover:translate-x-0.5"
        >
          →
        </span>
      </span>
    </>
  );

  return (
    <a
      href={href}
      className={`${CARD_BASE} ${ACCENT_CLASS[accent]} portal-tool-card--live`}
    >
      {content}
    </a>
  );
}
