/**
 * pdfjs-dist のワーカーを public へコピーする。
 * CDN 依存を避け、オフライン／通信制限環境でも PDF 読込できるようにする。
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pdfjsPkg = require("pdfjs-dist/package.json");
const src = join(
  root,
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs",
);
const destDir = join(root, "public", "tools", "pdf-editor");
const dest = join(destDir, "pdf.worker.min.mjs");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(
  `[copy-pdfjs-worker] pdfjs-dist@${pdfjsPkg.version} → public/tools/pdf-editor/pdf.worker.min.mjs`,
);
