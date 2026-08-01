"use client";

import PwaInstallButton from "@/components/PwaInstallButton";
import type { LinkStockerDict } from "@/i18n/apps/linkStocker";

/** とりあえずキープ向け「ホームに追加」（共通ボタンへ委譲） */
export default function InstallAppButton({
  copy,
}: {
  copy: LinkStockerDict["install"];
}) {
  return <PwaInstallButton copy={copy} />;
}
