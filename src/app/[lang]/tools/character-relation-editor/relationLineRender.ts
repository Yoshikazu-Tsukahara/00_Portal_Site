/** 関係線の strokeDasharray を線種から求める */
export function strokeDasharrayFor(
  style: "solid" | "dashed" | "dotted",
): string | undefined {
  switch (style) {
    case "dashed":
      return "8 5";
    case "dotted":
      return "2 4";
    default:
      return undefined;
  }
}

/** 矢印マーカー URL（active は選択中） */
export function relationMarkerUrls(
  arrowHead: "none" | "end" | "start" | "both",
  active: boolean,
): { start?: string; end?: string } {
  const suffix = active ? "-active" : "";
  const endId = `rel-arrow-end${suffix}`;
  const startId = `rel-arrow-start${suffix}`;
  switch (arrowHead) {
    case "end":
      return { end: `url(#${endId})` };
    case "start":
      return { start: `url(#${startId})` };
    case "both":
      return { start: `url(#${startId})`, end: `url(#${endId})` };
    default:
      return {};
  }
}
