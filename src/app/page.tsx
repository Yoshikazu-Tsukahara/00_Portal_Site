"use client";

import Link from "next/link";
import LauncherGrid from "@/components/LauncherGrid";
import { useI18n } from "@/i18n";
import { useHomePins } from "@/lib/homePins";
import { useLayout } from "@/lib/layout";

/**
 * ホーム：ピン留めアプリだけのデスクトップ風ランチャー。
 * SiteChrome の fillViewport により Header＋この領域＝画面いっぱい。
 * Footer は画面外すぐ下（ページスクロールで到達）。
 */
export default function Home() {
  const { t } = useI18n();
  const { contentClassName } = useLayout();
  const {
    items,
    hydrated,
    reorder,
    combine,
    uninstall,
    moveItem,
    groupWithNext,
    dissolveFolder,
    renameFolder,
    ejectFromFolder,
  } = useHomePins();

  return (
    <main className="relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
      <div className={`${contentClassName} flex min-h-full flex-1 flex-col py-6 sm:py-8`}>
        {!hydrated ? (
          <p className="text-sm text-zinc-400">{t.common.loading}</p>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed border-zinc-200 px-6 py-16 text-center">
            <p className="font-display text-sm font-bold text-zinc-700">
              {t.home.emptyPins}
            </p>
            <p className="mt-2 text-sm text-zinc-500">{t.home.emptyPinsHint}</p>
            <Link href="/library" className="btn-secondary mt-6 inline-flex">
              {t.home.openLibrary}
            </Link>
          </div>
        ) : (
          <LauncherGrid
            items={items}
            onReorder={reorder}
            onCombine={combine}
            onRemove={uninstall}
            onMove={moveItem}
            onGroupWithNext={groupWithNext}
            onDissolveFolder={dissolveFolder}
            onRenameFolder={renameFolder}
            onEjectFromFolder={ejectFromFolder}
          />
        )}
      </div>
    </main>
  );
}
