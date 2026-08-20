"use client";

import { useParams } from "next/navigation";
import AppCover from "@/components/AppCover";
import ToolGlyph from "@/components/ToolGlyph";
import {
  findGenreByToolId,
  findToolById,
  getToolUpdatedAt,
  type Tool,
} from "@/data/tools";
import { intlLocale, LocaleLink, useI18n } from "@/i18n";
import { useHomePins } from "@/lib/homePins";
import { useLayout } from "@/lib/layout";
import { useCompactLayout } from "@/lib/useCompactLayout";

/** 対応デバイス（1端末＝1チップ） */
function deviceLabels(
  tool: Tool,
  t: ReturnType<typeof useI18n>["t"],
): string[] {
  const {
    deviceSmartphone,
    deviceTablet,
    deviceWindows,
    deviceMac,
    devicePcRecommended,
  } = t.library;

  if (tool.isMobileSupported === true) {
    return [deviceSmartphone, deviceTablet, deviceWindows, deviceMac];
  }
  if (tool.isMobileSupported === false) {
    return [deviceWindows, deviceMac, devicePcRecommended];
  }
  return [deviceWindows, deviceMac, devicePcRecommended];
}

/** 概要文を段落配列へ正規化 */
function detailParagraphs(
  detail: string | readonly string[] | undefined,
  fallback: string,
): string[] {
  if (detail == null) return [fallback];
  if (typeof detail === "string") {
    const trimmed = detail.trim();
    return trimmed ? [trimmed] : [fallback];
  }
  const parts = detail.map((p) => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [fallback];
}

/**
 * アプリ説明ページ（Apple App Store 風）。
 * 未インストール時は実アプリへ遷移しない。インストール後は「開く」で入場可。
 */
export default function LibraryAppDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { t, locale } = useI18n();
  const { contentClassName } = useLayout();
  const { compact } = useCompactLayout();
  const { isInstalled, install, uninstall, hydrated } = useHomePins();

  const tool = id ? findToolById(id) : undefined;
  const genre = tool ? findGenreByToolId(tool.id) : undefined;

  if (!tool) {
    return (
      <main className="relative flex flex-1 flex-col">
        <div className={`${contentClassName} py-12`}>
          <p className="text-sm text-zinc-500">{t.library.notFound}</p>
          <LocaleLink
            href="/library"
            className="mt-4 inline-flex min-h-11 items-center text-[15px] font-medium text-zinc-800 underline decoration-[var(--accent)] underline-offset-4 transition-opacity duration-150 hover:opacity-70"
          >
            {t.header.libraryNav}
          </LocaleLink>
        </div>
      </main>
    );
  }

  const copy = t.tools[tool.id] ?? { title: tool.id, description: "" };
  const aboutParagraphs = detailParagraphs(copy.detail, copy.description);
  const highlights = copy.highlights ?? [];
  const gettingStarted = copy.gettingStarted ?? [];
  const tip = copy.tip?.trim() ?? "";
  const genreName = genre
    ? (t.genres[genre.id]?.name ?? genre.label)
    : "";
  const installed = hydrated && isInstalled(tool.id);
  const updatedLabel = new Intl.DateTimeFormat(intlLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${getToolUpdatedAt(tool.id)}T00:00:00`));
  const devices = deviceLabels(tool, t);
  const titleId = `app-detail-title-${tool.id}`;
  const lockedOnMobile = compact && tool.isMobileSupported === false;

  return (
    <main className="relative flex flex-1 flex-col">
      {/* 「このアプリについて」より上：暗め背景＋下端グラデーション */}
      <section className="store-detail-hero" aria-labelledby={titleId}>
        <div className={`${contentClassName} store-detail-hero__inner`}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
            <div className="overflow-hidden rounded-[1.35rem] bg-black/20 ring-1 ring-white/10">
              <AppCover tool={tool} className="!rounded-none" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-start gap-4">
                <span
                  className="store-app-icon flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden text-3xl sm:h-[5.25rem] sm:w-[5.25rem] sm:text-4xl"
                  aria-hidden
                >
                  <ToolGlyph tool={tool} />
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <h1 id={titleId} className="store-detail-hero__title">
                    {copy.title}
                  </h1>
                  {genreName ? (
                    <p className="store-detail-hero__genre">{genreName}</p>
                  ) : null}
                </div>
              </div>

              <p className="store-detail-hero__lead">{copy.description}</p>

              <div className="mt-7">
                {installed ? (
                  <div className="store-detail-actions">
                    {lockedOnMobile ? (
                      <button
                        type="button"
                        disabled
                        className="store-install-btn store-install-btn--lg opacity-60"
                        aria-label={`${copy.title}: ${t.card.pcRecommendedHint}`}
                        title={t.card.pcRecommendedHint}
                      >
                        {t.card.pcRecommended}
                      </button>
                    ) : (
                      <LocaleLink
                        href={tool.href}
                        className="store-install-btn store-install-btn--lg"
                        aria-label={`${copy.title}: ${t.library.openApp}`}
                      >
                        {t.library.openApp}
                      </LocaleLink>
                    )}
                    <button
                      type="button"
                      className="store-remove-btn"
                      aria-label={`${copy.title}: ${t.library.removeFromHome}`}
                      onClick={() => uninstall(tool.id)}
                    >
                      {t.library.removeFromHome}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      disabled={!hydrated}
                      className="store-install-btn store-install-btn--lg"
                      aria-label={`${copy.title}: ${t.library.install}`}
                      onClick={() => install(tool.id)}
                    >
                      {t.library.install}
                    </button>
                    <p className="store-detail-hero__hint">
                      {t.library.installHint}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={`store-detail-body-wrap ${contentClassName}`}>
        <div className="store-detail-body pt-2 sm:pt-3">
          <section aria-labelledby="store-detail-about">
            <h2 id="store-detail-about" className="store-detail-info__label">
              {t.library.aboutLabel}
            </h2>
            <div className="store-detail-prose">
              {aboutParagraphs.map((paragraph, index) => (
                <p key={`about-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>

          {highlights.length > 0 ? (
            <section
              className="store-detail-section"
              aria-labelledby="store-detail-highlights"
            >
              <h2
                id="store-detail-highlights"
                className="store-detail-info__label"
              >
                {t.library.highlightsLabel}
              </h2>
              <ul className="store-detail-bullets">
                {highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {gettingStarted.length > 0 ? (
            <section
              className="store-detail-section"
              aria-labelledby="store-detail-steps"
            >
              <h2 id="store-detail-steps" className="store-detail-info__label">
                {t.library.gettingStartedLabel}
              </h2>
              <ol className="store-detail-steps">
                {gettingStarted.map((step, index) => (
                  <li key={step}>
                    <span className="store-detail-steps__index" aria-hidden>
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {tip ? (
            <section
              className="store-detail-section"
              aria-labelledby="store-detail-tip"
            >
              <h2 id="store-detail-tip" className="store-detail-info__label">
                {t.library.tipLabel}
              </h2>
              <p className="store-detail-tip">{tip}</p>
            </section>
          ) : null}

          {!tool.omitLocalDataNote ? (
            <aside className="store-local-note mt-8" role="note">
              <span aria-hidden>🔒</span>
              <p>{t.library.localDataNote}</p>
            </aside>
          ) : null}

          <div className="mt-10 grid gap-8 border-t border-zinc-200/90 pt-10 sm:mt-12 sm:grid-cols-2 sm:gap-10">
            <div>
              <h2 className="store-detail-info__label">
                {t.library.updatedAtLabel}
              </h2>
              <p className="mt-2.5 text-[15px] font-semibold tracking-tight text-zinc-800">
                {updatedLabel}
              </p>
            </div>

            <div>
              <h2 className="store-detail-info__label">
                {t.library.devicesLabel}
              </h2>
              <ul
                className="mt-2.5 flex flex-wrap gap-2"
                aria-label={t.library.devicesLabel}
              >
                {devices.map((label) => (
                  <li key={label} className="store-device-chip">
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
