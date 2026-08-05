"use client";

import { Monitor, Smartphone } from "lucide-react";
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

/** カード共通：タイトル2行＋説明3行が収まる高さ（言語差でも揃う） */
const CARD_BASE =
  "portal-tool-card group relative flex h-[13.5rem] min-w-0 flex-col overflow-hidden rounded-xl bg-white/95 p-3 shadow-md backdrop-blur-[2px] transition-all duration-300 ease-out sm:h-[13.75rem] sm:p-5";

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
      <span className="absolute right-2.5 top-2.5 shrink-0 whitespace-nowrap rounded-full border border-zinc-200/80 bg-white px-2 py-0.5 text-[10px] font-medium tracking-wide text-zinc-500 sm:right-4 sm:top-4 sm:px-2.5 sm:text-[11px]">
        Coming Soon
      </span>

      <div className="flex flex-1 flex-col items-center justify-center px-1 text-center sm:px-2">
        <span
          aria-hidden
          className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/60 bg-white/80 text-lg text-zinc-300 sm:mb-2.5 sm:h-12 sm:w-12 sm:text-2xl"
        >
          ···
        </span>
        <p className="text-sm font-medium tracking-tight text-zinc-400">
          {label}
        </p>
        <p className="mt-1 line-clamp-2 break-words text-[11px] leading-snug text-zinc-400/90 sm:text-[12px]">
          {hint}
        </p>
      </div>
    </div>
  );
}

/** デバイス対応バッジ（右下） */
function DeviceBadge({
  supported,
  label,
  hint,
}: {
  supported: boolean;
  label: string;
  hint: string;
}) {
  const Icon = supported ? Smartphone : Monitor;
  return (
    <span
      title={hint}
      aria-label={hint}
      className={`absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-tight shadow-sm sm:bottom-4 sm:right-4 ${
        supported
          ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-700"
          : "border-zinc-200/80 bg-zinc-100/80 text-zinc-500"
      }`}
    >
      <Icon className="size-3 shrink-0" aria-hidden strokeWidth={2.25} />
      {/* 狭いカード幅ではアイコンのみ（ビューポート幅ではなく sm 以上で文言） */}
      <span className="hidden sm:inline">{label}</span>
    </span>
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
  const { icon, href, comingSoon, id, isMobileSupported } = tool;
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
      {/* アイコンとタイトル：1〜2行いずれでも縦中央揃え */}
      <div className="mb-1.5 flex min-w-0 items-center gap-2 sm:mb-2.5 sm:gap-3">
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-100 bg-gradient-to-b from-zinc-50 to-zinc-100/80 text-[1.05rem] leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(24,24,27,0.04)] transition-all duration-300 group-hover:border-zinc-200 group-hover:from-white group-hover:to-zinc-50 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_6px_rgba(24,24,27,0.06)] sm:h-11 sm:w-11 sm:rounded-xl sm:text-[1.35rem]"
        >
          {icon}
        </span>
        <h3 className="line-clamp-2 min-w-0 flex-1 break-words text-[13px] font-semibold leading-snug tracking-tight text-zinc-900 transition-colors duration-300 [overflow-wrap:anywhere] group-hover:text-zinc-950 sm:text-base sm:leading-snug">
          {title}
        </h3>
      </div>

      {/* 説明は最大3行。長い文案は辞書側で短縮する（CSS省略に頼らない） */}
      <p className="mb-2 min-h-0 flex-1 break-words text-[11px] leading-relaxed text-zinc-500 transition-colors duration-300 [overflow-wrap:anywhere] line-clamp-3 group-hover:text-zinc-600 sm:mb-3 sm:pr-14 sm:text-sm sm:leading-snug">
        {description}
      </p>

      <span className="mt-auto inline-flex max-w-[calc(100%-2.5rem)] items-center truncate text-[12px] font-medium text-zinc-600 transition-colors duration-300 group-hover:text-zinc-900 sm:max-w-none sm:pr-16 sm:text-sm">
        {t.card.open}
        <span
          aria-hidden
          className="ml-1 transition-transform duration-300 group-hover:translate-x-0.5 sm:ml-1.5"
        >
          →
        </span>
      </span>

      {isMobileSupported === true ? (
        <DeviceBadge
          supported
          label={t.card.mobileSupported}
          hint={t.card.mobileSupportedHint}
        />
      ) : null}
      {isMobileSupported === false ? (
        <DeviceBadge
          supported={false}
          label={t.card.pcRecommended}
          hint={t.card.pcRecommendedHint}
        />
      ) : null}
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
