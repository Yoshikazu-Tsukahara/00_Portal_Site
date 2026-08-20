export type ClipboardReadResult =
  | { ok: true; text: string }
  | { ok: false; reason: "unsupported" | "denied" | "unknown" };

/** クリップボードからテキストを読み取る（ボタン押下の直後に呼ぶ） */
export async function readClipboardText(): Promise<ClipboardReadResult> {
  if (!navigator.clipboard?.readText) {
    return { ok: false, reason: "unsupported" };
  }
  try {
    const text = await navigator.clipboard.readText();
    return { ok: true, text };
  } catch (err) {
    const name = err instanceof DOMException ? err.name : "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      return { ok: false, reason: "denied" };
    }
    return { ok: false, reason: "unknown" };
  }
}
