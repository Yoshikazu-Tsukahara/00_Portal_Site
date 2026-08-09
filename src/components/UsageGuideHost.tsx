"use client";

import { useCallback, useState } from "react";
import UsageGuideModal from "@/components/UsageGuideModal";
import { useLocalStorageState } from "@/lib/localData";

/** LocalStorage キー（ガイド文言を大きく変えるときは VERSION を上げて再表示） */
export const USAGE_GUIDE_STORAGE_KEY = "blank-note:usage-guide";
const USAGE_GUIDE_VERSION = 1;

type UsageGuidePrefs = {
  version: number;
  /** true なら次回以降は出さない */
  hideNextTime: boolean;
};

const INITIAL_PREFS: UsageGuidePrefs = {
  version: USAGE_GUIDE_VERSION,
  hideNextTime: false,
};

/**
 * 初回利用ガイドの表示制御。
 * プレビュー埋め込み・独立 PWA standalone・没入型では SiteChrome 側でマウントしない。
 */
export default function UsageGuideHost() {
  const [prefs, setPrefs, { hydrated }] = useLocalStorageState<UsageGuidePrefs>(
    USAGE_GUIDE_STORAGE_KEY,
    INITIAL_PREFS,
  );
  /** このセッションで閉じたら再表示しない（チェックなしでも） */
  const [closedThisSession, setClosedThisSession] = useState(false);

  const suppressed =
    prefs.hideNextTime && prefs.version === USAGE_GUIDE_VERSION;
  const open = hydrated && !suppressed && !closedThisSession;

  const handleClose = useCallback(
    (dontShowAgain: boolean) => {
      setClosedThisSession(true);
      if (dontShowAgain) {
        setPrefs({
          version: USAGE_GUIDE_VERSION,
          hideNextTime: true,
        });
      }
    },
    [setPrefs],
  );

  return <UsageGuideModal open={open} onClose={handleClose} />;
}
