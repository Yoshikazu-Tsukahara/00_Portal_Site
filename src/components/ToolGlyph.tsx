import { getToolIconSrc, type Tool } from "@/data/tools";

type Props = {
  tool: Pick<Tool, "id" | "icon">;
  /** img 用クラス（親の glyph 枠いっぱいに敷くときなど） */
  className?: string;
};

/**
 * ツールの見た目アイコン。
 * public/icons に画像があればそれを、なければ絵文字を出す。
 */
export default function ToolGlyph({ tool, className = "" }: Props) {
  const src = getToolIconSrc(tool.id);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- public 直参照のアプリアイコン
      <img
        src={src}
        alt=""
        draggable={false}
        className={`tool-glyph-img ${className}`.trim()}
      />
    );
  }
  return <>{tool.icon}</>;
}
