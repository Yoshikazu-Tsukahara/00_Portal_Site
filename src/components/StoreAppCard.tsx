"use client";

import AppCover from "@/components/AppCover";
import ToolGlyph from "@/components/ToolGlyph";
import type { Tool } from "@/data/tools";
import { LocaleLink, useI18n } from "@/i18n";
import { useHomePins } from "@/lib/homePins";

type Props = {
  tool: Tool;
  genreId: string;
};

/**
 * Apple App Store 風カード。
 * カバー／タイトル → 説明ページ。インストール → ホーム追加（アプリは開かない）。
 */
export default function StoreAppCard({ tool, genreId }: Props) {
  const { t } = useI18n();
  const { isInstalled, install, uninstall, hydrated } = useHomePins();
  const copy = t.tools[tool.id] ?? { title: tool.id, description: "" };
  const genreName = t.genres[genreId]?.name ?? genreId;
  const detailHref = `/library/${tool.id}`;
  const installed = hydrated && isInstalled(tool.id);
  const titleId = `store-card-title-${tool.id}`;
  const actionLabel = installed ? t.library.uninstall : t.library.install;

  if (tool.comingSoon) {
    return (
      <article className="store-card store-card--muted" aria-disabled="true">
        <div className="store-card__cover-link pointer-events-none">
          <div className="store-cover store-cover--fallback">
            <span className="store-cover__emoji">···</span>
          </div>
        </div>
        <div className="store-card__meta">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="store-card__title text-zinc-400">{t.card.comingSoon}</p>
            <p className="store-card__genre text-zinc-400">
              {t.card.comingSoonHint}
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="store-card" aria-labelledby={titleId}>
      <LocaleLink
        href={detailHref}
        className="store-card__cover-link"
        aria-labelledby={titleId}
      >
        <AppCover tool={tool} />
      </LocaleLink>

      <div className="store-card__meta">
        <LocaleLink
          href={detailHref}
          className="store-card__meta-link"
          aria-labelledby={titleId}
        >
          <span className="store-card__icon" aria-hidden>
            <ToolGlyph tool={tool} />
          </span>
          <span className="min-w-0 flex-1 overflow-hidden">
            <span id={titleId} className="store-card__title" title={copy.title}>
              {copy.title}
            </span>
            <span className="store-card__genre">{genreName}            </span>
          </span>
        </LocaleLink>

        <button
          type="button"
          disabled={!hydrated}
          className={
            installed
              ? "store-install-btn store-install-btn--installed"
              : "store-install-btn"
          }
          title={actionLabel}
          aria-label={`${copy.title}: ${actionLabel}`}
          aria-pressed={installed}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (installed) uninstall(tool.id);
            else install(tool.id);
          }}
        >
          {installed ? t.library.installed : t.library.install}
        </button>
      </div>
    </article>
  );
}
