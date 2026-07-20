"use client";

function UndoIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.7 2.9L3 13" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6.7 2.9L21 13" />
    </svg>
  );
}

/** Undo / Redo のコンパクトなアイコンボタン */
export default function HistoryToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-md border border-zinc-200 bg-white p-0.5"
      role="group"
      aria-label="履歴操作"
    >
      <button
        type="button"
        title="元に戻す (Ctrl+Z)"
        aria-label="元に戻す"
        disabled={!canUndo}
        onClick={onUndo}
        className="rounded p-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
      >
        <UndoIcon />
      </button>
      <button
        type="button"
        title="やり直す (Ctrl+Y)"
        aria-label="やり直す"
        disabled={!canRedo}
        onClick={onRedo}
        className="rounded p-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
      >
        <RedoIcon />
      </button>
    </div>
  );
}
