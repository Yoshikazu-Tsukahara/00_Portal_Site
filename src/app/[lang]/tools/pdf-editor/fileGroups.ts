import { createId, duplicatePage, type PdfPageItem, type PdfSource } from "./types";

/** ファイル単位表示用のグループ（1アップロードPDF = 1グループ） */
export type FileGroup = {
  sourceId: string;
  name: string;
  pageCount: number;
  pageIds: string[];
};

/**
 * pages 配列からファイルグループを導出。
 * 順序は「各 sourceId が pages 内で最初に現れた順」。
 */
export function deriveFileGroups(
  pages: PdfPageItem[],
  sources: Map<string, PdfSource>,
): FileGroup[] {
  const order: string[] = [];
  const buckets = new Map<string, string[]>();

  for (const page of pages) {
    if (!page.sourceId) continue;
    if (!buckets.has(page.sourceId)) {
      buckets.set(page.sourceId, []);
      order.push(page.sourceId);
    }
    buckets.get(page.sourceId)!.push(page.id);
  }

  return order.map((sourceId) => {
    const pageIds = buckets.get(sourceId) ?? [];
    const source = sources.get(sourceId);
    const nameFromPage =
      pages.find((p) => p.sourceId === sourceId)?.sourceName ?? "PDF";
    return {
      sourceId,
      name: source?.name ?? nameFromPage,
      pageCount: pageIds.length,
      pageIds,
    };
  });
}

/**
 * ファイル構成が保たれているか判定（O(n)）。
 * - 各ファイルのページが元順・欠落なし・他ページ混入なしで連続
 * - ファイル単位の前後入替・ファイル丸ごと複製は OK
 * - 白紙・個別削除・個別並替・個別複製は NG
 * - 回転のみは構成を壊さない
 */
export function isStructureIntact(
  pages: PdfPageItem[],
  sources: Map<string, PdfSource>,
): boolean {
  if (pages.length === 0) return true;

  for (const page of pages) {
    if (
      page.kind === "blank" ||
      !page.sourceId ||
      page.pageIndex === undefined
    ) {
      return false;
    }
  }

  type Run = { sourceId: string; pages: PdfPageItem[] };
  const runs: Run[] = [];

  for (const page of pages) {
    const sourceId = page.sourceId!;
    const last = runs[runs.length - 1];
    if (last && last.sourceId === sourceId) {
      last.pages.push(page);
    } else {
      runs.push({ sourceId, pages: [page] });
    }
  }

  const seen = new Set<string>();
  for (const run of runs) {
    if (seen.has(run.sourceId)) return false;
    seen.add(run.sourceId);

    const source = sources.get(run.sourceId);
    if (!source) return false;

    if (run.pages.length !== source.pageCount) return false;

    for (let i = 0; i < run.pages.length; i += 1) {
      if (run.pages[i].pageIndex !== i) return false;
    }
  }

  return true;
}

/**
 * ファイル順に合わせて pages を再構築。
 * 各ファイル内のページ相対順序は維持。sourceId なし（白紙等）は末尾に保持。
 */
export function reorderPagesByFileOrder(
  pages: PdfPageItem[],
  sourceOrder: string[],
): PdfPageItem[] {
  const bySource = new Map<string, PdfPageItem[]>();
  const orphans: PdfPageItem[] = [];

  for (const page of pages) {
    if (!page.sourceId) {
      orphans.push(page);
      continue;
    }
    const list = bySource.get(page.sourceId);
    if (list) {
      list.push(page);
    } else {
      bySource.set(page.sourceId, [page]);
    }
  }

  const next: PdfPageItem[] = [];
  for (const sourceId of sourceOrder) {
    const list = bySource.get(sourceId);
    if (list) next.push(...list);
  }

  for (const [sourceId, list] of bySource) {
    if (!sourceOrder.includes(sourceId)) {
      next.push(...list);
    }
  }

  next.push(...orphans);
  return next;
}

/** 指定ファイルに属するページをすべて除外 */
export function removeFilePages(
  pages: PdfPageItem[],
  sourceId: string,
): PdfPageItem[] {
  return pages.filter((p) => p.sourceId !== sourceId);
}

/** ファイル名を sources と各ページの sourceName に反映 */
export function renameFile(
  pages: PdfPageItem[],
  sources: Map<string, PdfSource>,
  sourceId: string,
  newName: string,
): { pages: PdfPageItem[]; sources: Map<string, PdfSource> } {
  const trimmed = newName.trim() || "untitled.pdf";
  const nextSources = new Map(sources);
  const source = nextSources.get(sourceId);
  if (source) {
    nextSources.set(sourceId, { ...source, name: trimmed });
  }

  const nextPages = pages.map((p) =>
    p.sourceId === sourceId ? { ...p, sourceName: trimmed } : p,
  );

  return { pages: nextPages, sources: nextSources };
}

/**
 * ファイルを丸ごと複製し、直後に挿入。
 * 新しい sourceId を付与するため、構成整合性は維持される。
 */
export function duplicateFile(
  pages: PdfPageItem[],
  sources: Map<string, PdfSource>,
  sourceId: string,
): { pages: PdfPageItem[]; sources: Map<string, PdfSource> } | null {
  const source = sources.get(sourceId);
  if (!source) return null;

  const filePages: PdfPageItem[] = [];
  let lastIndex = -1;
  for (let i = 0; i < pages.length; i += 1) {
    if (pages[i].sourceId === sourceId) {
      filePages.push(pages[i]);
      lastIndex = i;
    }
  }
  if (filePages.length === 0 || lastIndex < 0) return null;

  const newSourceId = createId("src");
  const newSource: PdfSource = {
    id: newSourceId,
    name: source.name,
    bytes: source.bytes.slice(),
    pageCount: source.pageCount,
  };

  const clones = filePages.map((page) => ({
    ...duplicatePage(page),
    sourceId: newSourceId,
    sourceName: source.name,
  }));

  const nextPages = [...pages];
  nextPages.splice(lastIndex + 1, 0, ...clones);

  const nextSources = new Map(sources);
  nextSources.set(newSourceId, newSource);

  return { pages: nextPages, sources: nextSources };
}
