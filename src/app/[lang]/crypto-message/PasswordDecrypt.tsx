"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { DecryptionFailedError, decryptMessage } from "./lib/aesGcm";
import { useCryptoAudio, vibrateCharLock, vibrateComplete } from "./lib/audio";
import { detectThemeAndDecode } from "./lib/cipherThemeCodec";
import ProgressLog from "./ProgressLog";
import ScrambleText from "./ScrambleText";
import { useScrambleReveal } from "./useScrambleReveal";

/** ①「ひみつメッセージ」モード：受信側（合言葉で解読 ＋ スクランブル演出） */
export default function PasswordDecrypt() {
  const { t } = useI18n();
  const copy = t.apps.cryptoMessage.decrypt;

  const [cipherInput, setCipherInput] = useState("");
  const [password, setPassword] = useState("");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [runId, setRunId] = useState(0);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);

  const audio = useCryptoAudio(muted);
  const { playShuffleTick, playLockTick, playUnlockChime, playErrorBuzz, primeAudio } =
    audio;
  const completedOnceRef = useRef(false);

  const reveal = useScrambleReveal({
    onCharLock: () => {
      playLockTick();
      vibrateCharLock();
    },
    onComplete: () => {
      if (completedOnceRef.current) return;
      completedOnceRef.current = true;
      playUnlockChime();
      vibrateComplete();
      setDone(true);
    },
  });

  // シャッフル中は「チチチチ…」を間引き再生
  useEffect(() => {
    if (!reveal.isRunning || muted) return;
    const id = window.setInterval(() => {
      playShuffleTick();
    }, 90);
    return () => window.clearInterval(id);
  }, [reveal.isRunning, muted, playShuffleTick]);

  const canDecrypt =
    cipherInput.trim().length > 0 &&
    password.length > 0 &&
    !busy &&
    !reveal.isRunning;

  function beginReveal(plaintext: string) {
    completedOnceRef.current = false;
    setDone(false);
    setError(null);
    setShake(false);
    setRunId((v) => v + 1);
    reveal.start(plaintext);
  }

  async function handleDecrypt() {
    if (!canDecrypt) return;
    primeAudio();
    setBusy(true);
    setError(null);
    setDone(false);
    setShake(false);
    reveal.reset();
    completedOnceRef.current = false;

    const bytes = detectThemeAndDecode(cipherInput);
    if (!bytes) {
      setError(copy.formatError);
      playErrorBuzz();
      triggerShake();
      setBusy(false);
      return;
    }

    try {
      const plaintext = await decryptMessage(bytes, password);
      beginReveal(plaintext);
    } catch (e) {
      const message =
        e instanceof DecryptionFailedError
          ? copy.wrongPassword
          : copy.decryptError;
      setError(message);
      playErrorBuzz();
      triggerShake();
    } finally {
      setBusy(false);
    }
  }

  function handleSkip() {
    reveal.skip();
  }

  function triggerShake() {
    setShake(true);
    window.setTimeout(() => setShake(false), 420);
  }

  return (
    <div className="cm-subpanel min-w-0">
      <div className="cm-field">
        <label className="cm-field__label" htmlFor="cm-cipher-input">
          {copy.cipherLabel}
        </label>
        <textarea
          id="cm-cipher-input"
          className="cm-textarea cm-textarea--mono"
          rows={3}
          value={cipherInput}
          onChange={(e) => setCipherInput(e.target.value)}
          placeholder={copy.cipherPlaceholder}
        />
      </div>

      <div className="cm-field">
        <label className="cm-field__label" htmlFor="cm-decrypt-password">
          {copy.passwordLabel}
        </label>
        <input
          id="cm-decrypt-password"
          type="password"
          className="cm-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={copy.passwordPlaceholder}
          autoComplete="off"
        />
      </div>

      <div className="cm-decrypt-actions">
        <button
          type="button"
          className="cm-primary-btn"
          onClick={() => void handleDecrypt()}
          disabled={!canDecrypt}
        >
          {busy ? copy.analyzing : copy.start}
        </button>
        <button
          type="button"
          className={`cm-ghost-btn${muted ? " cm-ghost-btn--muted" : ""}`}
          onClick={() => {
            primeAudio();
            setMuted((v) => !v);
          }}
          aria-pressed={muted}
          title={muted ? copy.muteOff : copy.muteOn}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        {reveal.isRunning ? (
          <button type="button" className="cm-ghost-btn" onClick={handleSkip}>
            {copy.skip}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className={`cm-error${shake ? " cm-error--shake" : ""}`}>
          ⚠ {error}
        </p>
      ) : null}

      <div className="cm-terminal">
        <div className="cm-terminal__head">
          <span className="cm-terminal__dot cm-terminal__dot--red" aria-hidden />
          <span
            className="cm-terminal__dot cm-terminal__dot--yellow"
            aria-hidden
          />
          <span
            className="cm-terminal__dot cm-terminal__dot--green"
            aria-hidden
          />
          <span className="cm-terminal__title">decrypt_console</span>
        </div>
        <div className="cm-terminal__body">
          <ScrambleText
            chars={reveal.chars}
            placeholder={copy.resultPlaceholder}
          />
        </div>
        <ProgressLog active={reveal.isRunning} resetKey={runId} />
      </div>

      {done ? <p className="cm-success">{copy.done}</p> : null}
    </div>
  );
}
