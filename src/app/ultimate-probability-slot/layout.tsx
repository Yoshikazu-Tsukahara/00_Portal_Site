import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";

export const metadata: Metadata = {
  title: "究極確率スロット",
  description:
    "自作の天文学的低確率スロットで「当たるまで」「外し続ける」に挑む、無機質な演算エンジン。",
  applicationName: "究極確率スロット",
  appleWebApp: {
    capable: false,
    statusBarStyle: "black-translucent",
    title: "究極確率スロット",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icons/ultimate-probability-slot-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/ultimate-probability-slot-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [{ url: "/icons/ultimate-probability-slot-192.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  /** アクセントのゴールド（マニフェスト theme_color と一致） */
  themeColor: "#eab308",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/** 究極確率スロット: 独立 PWA 向けメタ・SW・standalone 時の操作ロック */
export default function UltimateProbabilitySlotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PwaRuntime
        basePath="/ultimate-probability-slot"
        classPrefix="slot"
        scrollLock="hard"
      />
      {children}
    </>
  );
}
