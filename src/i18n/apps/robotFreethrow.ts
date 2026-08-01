import type { AppShellCopy } from "./otherApps";

/** 投射フリースローの UI 文言（シェル＋インストール） */
export type RobotFreethrowDict = {
  shell: AppShellCopy;
  install: {
    button: string;
    buttonShort: string;
    buttonTiny: string;
    buttonAria: string;
    modalTitle: string;
    modalLead: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    desktopTitle: string;
    desktopLead: string;
    desktopStep1Title: string;
    desktopStep1Body: string;
    desktopStep2Title: string;
    desktopStep2Body: string;
    modalClose: string;
  };
};

export const robotFreethrowJa: RobotFreethrowDict = {
  shell: {
    title: "投射フリースロー",
    description:
      "角度・推力・スピンを指定してリングを狙う、投射運動のミニゲーム。",
  },
  install: {
    button: "このアプリをホーム画面に追加",
    buttonShort: "ホームに追加",
    buttonTiny: "追加",
    buttonAria: "投射フリースローをホーム画面に追加してアプリとして使う",
    modalTitle: "ホーム画面に追加",
    modalLead:
      "Safari からホーム画面に追加すると、投射フリースローだけを独立アプリとしてすぐ開けます。",
    step1Title: "共有をタップ",
    step1Body: "画面下（または上）の共有アイコン［↑］をタップします。",
    step2Title: "「ホーム画面に追加」",
    step2Body: "メニューを下にスクロールし、「ホーム画面に追加」を選びます。",
    desktopTitle: "アプリとしてインストール",
    desktopLead:
      "Chrome / Edge なら、アドレスバーやメニューから投射フリースローを独立アプリとして追加できます。",
    desktopStep1Title: "ブラウザのメニューを開く",
    desktopStep1Body:
      "画面右上の「︙」またはアドレスバー横のインストールアイコンを探します。",
    desktopStep2Title: "「アプリをインストール」",
    desktopStep2Body:
      "「投射フリースローをインストール」や「アプリをインストール」を選ぶとホーム／デスクトップに追加されます。",
    modalClose: "わかった",
  },
};

export const robotFreethrowEn: RobotFreethrowDict = {
  shell: {
    title: "Projectile Freethrow",
    description:
      "Dial in angle, thrust, and spin to sink the shot in a projectile physics mini-game.",
  },
  install: {
    button: "Add this app to Home Screen",
    buttonShort: "Add to Home",
    buttonTiny: "Add",
    buttonAria:
      "Add Projectile Freethrow to your home screen as a standalone app",
    modalTitle: "Add to Home Screen",
    modalLead:
      "Add Projectile Freethrow from Safari to open it as its own app — not the portal.",
    step1Title: "Tap Share",
    step1Body: "Tap the Share icon [↑] at the bottom (or top) of Safari.",
    step2Title: "Add to Home Screen",
    step2Body: "Scroll the menu and choose “Add to Home Screen”.",
    desktopTitle: "Install as an app",
    desktopLead:
      "In Chrome or Edge, install Projectile Freethrow as its own app from the address bar or browser menu.",
    desktopStep1Title: "Open the browser menu",
    desktopStep1Body:
      "Look for the ⋮ menu or the install icon near the address bar.",
    desktopStep2Title: "Install app",
    desktopStep2Body:
      "Choose “Install Projectile Freethrow” / “Install app” to add it to your home screen or desktop.",
    modalClose: "Got it",
  },
};
