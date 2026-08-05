/**
 * tmp-apps-<locale>.json → src/i18n/locales/apps/<locale>.ts
 * Usage: node scripts/apps-json-to-ts.mjs zh-CN appsZhCN
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const locale = process.argv[2];
const exportName = process.argv[3];
if (!locale || !exportName) {
  console.error("Usage: node scripts/apps-json-to-ts.mjs <locale> <exportName>");
  process.exit(1);
}

const root = process.cwd();
const jsonPath = join(root, `tmp-apps-${locale}.json`);
const outPath = join(root, "src/i18n/locales/apps", `${locale}.ts`);

function toTs(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value
      .map((v) => `${padIn}${toTs(v, indent + 1)},`)
      .join("\n")}\n${pad}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return `{\n${entries
      .map(([k, v]) => {
        const key = /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
        return `${padIn}${key}: ${toTs(v, indent + 1)},`;
      })
      .join("\n")}\n${pad}}`;
  }
  throw new Error(`Unsupported value: ${typeof value}`);
}

const data = JSON.parse(readFileSync(jsonPath, "utf8"));
mkdirSync(dirname(outPath), { recursive: true });
const body = `import type { AppsDictionary } from "../../apps";

/** アプリ内 UI 辞書（${locale}） */
export const ${exportName}: AppsDictionary = ${toTs(data)};
`;
writeFileSync(outPath, body, "utf8");
console.log(`Wrote ${outPath}`);
