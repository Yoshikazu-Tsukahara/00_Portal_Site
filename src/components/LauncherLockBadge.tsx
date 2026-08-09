/** ホームアイコン用のロック印（スマホ非対応・縦長時） */
export default function LauncherLockBadge() {
  return (
    <span className="launcher-icon__lock" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
      </svg>
    </span>
  );
}
