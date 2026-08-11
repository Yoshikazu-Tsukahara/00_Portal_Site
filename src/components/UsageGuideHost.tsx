"use client";

import { useCallback, useState } from "react";
import UsageGuideModal from "@/components/UsageGuideModal";
import { useLocalStorageState } from "@/lib/localData";

/** LocalStorage キー（ガイド文言を大きく変えるときは VERSION を上げて再表示） */
export const USAGE_GUIDE_STORAGE_KEY = "blank-note:usage-guide";
const USAGE_GUIDE_VERSION = 1;

type UsageGuidePrefs = {
  version: number;
  /** true なら次回以降は出さない（サイトを開き直しても出さない） */
  hideNextTime: boolean;
};

const INITIAL_PREFS: UsageGuidePrefs = {
  version: USAGE_GUIDE_VERSION,
  hideNextTime: false,
};

/**
 * このタブのページロード中だけ有効な「閉じた」フラグ。
 * React state だとルート遷移で Host が再マウントされ、毎回ガイドが再表示されてしまう。
 * フルリロード／新規タブではモジュールが初期化され、チェックなしなら再び表示できる。
 */
let dismissedThisPageLoad = false;

/**
 * 初回利用ガイドの表示制御。
 * - チェックなしで閉じる: このサイト表示中は再表示しない（ページ移動でも出さない）
 * - チェックありで閉じる: LocalStorage に保存し、次回以降の訪問でも出さない
 * プレビュー埋め込み・独立 PWA standalone・没入型では SiteChrome 側でマウントしない。
 */
export default function UsageGuideHost() {
  const [prefs, setPrefs, { hydrated }] = useLocalStorageState<UsageGuidePrefs>(
    USAGE_GUIDE_STORAGE_KEY,
    INITIAL_PREFS,
  );
  const [closedThisLoad, setClosedThisLoad] = useState(
    () => dismissedThisPageLoad,
  );

  const suppressed =
    prefs.hideNextTime && prefs.version === USAGE_GUIDE_VERSION;
  const open = hydrated && !suppressed && !closedThisLoad;

  const handleClose = useCallback(
    (dontShowAgain: boolean) => {
      dismissedThisPageLoad = true;
      setClosedThisLoad(true);
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
