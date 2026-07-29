import type { Metadata, Viewport } from "next";



export const metadata: Metadata = {

  title: "手書きノート風 投射フリースロー",

  description:

    "ノートの図解問題が物理演算で動く。角度・初速・スピンでリングを狙う力学ミニゲーム。",

  applicationName: "投射フリースロー",

};



export const viewport: Viewport = {

  themeColor: "#f3e6c8",

  width: "device-width",

  initialScale: 1,

  maximumScale: 1,

  userScalable: false,

  viewportFit: "cover",

};



/** 投射フリースロー：ポータル掲載用メタ */

export default function RobotFreethrowLayout({

  children,

}: {

  children: React.ReactNode;

}) {

  return children;

}

