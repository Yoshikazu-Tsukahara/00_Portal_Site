import { hexToRgb, rgbToHsl } from "./colorMath";
import type { PaletteColorEntry } from "./types";

/** CSS カスタムプロパティ形式でエクスポート */
export function buildCssVariables(colors: PaletteColorEntry[]): string {
  const lines = colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`);
  return [":root {", ...lines, "}"].join("\n");
}

/** JSON 形式（hex / rgb / hsl を併記）でエクスポート */
export function buildJsonExport(colors: PaletteColorEntry[]): string {
  const list = colors.map((c) => {
    const rgb = hexToRgb(c.hex);
    const hsl = rgb ? rgbToHsl(rgb) : null;
    return {
      hex: c.hex,
      rgb: rgb
        ? `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`
        : null,
      hsl: hsl
        ? `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`
        : null,
    };
  });
  return JSON.stringify(list, null, 2);
}
