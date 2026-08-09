"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useI18n } from "@/i18n";
import CreatePanel from "./CreatePanel";
import DecodePanel from "./DecodePanel";
import InstallAppButton from "./InstallAppButton";
import type { TopMode } from "./types";

/**
 * ひみつメッセージ / 解読チャレンジ
 * サーバー通信なし・完全ローカル完結の暗号生成・解読パズルアプリ。
 */
export default function CryptoMessagePage() {
  const { t } = useI18n();
  const copy = t.apps.cryptoMessage;
  const [mode, setMode] = useState<TopMode>("create");

  return (
    <AppShell
      privacyNotice="plain"
      title={copy.shell.title}
      description={copy.shell.description}
      fillViewport
      isPwa
      afterDataManager={<InstallAppButton copy={copy.install} />}
    >
      <div className="cm-root min-w-0 w-full max-w-full overflow-x-hidden">
        <div className="cm-console min-w-0">
          <div className="cm-mode-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "create"}
              className={`cm-mode-tab${
                mode === "create" ? " cm-mode-tab--active" : ""
              }`}
              onClick={() => setMode("create")}
            >
              <span className="sm:hidden">{copy.modes.createShort}</span>
              <span className="hidden sm:inline">{copy.modes.create}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "decode"}
              className={`cm-mode-tab${
                mode === "decode" ? " cm-mode-tab--active" : ""
              }`}
              onClick={() => setMode("decode")}
            >
              <span className="sm:hidden">{copy.modes.decodeShort}</span>
              <span className="hidden sm:inline">{copy.modes.decode}</span>
            </button>
          </div>

          <div className="cm-console__body min-w-0">
            {mode === "create" ? <CreatePanel /> : <DecodePanel />}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
