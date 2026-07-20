/** デフォルトのシルエット／シンボルアイコン（SVG） */

export const AVATAR_PRESETS = [
  "man",
  "woman",
  "boy",
  "girl",
  "org",
  "company",
  "other",
] as const;

export type AvatarPresetId = (typeof AVATAR_PRESETS)[number];

export function isAvatarPresetId(v: unknown): v is AvatarPresetId {
  return typeof v === "string" && (AVATAR_PRESETS as readonly string[]).includes(v);
}

/** プリセットの丸型アイコン */
export function PresetAvatarIcon({
  id,
  className = "",
}: {
  id: AvatarPresetId;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 40 40",
    className: `size-full text-zinc-500 ${className}`,
    "aria-hidden": true as const,
  };

  switch (id) {
    case "man":
      return (
        <svg {...common}>
          <circle cx="20" cy="13" r="6.5" fill="currentColor" />
          <path
            d="M8 34c1.5-8 6-12 12-12s10.5 4 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "woman":
      return (
        <svg {...common}>
          <circle cx="20" cy="12" r="6" fill="currentColor" />
          <path
            d="M10 34c1-7 4.5-11 10-11s9 4 10 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M14 22.5c2 3.5 4 5 6 5s4-1.5 6-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "boy":
      return (
        <svg {...common}>
          <circle cx="20" cy="14" r="5.5" fill="currentColor" />
          <path
            d="M11 33c1.2-6.5 4.8-9.5 9-9.5s7.8 3 9 9.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M14 10.5c1.5-2.5 3.5-3.5 6-3.5s4.5 1 6 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "girl":
      return (
        <svg {...common}>
          <circle cx="20" cy="13.5" r="5" fill="currentColor" />
          <path
            d="M12 33c1-6 4-9 8-9s7 3 8 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M13 18c1.5 2.5 3.5 3.5 7 3.5s5.5-1 7-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="14.5" cy="20" r="1.2" fill="currentColor" />
          <circle cx="25.5" cy="20" r="1.2" fill="currentColor" />
        </svg>
      );
    case "org":
      return (
        <svg {...common}>
          <rect x="9" y="10" width="8" height="8" rx="1.5" fill="currentColor" />
          <rect x="23" y="10" width="8" height="8" rx="1.5" fill="currentColor" />
          <rect x="16" y="22" width="8" height="8" rx="1.5" fill="currentColor" />
          <path
            d="M13 18v2.5h14V18M20 20.5V22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "company":
      return (
        <svg {...common}>
          <path
            d="M11 32V14l9-5 9 5v18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M16 32v-7h8v7M16 18h2.5M21.5 18H24M16 23h2.5M21.5 23H24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "other":
      return (
        <svg {...common}>
          <circle
            cx="20"
            cy="20"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          />
          <circle cx="20" cy="20" r="3.2" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}
