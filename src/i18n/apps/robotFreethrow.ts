import type { AppShellCopy } from "./otherApps";

/** 投射フリースローの UI 文言（シェル＋インストール） */
export type RobotFreethrowDict = {
  shell: AppShellCopy;
  install: {
    button: string;
    buttonShort: string;
    buttonAria: string;
    iosHint: string;
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
    buttonAria: "投射フリースローをホーム画面に追加してアプリとして使う",
    iosHint:
      "Safari の共有ボタンから「ホーム画面に追加」を選ぶと、投射フリースローを単独アプリとして開けます。",
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
    buttonAria: "Add Projectile Freethrow to your home screen as a standalone app",
    iosHint:
      "In Safari, open Share and choose “Add to Home Screen” to launch Projectile Freethrow as its own app.",
  },
};
