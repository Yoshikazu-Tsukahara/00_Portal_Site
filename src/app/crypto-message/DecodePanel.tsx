"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import CaesarChallenge from "./CaesarChallenge";
import PasswordDecrypt from "./PasswordDecrypt";
import type { DecodeSubMode } from "./types";

/** ②「解読・チャレンジ」タブ：合言葉での解読／シーザー暗号パズルを切り替える */
export default function DecodePanel() {
  const { t } = useI18n();
  const copy = t.apps.cryptoMessage.decodeSubs;
  const [sub, setSub] = useState<DecodeSubMode>("password");

  return (
    <div className="cm-panel min-w-0">
      <div className="cm-subtabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={sub === "password"}
          className={`cm-subtab${sub === "password" ? " cm-subtab--active" : ""}`}
          onClick={() => setSub("password")}
        >
          <span className="sm:hidden">{copy.passwordShort}</span>
          <span className="hidden sm:inline">{copy.password}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sub === "caesar"}
          className={`cm-subtab${sub === "caesar" ? " cm-subtab--active" : ""}`}
          onClick={() => setSub("caesar")}
        >
          <span className="sm:hidden">{copy.caesarShort}</span>
          <span className="hidden sm:inline">{copy.caesar}</span>
        </button>
      </div>

      {sub === "password" ? <PasswordDecrypt /> : <CaesarChallenge />}
    </div>
  );
}
