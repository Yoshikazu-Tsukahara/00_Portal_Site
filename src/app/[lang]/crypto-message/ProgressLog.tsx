"use client";

import { useEffect, useRef, useState } from "react";

// ダミーの解析ログ（演出用。実際の処理内容とは無関係）
const VERBS = [
  "Decrypting",
  "Parsing",
  "Validating",
  "Scanning",
  "Rebuilding",
  "Verifying",
  "Indexing",
];
const NOUNS = [
  "Byte Block",
  "Packet",
  "Segment",
  "Cipher Frame",
  "Key Fragment",
  "Checksum",
  "Header",
];
const STATUSES = ["Success", "OK", "Matched", "Verified", "Complete"];

function randomHexAddr(): string {
  const digits = Math.random() > 0.5 ? 2 : 4;
  let out = "0x";
  for (let i = 0; i < digits; i++) {
    out += Math.floor(Math.random() * 16).toString(16).toUpperCase();
  }
  return out;
}

function randomLogLine(): string {
  const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  return `[System] ${verb} ${noun} ${randomHexAddr()}... ${status}`;
}

type Props = {
  /** 解析中（true の間、ログを流し続ける） */
  active: boolean;
  /** 値が変わるたびログをクリアする（新しい解読セッションの開始トリガー） */
  resetKey: number;
};

/** 画面下部に流れる「いかにも解析してます」感のあるダミーログ演出 */
export default function ProgressLog({ active, resetKey }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  // resetKey が変わったら、レンダー中にログをクリアする
  // （React 推奨の「props の変化に応じて state を調整する」パターン。
  //  effect 内で setState すると余分な再レンダーが発生するため避ける）
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setLines([]);
  }
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => {
      setLines((prev) => {
        const next = [...prev, randomLogLine()];
        return next.length > 30 ? next.slice(next.length - 30) : next;
      });
    }, 90);
    return () => window.clearInterval(interval);
  }, [active]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines]);

  if (lines.length === 0) return null;

  return (
    <div ref={scrollRef} className="cm-log" aria-hidden="true">
      {lines.map((line, i) => (
        <div key={i} className="cm-log__line">
          {line}
        </div>
      ))}
    </div>
  );
}
