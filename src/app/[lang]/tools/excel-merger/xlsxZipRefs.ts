import JSZip from "jszip";

import {
  extractSheetNamesFromFormula,
  uniqueSheetNames,
} from "./formulaUtils";
import type { SheetRefKind } from "./types";

const REL_NS =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

export type ZipDefinedName = {
  name: string;
  formula: string;
  /** workbook.xml の sheets 並び（0始まり）。ブック全体なら null */
  localSheetIndex: number | null;
};

export type ZipRefResult = {
  /** シート名（大文字小文字は Excel 側の表記）→ 参照先と種類 */
  bySheetName: Map<string, Record<string, SheetRefKind[]>>;
  /** workbook.xml に書かれたシート名の順 */
  sheetNames: string[];
  definedNames: ZipDefinedName[];
};

type Rel = {
  id: string;
  type: string;
  target: string;
  targetMode: string;
};

function normalizeZipPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\//, "");
}

function joinZipPath(fromFile: string, target: string): string {
  const t = normalizeZipPath(decodeURIComponent(target.trim()));
  if (!t || /^[a-z]+:/i.test(t)) return t;
  const parts = normalizeZipPath(fromFile).split("/");
  parts.pop();
  for (const part of t.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return parts.join("/");
}

function relsPathFor(filePath: string): string {
  const norm = normalizeZipPath(filePath);
  const i = norm.lastIndexOf("/");
  const dir = i >= 0 ? norm.slice(0, i) : "";
  const base = i >= 0 ? norm.slice(i + 1) : norm;
  const prefix = dir ? `${dir}/` : "";
  return `${prefix}_rels/${base}.rels`;
}

function zipFile(zip: JSZip, path: string): JSZip.JSZipObject | null {
  const norm = normalizeZipPath(path);
  const direct = zip.file(norm);
  if (direct && !direct.dir) return direct;
  const lower = norm.toLowerCase();
  const match = Object.values(zip.files).find(
    (file) => !file.dir && normalizeZipPath(file.name).toLowerCase() === lower,
  );
  return match ?? null;
}

async function readZipText(
  zip: JSZip,
  path: string,
): Promise<string | null> {
  const file = zipFile(zip, path);
  if (!file) return null;
  try {
    return await file.async("string");
  } catch {
    return null;
  }
}

function parseXml(xml: string): Document | null {
  try {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    if (doc.getElementsByTagName("parsererror").length > 0) return null;
    return doc;
  } catch {
    return null;
  }
}

function parseRels(xml: string): Rel[] {
  const doc = parseXml(xml);
  if (!doc) return [];
  const rels: Rel[] = [];
  for (const el of doc.getElementsByTagNameNS("*", "Relationship")) {
    rels.push({
      id: el.getAttribute("Id") || "",
      type: el.getAttribute("Type") || "",
      target: el.getAttribute("Target") || "",
      targetMode: el.getAttribute("TargetMode") || "",
    });
  }
  return rels;
}

function relLeaf(type: string): string {
  const t = type.replace(/\\/g, "/").toLowerCase();
  const i = t.lastIndexOf("/");
  return i >= 0 ? t.slice(i + 1) : t;
}

function relIs(type: string, leaf: string): boolean {
  return relLeaf(type) === leaf.toLowerCase();
}

function elementsByLocalName(
  root: ParentNode,
  localName: string,
): Element[] {
  const doc = "getElementsByTagNameNS" in root ? (root as Document | Element) : null;
  if (!doc || !("getElementsByTagNameNS" in doc)) return [];
  return [...doc.getElementsByTagNameNS("*", localName)];
}

function textsByLocalName(root: ParentNode, localName: string): string[] {
  return elementsByLocalName(root, localName)
    .map((el) => el.textContent?.trim() ?? "")
    .filter(Boolean);
}

function namesFromFormulas(texts: string[], ownSheet: string): string[] {
  const own = ownSheet.trim().toLowerCase();
  return uniqueSheetNames(texts.flatMap(extractSheetNamesFromFormula)).filter(
    (name) => name.toLowerCase() !== own,
  );
}

class KindBag {
  private displayFrom = new Map<string, string>();
  private displayTo = new Map<string, string>();
  private data = new Map<string, Map<string, Set<SheetRefKind>>>();

  add(fromSheet: string, targets: string[], kind: SheetRefKind) {
    const from = fromSheet.trim();
    if (!from) return;
    const fromKey = from.toLowerCase();
    if (!this.displayFrom.has(fromKey)) this.displayFrom.set(fromKey, from);

    let inner = this.data.get(fromKey);
    if (!inner) {
      inner = new Map();
      this.data.set(fromKey, inner);
    }

    for (const raw of targets) {
      const to = raw.trim();
      if (!to) continue;
      const toKey = to.toLowerCase();
      if (toKey === fromKey) continue;
      if (!this.displayTo.has(toKey)) this.displayTo.set(toKey, to);
      let kinds = inner.get(toKey);
      if (!kinds) {
        kinds = new Set();
        inner.set(toKey, kinds);
      }
      kinds.add(kind);
    }
  }

  toMap(): Map<string, Record<string, SheetRefKind[]>> {
    const out = new Map<string, Record<string, SheetRefKind[]>>();
    for (const [fromKey, inner] of this.data) {
      const fromName = this.displayFrom.get(fromKey);
      if (!fromName) continue;
      const rec: Record<string, SheetRefKind[]> = {};
      for (const [toKey, kinds] of inner) {
        const toName = this.displayTo.get(toKey);
        if (!toName) continue;
        rec[toName] = [...kinds];
      }
      out.set(fromName, rec);
    }
    return out;
  }
}

async function loadRels(zip: JSZip, filePath: string): Promise<Rel[]> {
  const xml = await readZipText(zip, relsPathFor(filePath));
  return xml ? parseRels(xml) : [];
}

async function followTargets(
  zip: JSZip,
  fromFile: string,
  rels: Rel[],
  leaves: string | string[],
): Promise<string[]> {
  const allowed = (Array.isArray(leaves) ? leaves : [leaves]).map((leaf) =>
    leaf.toLowerCase(),
  );
  const paths: string[] = [];
  for (const rel of rels) {
    if (!allowed.includes(relLeaf(rel.type)) || !rel.target) continue;
    if (rel.targetMode.toLowerCase() === "external") continue;
    paths.push(joinZipPath(fromFile, rel.target));
  }
  return paths;
}

async function collectChartTargets(
  zip: JSZip,
  drawingPath: string,
  ownSheet: string,
): Promise<string[]> {
  const names: string[] = [];
  const drawingRels = await loadRels(zip, drawingPath);
  const chartPaths = await followTargets(zip, drawingPath, drawingRels, [
    "chart",
    "chartex",
  ]);
  for (const chartPath of chartPaths) {
    const xml = await readZipText(zip, chartPath);
    if (!xml) continue;
    const doc = parseXml(xml);
    if (!doc) continue;
    names.push(...namesFromFormulas(textsByLocalName(doc, "f"), ownSheet));
  }
  return names;
}

async function collectPivotTargets(
  zip: JSZip,
  pivotPath: string,
  ownSheet: string,
): Promise<string[]> {
  const names: string[] = [];
  const pivotXml = await readZipText(zip, pivotPath);
  if (pivotXml) {
    const doc = parseXml(pivotXml);
    if (doc) {
      for (const el of elementsByLocalName(doc, "worksheetSource")) {
        const sheet = el.getAttribute("sheet") || el.getAttribute("name") || "";
        if (sheet && sheet.toLowerCase() !== ownSheet.toLowerCase()) {
          names.push(sheet);
        }
      }
    }
  }

  const cacheRels = await loadRels(zip, pivotPath);
  const cachePaths = await followTargets(
    zip,
    pivotPath,
    cacheRels,
    "pivotCacheDefinition",
  );
  for (const cachePath of cachePaths) {
    const xml = await readZipText(zip, cachePath);
    if (!xml) continue;
    const doc = parseXml(xml);
    if (!doc) continue;
    for (const el of elementsByLocalName(doc, "worksheetSource")) {
      const sheet = el.getAttribute("sheet") || el.getAttribute("name") || "";
      if (sheet && sheet.toLowerCase() !== ownSheet.toLowerCase()) {
        names.push(sheet);
      }
    }
    names.push(...namesFromFormulas(textsByLocalName(doc, "f"), ownSheet));
  }
  return uniqueSheetNames(names);
}

function scanWorksheetXml(
  doc: Document,
  ownSheet: string,
  bag: KindBag,
) {
  const validations = [
    ...elementsByLocalName(doc, "dataValidation"),
    ...elementsByLocalName(doc, "dataValidations"),
  ];
  const validationTexts = validations.flatMap((el) => [
    ...textsByLocalName(el, "formula1"),
    ...textsByLocalName(el, "formula2"),
  ]);
  bag.add(ownSheet, namesFromFormulas(validationTexts, ownSheet), "validation");

  const cfRoot = elementsByLocalName(doc, "conditionalFormatting");
  const cfTexts = cfRoot.flatMap((el) => textsByLocalName(el, "formula"));
  bag.add(ownSheet, namesFromFormulas(cfTexts, ownSheet), "cf");

  const sparkTexts = elementsByLocalName(doc, "sparklineGroup").flatMap((el) =>
    textsByLocalName(el, "f"),
  );
  bag.add(ownSheet, namesFromFormulas(sparkTexts, ownSheet), "formula");

  for (const el of elementsByLocalName(doc, "hyperlink")) {
    const location = el.getAttribute("location") || "";
    if (location) {
      bag.add(ownSheet, namesFromFormulas([location], ownSheet), "link");
    }
  }
}

async function inspectSheetPart(
  zip: JSZip,
  sheetPath: string,
  ownSheet: string,
  bag: KindBag,
) {
  const xml = await readZipText(zip, sheetPath);
  if (xml) {
    const doc = parseXml(xml);
    if (doc) scanWorksheetXml(doc, ownSheet, bag);
  }

  const rels = await loadRels(zip, sheetPath);
  const drawingPaths = await followTargets(zip, sheetPath, rels, "drawing");
  for (const drawingPath of drawingPaths) {
    const chartNames = await collectChartTargets(zip, drawingPath, ownSheet);
    bag.add(ownSheet, chartNames, "chart");
  }

  // チャートシート直下のグラフ
  const chartPaths = await followTargets(zip, sheetPath, rels, [
    "chart",
    "chartex",
  ]);
  for (const chartPath of chartPaths) {
    const xmlChart = await readZipText(zip, chartPath);
    if (!xmlChart) continue;
    const doc = parseXml(xmlChart);
    if (!doc) continue;
    bag.add(
      ownSheet,
      namesFromFormulas(textsByLocalName(doc, "f"), ownSheet),
      "chart",
    );
  }

  const pivotPaths = await followTargets(zip, sheetPath, rels, "pivotTable");
  for (const pivotPath of pivotPaths) {
    bag.add(
      ownSheet,
      await collectPivotTargets(zip, pivotPath, ownSheet),
      "pivot",
    );
  }

  for (const rel of rels) {
    if (!relIs(rel.type, "hyperlink")) continue;
    const target = rel.target || "";
    if (target.startsWith("#")) {
      bag.add(ownSheet, namesFromFormulas([target.slice(1)], ownSheet), "link");
    }
  }
}

function parseDefinedNames(
  workbookDoc: Document,
): ZipDefinedName[] {
  const out: ZipDefinedName[] = [];
  for (const el of elementsByLocalName(workbookDoc, "definedName")) {
    const name = el.getAttribute("name") || "";
    if (!name || name.startsWith("_xlnm.")) continue;
    const formula = el.textContent?.trim() ?? "";
    if (!formula) continue;
    const local = el.getAttribute("localSheetId");
    const localSheetIndex =
      local === null || local === "" ? null : Number(local);
    out.push({
      name,
      formula,
      localSheetIndex:
        localSheetIndex !== null && Number.isFinite(localSheetIndex)
          ? localSheetIndex
          : null,
    });
  }
  return out;
}

/**
 * .xlsx（ZIP）の XML を読み、グラフ・名前定義・入力規則などの他シート参照を拾う。
 * SheetJS が見ない部分の補完用。失敗しても呼び出し側で握りつぶしてよい。
 */
export async function inspectXlsxZipRefs(
  buffer: ArrayBuffer,
): Promise<ZipRefResult> {
  const zip = await JSZip.loadAsync(buffer);
  const bag = new KindBag();
  const empty: ZipRefResult = {
    bySheetName: new Map(),
    sheetNames: [],
    definedNames: [],
  };

  const rootRelsXml = await readZipText(zip, "_rels/.rels");
  const rootRels = rootRelsXml ? parseRels(rootRelsXml) : [];
  const office = rootRels.find((rel) => relIs(rel.type, "officeDocument"));
  const workbookPath = office?.target
    ? joinZipPath("_rels/.rels", office.target)
    : "xl/workbook.xml";

  const workbookXml = await readZipText(zip, workbookPath);
  if (!workbookXml) return empty;
  const workbookDoc = parseXml(workbookXml);
  if (!workbookDoc) return empty;

  const wbRels = await loadRels(zip, workbookPath);
  const relById = new Map(wbRels.map((rel) => [rel.id, rel]));

  const sheetNames: string[] = [];
  const sheetJobs: { name: string; path: string }[] = [];

  for (const el of elementsByLocalName(workbookDoc, "sheet")) {
    const name = el.getAttribute("name") || "";
    if (!name) continue;
    sheetNames.push(name);
    const rid =
      el.getAttributeNS(REL_NS, "id") || el.getAttribute("r:id") || "";
    const rel = relById.get(rid);
    if (!rel?.target) continue;
    sheetJobs.push({
      name,
      path: joinZipPath(workbookPath, rel.target),
    });
  }

  for (const job of sheetJobs) {
    await inspectSheetPart(zip, job.path, job.name, bag);
  }

  const definedNames = parseDefinedNames(workbookDoc);
  for (const def of definedNames) {
    if (def.localSheetIndex === null) continue;
    const owner = sheetNames[def.localSheetIndex];
    if (!owner) continue;
    bag.add(owner, namesFromFormulas([def.formula], owner), "name");
  }

  return {
    bySheetName: bag.toMap(),
    sheetNames,
    definedNames,
  };
}

export function zipRefsForSheet(
  result: ZipRefResult,
  sheetName: string,
): Record<string, SheetRefKind[]> {
  const exact = result.bySheetName.get(sheetName);
  if (exact) return exact;
  const key = sheetName.trim().toLowerCase();
  for (const [name, rec] of result.bySheetName) {
    if (name.toLowerCase() === key) return rec;
  }
  return {};
}
