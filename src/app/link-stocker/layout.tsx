import type { Metadata, Viewport } from "next";
import LinkStockerPwaEffects from "./LinkStockerPwaEffects";
import RegisterSW from "./RegisterSW";
import { LINK_STOCKER_MANIFEST_PATH } from "./manifest";

export const metadata: Metadata = {
  title: "とりあえずキープ",
  description:
    "とりあえずキープしたい URL を、OGP サムネ付きカードで視覚的に管理。",
  applicationName: "とりあえずキープ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "キープ",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: LINK_STOCKER_MANIFEST_PATH,
  icons: {
    icon: [{ url: "/icons/link-stocker.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/link-stocker.svg" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  /** ランチ貯金と同系のエメラルド */
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** とりあえずキープ: 独立 PWA 向けメタ・SW */
export default function LinkStockerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RegisterSW />
      <LinkStockerPwaEffects />
      {children}
    </>
  );
}
