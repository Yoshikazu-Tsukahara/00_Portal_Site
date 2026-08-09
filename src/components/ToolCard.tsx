"use client";

import { Monitor, Smartphone } from "lucide-react";
import type { Tool } from "@/data/tools";
import FavoriteIconButton from "@/components/icons/FavoriteIconButton";
import { useI18n } from "@/i18n";
import { useHomePins } from "@/lib/homePins";

/** ジャンル ID → 互換用アクセントクラス（見た目は統一） */
export type CardAccent = "blue" | "rose" | "emerald" | "gold";

const ACCENT_BY_GENRE: Record<string, CardAccent> = {
  business: "blue",
  creators: "rose",
  utilities: "emerald",
  minigames: "gold",
};

/** カード共通：タイトル2行＋説明3行が収まる高さ（言語差でも揃う） */
const CARD_BASE =
  "portal-tool-card group relative flex h-[14.5rem] min-w-0 flex-col overflow-hidden rounded-md bg-[var(--background)] p-4 transition-all duration-150 sm:h-[15rem] sm:p-5";

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
      className={`${CARD_BASE} ${ACCENT_CLASS[accent]} portal-tool-card--muted cursor-default opacity-70`}
      aria-disabled="true"
    >
      <span className="absolute right-3 top-3 shrink-0 whitespace-nowrap rounded-md border border-zinc-200 px-2 py-0.5 text-[10px] font-medium tracking-wide text-zinc-500 sm:right-4 sm:top-4 sm:text-[11px]">
        Coming Soon
      </span>

      <div className="flex flex-1 flex-col items-center justify-center px-1 text-center sm:px-2">
        <span
          aria-hidden
          className="mb-2 flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-lg text-zinc-300 sm:mb-2.5 sm:h-12 sm:w-12 sm:text-2xl"
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
      className={`absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-tight sm:bottom-4 sm:right-4 ${
        supported
          ? "border-[var(--accent-border)] bg-[color-mix(in_srgb,var(--accent)_28%,white)] text-zinc-700"
          : "border-zinc-200 bg-[var(--background)] text-zinc-500"
      }`}
    >
      <Icon className="size-3 shrink-0" aria-hidden strokeWidth={2.25} />
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
  const { isPinned, togglePin, hydrated } = useHomePins();
  const pinned = hydrated && isPinned(id);

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

  return (
    <div
      className={`${CARD_BASE} ${ACCENT_CLASS[accent]} portal-tool-card--live`}
    >
      <div className="absolute right-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] justify-end sm:right-4 sm:top-4">
        <FavoriteIconButton
          active={pinned}
          label={pinned ? t.card.unpinFromHome : t.card.pinToHome}
          className="!max-w-full !px-2 !py-1.5 text-[10px] shadow-none sm:text-[11px] [&_span]:truncate"
          title={pinned ? t.card.unpinFromHome : t.card.pinToHome}
          aria-label={pinned ? t.card.unpinFromHome : t.card.pinToHome}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePin(id);
          }}
        />
      </div>

      <a href={href} className="flex min-h-0 flex-1 flex-col pr-1 pt-9 sm:pt-10">
        <div className="mb-2 flex min-w-0 items-center gap-2.5 sm:mb-2.5 sm:gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-[1.05rem] leading-none transition-all duration-150 sm:h-11 sm:w-11 sm:text-[1.35rem]"
          >
            {icon}
          </span>
          <h3 className="font-display line-clamp-2 min-w-0 flex-1 break-words text-[13px] font-bold leading-snug tracking-tight text-zinc-900 [overflow-wrap:anywhere] sm:text-base">
            {title}
          </h3>
        </div>

        <p className="mb-2 min-h-0 flex-1 break-words text-[11px] leading-relaxed text-zinc-500 [overflow-wrap:anywhere] line-clamp-3 sm:mb-3 sm:pr-14 sm:text-sm sm:leading-snug">
          {description}
        </p>

        <span className="mt-auto inline-flex max-w-[calc(100%-2.5rem)] items-center truncate text-[12px] font-medium text-zinc-600 transition-all duration-150 group-hover:text-zinc-900 sm:max-w-none sm:pr-16 sm:text-sm">
          {t.card.open}
          <span aria-hidden className="ml-1 sm:ml-1.5">
            →
          </span>
        </span>
      </a>

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
    </div>
  );
}
