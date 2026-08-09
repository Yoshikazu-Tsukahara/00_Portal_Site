"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  type LaunchOrigin,
  prefersReducedMotion,
} from "@/lib/launcher/motion";

type Props = {
  href: string;
  icon: ReactNode;
  title: string;
  origin: LaunchOrigin | null;
};

/** ズーム完了〜遷移までの待ち（CSS と揃える） */
const NAV_MS = 420;

/** 画面中央からのオフセット（拡大の起点） */
function appLaunchVars(origin: LaunchOrigin | null): CSSProperties {
  if (!origin || typeof window === "undefined") {
    return {
      ["--launcher-from-x" as string]: "0px",
      ["--launcher-from-y" as string]: "0px",
      ["--launcher-start-size" as string]: "4.5rem",
    };
  }
  const cx = origin.x + origin.width / 2;
  const cy = origin.y + origin.height / 2;
  const size = Math.max(origin.width, origin.height);
  return {
    ["--launcher-from-x" as string]: `${cx - window.innerWidth / 2}px`,
    ["--launcher-from-y" as string]: `${cy - window.innerHeight / 2}px`,
    ["--launcher-start-size" as string]: `${size}px`,
  };
}

/**
 * ホームからアプリを開くときの全画面ズーム遷移（スマホ風）。
 * アニメ後に同一タブへ遷移する。
 */
export default function LauncherAppLaunch({
  href,
  icon,
  title,
  origin,
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"enter" | "expand">("enter");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const go = () => {
      router.push(href);
    };

    if (prefersReducedMotion()) {
      go();
      return;
    }

    const raf = requestAnimationFrame(() => {
      setPhase("expand");
    });

    const timer = window.setTimeout(go, NAV_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [mounted, href, router]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`launcher-app-launch${phase === "expand" ? " launcher-app-launch--expand" : ""}`}
      style={appLaunchVars(origin)}
      role="presentation"
      aria-hidden
    >
      <div className="launcher-app-launch__surface">
        <div className="launcher-app-launch__glyph" aria-hidden>
          {icon}
        </div>
        <p className="launcher-app-launch__title">{title}</p>
      </div>
    </div>,
    document.body,
  );
}
