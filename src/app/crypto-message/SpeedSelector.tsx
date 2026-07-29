"use client";

import { useI18n } from "@/i18n";
import type { RevealSpeed } from "./types";

const ORDER: RevealSpeed[] = ["slow", "normal", "fast"];

type Props = {
  value: RevealSpeed;
  onChange: (speed: RevealSpeed) => void;
};

/** 解読スピード調整スライダー（じっくり／標準／爆速） */
export default function SpeedSelector({ value, onChange }: Props) {
  const { t } = useI18n();
  const copy = t.apps.cryptoMessage.speed;
  const index = ORDER.indexOf(value);
  const labels: Record<RevealSpeed, string> = {
    slow: copy.slow,
    normal: copy.normal,
    fast: copy.fast,
  };

  return (
    <div className="cm-speed">
      <div className="cm-speed__head">
        <span className="cm-speed__label">{copy.label}</span>
        <span className="cm-speed__value">{labels[value]}</span>
      </div>
      <input
        type="range"
        min={0}
        max={2}
        step={1}
        value={index}
        onChange={(e) => onChange(ORDER[Number(e.target.value)])}
        className="cm-speed__range"
        aria-label={copy.aria}
      />
      <div className="cm-speed__ticks" aria-hidden>
        {ORDER.map((speed) => (
          <span
            key={speed}
            className={`cm-speed__tick${
              speed === value ? " cm-speed__tick--active" : ""
            }`}
          >
            {labels[speed]}
          </span>
        ))}
      </div>
    </div>
  );
}
