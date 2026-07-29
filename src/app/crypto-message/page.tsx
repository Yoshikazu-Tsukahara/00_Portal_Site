"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { LanguageToggle, useI18n } from "@/i18n";
import CreatePanel from "./CreatePanel";
import DecodePanel from "./DecodePanel";
import InstallAppButton from "./InstallAppButton";
import { usePwaInstall } from "./usePwaInstall";
import type { TopMode } from "./types";

/**
 * ひみつメッセージ / 解読チャレンジ
 * サーバー通信なし・完全ローカル完結の暗号生成・解読パズルアプリ。
 */
export default function CryptoMessagePage() {
  const { t } = useI18n();
  const copy = t.apps.cryptoMessage;
  const { isStandalone } = usePwaInstall();
  const [mode, setMode] = useState<TopMode>("create");

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      wide
      fillViewport
      hidePortalLink={isStandalone}
      actions={isStandalone ? <LanguageToggle /> : undefined}
      afterDataManager={<InstallAppButton copy={copy.install} />}
    >
      <div className="cm-root">
        <div className="cm-console">
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
              {copy.modes.create}
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
              {copy.modes.decode}
            </button>
          </div>

          <div className="cm-console__body">
            {mode === "create" ? <CreatePanel /> : <DecodePanel />}
          </div>
        </div>

        <p className="cm-privacy-note">{copy.privacyNote}</p>
      </div>
    </AppShell>
  );
}
