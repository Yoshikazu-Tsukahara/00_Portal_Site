"use client";

import { useState } from "react";
import type { CryptoMessageDict } from "@/i18n/apps/cryptoMessage";
import InstallGuideModal from "./InstallGuideModal";
import { usePwaInstall } from "./usePwaInstall";

/** ヘッダー横のコンパクトな「インストール」ボタン */
export default function InstallAppButton({
  copy,
}: {
  copy: CryptoMessageDict["install"];
}) {
  const { canShow, isIos, prepareAndPrompt } = usePwaInstall();
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideVariant, setGuideVariant] = useState<"ios" | "desktop">("desktop");
  const [busy, setBusy] = useState(false);

  if (!canShow) return null;

  async function handleClick() {
    if (isIos) {
      setGuideVariant("ios");
      setGuideOpen(true);
      return;
    }

    setBusy(true);
    try {
      const result = await prepareAndPrompt();
      if (result === "guide") {
        setGuideVariant("desktop");
        setGuideOpen(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={busy}
        className="cm-install-btn active:scale-[0.98]"
        aria-label={copy.buttonAria}
        title={copy.button}
      >
        <span aria-hidden className="text-[12px] leading-none sm:text-[13px]">
          📱
        </span>
        <span className="app-shell-chrome-label hidden sm:inline">{copy.buttonShort}</span>
        <span className="app-shell-chrome-label sm:hidden">{copy.buttonTiny}</span>
      </button>

      <InstallGuideModal
        open={guideOpen}
        variant={guideVariant}
        copy={copy}
        onClose={() => setGuideOpen(false)}
      />
    </>
  );
}
