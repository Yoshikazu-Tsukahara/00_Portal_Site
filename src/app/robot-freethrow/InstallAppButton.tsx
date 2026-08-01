"use client";

import PwaInstallButton from "@/components/PwaInstallButton";
import type { RobotFreethrowDict } from "@/i18n/apps/robotFreethrow";

/** 投射フリースロー向け「ホームに追加」（共通ボタンへ委譲） */
export default function InstallAppButton({
  copy,
}: {
  copy: RobotFreethrowDict["install"];
}) {
  return <PwaInstallButton copy={copy} />;
}
