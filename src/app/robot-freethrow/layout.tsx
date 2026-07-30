import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";
import { ROBOT_FREETHROW_MANIFEST_PATH } from "./manifest";

export const metadata: Metadata = {
  title: "投射フリースロー",
  description:
    "角度・推力・スピンを指定してリングを狙う、投射運動のミニゲーム。",
  applicationName: "投射フリースロー",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "投射フリースロー",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: ROBOT_FREETHROW_MANIFEST_PATH,
  icons: {
    icon: [{ url: "/icons/robot-freethrow.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/robot-freethrow.svg" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3e6c8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/** 投射フリースロー: 独立 PWA 向けメタ・SW・standalone 時の操作ロック */
export default function RobotFreethrowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PwaRuntime
        basePath="/robot-freethrow"
        classPrefix="rft"
        scrollLock="hard"
      />
      {children}
    </>
  );
}
