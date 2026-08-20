/** クラシックな PDF ファイルアイコン（紙＋赤い PDF 帯） */
export default function PdfFileGlyph({
  className = "h-14 w-12",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 56"
      fill="none"
      aria-hidden
    >
      {/* 紙 */}
      <path
        d="M8 2h22l10 10v40a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
        fill="#ffffff"
        stroke="#27272a"
        strokeWidth="1.5"
      />
      {/* 折り返し */}
      <path
        d="M30 2v8a2 2 0 0 0 2 2h8"
        fill="#f4f4f5"
        stroke="#27272a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* 行のイメージ */}
      <path
        d="M12 18h16M12 23h14M12 38h16M12 43h10"
        stroke="#d4d4d8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* PDF 帯 */}
      <rect x="0" y="26" width="48" height="10" rx="1" fill="#dc2626" />
      <text
        x="24"
        y="33.5"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="7.5"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        letterSpacing="0.08em"
      >
        PDF
      </text>
    </svg>
  );
}
