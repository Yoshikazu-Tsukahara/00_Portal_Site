"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import FrequencyChart from "./FrequencyChart";
import { caesarShift, charFrequency } from "./lib/caesar";

const MIN_SHIFT = -13;
const MAX_SHIFT = 13;

function randomNonZeroShift(): number {
  let s = 0;
  while (s === 0) {
    s = Math.floor(Math.random() * (MAX_SHIFT - MIN_SHIFT + 1)) + MIN_SHIFT;
  }
  return s;
}

/** ②「解読チャレンジ」モード：シーザー暗号（文字ずらし）パズル */
export default function CaesarChallenge() {
  const { t } = useI18n();
  const copy = t.apps.cryptoMessage.caesar;

  const [puzzleSource, setPuzzleSource] = useState("");
  const [puzzleShift, setPuzzleShift] = useState<number | null>(null);
  const [generated, setGenerated] = useState("");
  const [copiedGenerated, setCopiedGenerated] = useState(false);

  const [cipherInput, setCipherInput] = useState("");
  const [shift, setShift] = useState(0);

  const decoded = useMemo(
    () => caesarShift(cipherInput, shift),
    [cipherInput, shift],
  );
  const freq = useMemo(() => charFrequency(cipherInput), [cipherInput]);

  function buildShareText(cipher: string): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return [
      copy.shareIntro,
      copy.shareHint,
      "",
      cipher,
      "",
      `${origin}/crypto-message`,
    ].join("\n");
  }

  function handleGenerate() {
    if (!puzzleSource.trim()) return;
    const s = randomNonZeroShift();
    setPuzzleShift(s);
    setGenerated(caesarShift(puzzleSource, s));
  }

  async function handleCopyGenerated() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setCopiedGenerated(true);
      window.setTimeout(() => setCopiedGenerated(false), 1800);
    } catch {
      window.alert(copy.copyFail);
    }
  }

  function sendToDecoder() {
    setCipherInput(generated);
    setShift(0);
  }

  function openShare(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleShareLine() {
    if (!generated) return;
    const text = encodeURIComponent(buildShareText(generated));
    openShare(`https://social-plugins.line.me/lineit/share?text=${text}`);
  }

  function handleShareX() {
    if (!generated) return;
    const text = encodeURIComponent(buildShareText(generated));
    openShare(`https://twitter.com/intent/tweet?text=${text}`);
  }

  return (
    <div className="cm-subpanel">
      <details className="cm-collapse">
        <summary className="cm-collapse__summary">{copy.createTitle}</summary>
        <div className="cm-collapse__body">
          <p className="cm-field__hint">{copy.createHint}</p>
          <textarea
            className="cm-textarea"
            rows={3}
            value={puzzleSource}
            onChange={(e) => setPuzzleSource(e.target.value)}
            placeholder={copy.createPlaceholder}
          />
          <button
            type="button"
            className="cm-primary-btn cm-primary-btn--sm"
            onClick={handleGenerate}
            disabled={!puzzleSource.trim()}
          >
            {copy.generate}
          </button>

          {generated ? (
            <div className="cm-output" data-theme="spy">
              <pre className="cm-output__text">{generated}</pre>
              <div className="cm-share-row">
                <button
                  type="button"
                  className="cm-ghost-btn"
                  onClick={() => void handleCopyGenerated()}
                >
                  {copiedGenerated ? copy.copied : copy.copy}
                </button>
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
                <button
                  type="button"
                  className="cm-ghost-btn"
                  onClick={sendToDecoder}
                >
                  {copy.tryYourself}
                </button>
              </div>
              <details className="cm-spoiler">
                <summary>{copy.spoilerSummary}</summary>
                <p className="cm-spoiler__body">
                  {copy.spoilerShift}: {puzzleShift}
                </p>
              </details>
            </div>
          ) : null}
        </div>
      </details>

      <div className="cm-field">
        <label className="cm-field__label" htmlFor="cm-caesar-input">
          {copy.cipherLabel}
        </label>
        <textarea
          id="cm-caesar-input"
          className="cm-textarea cm-textarea--mono"
          rows={4}
          value={cipherInput}
          onChange={(e) => setCipherInput(e.target.value)}
          placeholder={copy.cipherPlaceholder}
        />
      </div>

      <div className="cm-shift-slider">
        <div className="cm-shift-slider__head">
          <span>{copy.shiftLabel}</span>
          <span className="cm-shift-slider__value">
            {shift > 0 ? `+${shift}` : shift}
          </span>
        </div>
        <input
          type="range"
          min={MIN_SHIFT}
          max={MAX_SHIFT}
          step={1}
          value={shift}
          onChange={(e) => setShift(Number(e.target.value))}
          className="cm-shift-slider__range"
          aria-label={copy.shiftAria}
        />
        <div className="cm-shift-slider__ticks" aria-hidden>
          <span>-13</span>
          <span>0</span>
          <span>+13</span>
        </div>
      </div>

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
          <span className="cm-terminal__title">caesar_preview</span>
        </div>
        <div className="cm-terminal__body">
          {decoded ? (
            <p className="cm-scramble-text">{decoded}</p>
          ) : (
            <p className="cm-scramble-text cm-scramble-text--empty">
              {copy.previewEmpty}
            </p>
          )}
        </div>
      </div>

      <div className="cm-field">
        <span className="cm-field__label">{copy.freqLabel}</span>
        <FrequencyChart entries={freq} emptyLabel={copy.freqEmpty} />
      </div>
    </div>
  );
}
