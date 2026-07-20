"use client";

import { PresetAvatarIcon, type AvatarPresetId } from "./DefaultAvatars";

/** 丸型アバター（カスタム画像 or プリセット） */
export default function AvatarBubble({
  src = "",
  preset = "",
  size = "md",
  className = "",
}: {
  src?: string;
  preset?: AvatarPresetId | "";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "sm" ? "size-7" : size === "lg" ? "size-16" : "size-9";
  const padClass = size === "lg" ? "p-2.5" : size === "sm" ? "p-1" : "p-1.5";

  return (
    <span
      className={`${sizeClass} shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : preset ? (
        <span className={`flex size-full items-center justify-center ${padClass}`}>
          <PresetAvatarIcon id={preset} />
        </span>
      ) : (
        <span className="flex size-full items-center justify-center text-[10px] text-zinc-400">
          —
        </span>
      )}
    </span>
  );
}
