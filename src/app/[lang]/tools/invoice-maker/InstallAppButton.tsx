"use client";

import PwaInstallButton from "@/components/PwaInstallButton";
import type { InvoiceMakerDict } from "@/i18n/apps/invoiceMaker";

/** 請求書メーカー向け「インストール」（共通ボタンへ委譲） */
export default function InstallAppButton({
  copy,
}: {
  copy: InvoiceMakerDict["install"];
}) {
  return (
    <PwaInstallButton
      copy={copy}
      className="lunch-install-btn !px-2.5 !py-1 !text-[11px] active:scale-[0.98] sm:!px-3 sm:!py-1 sm:!text-xs"
    />
  );
}
