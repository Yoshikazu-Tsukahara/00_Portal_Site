import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "モンスタードライバー",
  description:
    "赤信号で止まれ、青で飛び出せ。ウィンカー記憶と反応速度が試される一人称発進アクション。",
  applicationName: "モンスタードライバー",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/** モンスタードライバー：ポータル掲載用メタ */
export default function MonsterDriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
