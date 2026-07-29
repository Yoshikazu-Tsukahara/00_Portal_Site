"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { encryptMessage } from "./lib/aesGcm";
import { bytesToThemedString } from "./lib/cipherThemeCodec";
import ThemeSelector from "./ThemeSelector";
import { THEME_META, type CipherTheme } from "./types";

/** ①「ひみつメッセージ」モード：送信側（合言葉で暗号化） */
export default function CreatePanel() {
  const { t } = useI18n();
  const copy = t.apps.cryptoMessage.create;

  const [plaintext, setPlaintext] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState<CipherTheme>("cyber");
  const [output, setOutput] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canEncrypt = plaintext.trim().length > 0 && password.length > 0 && !busy;

  function buildShareText(themedCipher: string): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return [
      copy.shareIntro,
      "",
      themedCipher,
      "",
      copy.shareOutro,
      `${origin}/crypto-message`,
    ].join("\n");
  }

  function clearOutput() {
    if (output) setOutput(null);
  }

  async function handleEncrypt() {
    if (!canEncrypt) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await encryptMessage(plaintext, password);
      setOutput(bytesToThemedString(bytes, theme));
    } catch {
      setError(copy.encryptError);
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.alert(copy.copyFail);
    }
  }

  function openShare(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleShareLine() {
    if (!output) return;
    const text = encodeURIComponent(buildShareText(output));
    openShare(`https://social-plugins.line.me/lineit/share?text=${text}`);
  }

  function handleShareX() {
    if (!output) return;
    const text = encodeURIComponent(buildShareText(output));
    openShare(`https://twitter.com/intent/tweet?text=${text}`);
  }

  return (
    <div className="cm-panel">
      <div className="cm-field">
        <label className="cm-field__label" htmlFor="cm-plaintext">
          {copy.messageLabel}
        </label>
        <textarea
          id="cm-plaintext"
          className="cm-textarea"
          rows={5}
          value={plaintext}
          onChange={(e) => {
            setPlaintext(e.target.value);
            clearOutput();
          }}
          placeholder={copy.messagePlaceholder}
          maxLength={4000}
        />
      </div>

      <div className="cm-field">
        <label className="cm-field__label" htmlFor="cm-password">
          {copy.passwordLabel}
        </label>
        <div className="cm-password-row">
          <input
            id="cm-password"
            type={showPassword ? "text" : "password"}
            className="cm-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearOutput();
            }}
            placeholder={copy.passwordPlaceholder}
            autoComplete="off"
          />
          <button
            type="button"
            className="cm-ghost-btn"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? copy.hidePassword : copy.showPassword}
          </button>
        </div>
        <p className="cm-field__hint">{copy.passwordHint}</p>
      </div>

      <div className="cm-field">
        <span className="cm-field__label">{copy.themeLabel}</span>
        <ThemeSelector
          value={theme}
          onChange={(next) => {
            setTheme(next);
            clearOutput();
          }}
        />
      </div>

      <button
        type="button"
        className="cm-primary-btn"
        onClick={() => void handleEncrypt()}
        disabled={!canEncrypt}
      >
        {busy ? copy.encrypting : copy.encrypt}
      </button>

      {error ? <p className="cm-error">⚠ {error}</p> : null}

      {output ? (
        <div className="cm-output" data-theme={theme}>
          <div className="cm-output__head">
            <span className="cm-output__label">
              {THEME_META[theme].icon} {copy.cipherLabel}（
              {THEME_META[theme].label}）
            </span>
            <button type="button" className="cm-ghost-btn" onClick={() => void handleCopy()}>
              {copied ? copy.copied : copy.copy}
            </button>
          </div>
          <pre className="cm-output__text">{output}</pre>
          <div className="cm-share-row">
            <button
              type="button"
              className="cm-share-btn cm-share-btn--line"
              onClick={handleShareLine}
            >
              {copy.shareLine}
            </button>
            <button
              type="button"
              className="cm-share-btn cm-share-btn--x"
              onClick={handleShareX}
            >
              {copy.shareX}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
