"use client";

import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { UrlCleanerDict } from "@/i18n/apps/urlCleaner";

type Props = {
  value: string;
  labels: UrlCleanerDict["qr"];
};

/** 整形済み URL の QR コード（Canvas・完全クライアント側生成） */
export default function QrCodePanel({ value, labels }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setFailed(false);

    void import("qrcode").then((QRCode) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, value, {
        width: 168,
        margin: 2,
        errorCorrectionLevel: "M",
      })
        .then(() => {
          if (!cancelled) setReady(true);
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [value]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "url-cleaner-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  if (failed) {
    return (
      <p className="text-center text-[11px] font-medium text-rose-600">
        {labels.failed}
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:shrink-0">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
        {labels.title}
      </span>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={labels.title}
        className={`rounded-xl border border-zinc-200 bg-white p-1 shadow-sm transition-opacity duration-150 ${
          ready ? "opacity-100" : "opacity-40"
        }`}
      />
      <button
        type="button"
        onClick={handleDownload}
        disabled={!ready}
        aria-label={labels.downloadAria}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="size-3.5" aria-hidden />
        {labels.download}
      </button>
    </div>
  );
}
