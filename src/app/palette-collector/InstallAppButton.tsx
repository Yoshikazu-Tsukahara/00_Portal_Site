"use client";

import PwaInstallButton from "@/components/PwaInstallButton";
import type { PaletteCollectorDict } from "@/i18n/apps/paletteCollector";

/** Palette Collector 向け「ホームに追加」（共通ボタンへ委譲） */
export default function InstallAppButton({
  copy,
}: {
  copy: PaletteCollectorDict["install"];
}) {
  return (
    <PwaInstallButton
      copy={copy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium tracking-tight text-gray-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-px hover:border-gray-300 hover:text-gray-900 active:translate-y-0 disabled:cursor-wait disabled:opacity-60 sm:px-3 sm:py-1 sm:text-xs"
    />
  );
}
