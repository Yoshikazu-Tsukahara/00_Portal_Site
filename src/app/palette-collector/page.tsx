"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { fmt, useI18n } from "@/i18n";
import { useLocalStorageState } from "@/lib/localData";
import AutoExtractPanel from "./AutoExtractPanel";
import {
  normalizeHex,
  type ColorFormat,
  type ImageRegion,
} from "./colorMath";
import { writeClipboardText } from "./clipboard";
import ContrastChecker from "./ContrastChecker";
import { buildCssVariables, buildJsonExport } from "./exportFormat";
import { compressImageForStorage, loadImageFromSrc } from "./imageLoad";
import ImageStage from "./ImageStage";
import InstallAppButton from "./InstallAppButton";
import PaletteBoard from "./PaletteBoard";
import SavedProjectsPanel from "./SavedProjectsPanel";
import {
  createId,
  emptyData,
  emptyProjects,
  normalizePaletteData,
  normalizeProjects,
  PROJECTS_STORAGE_KEY,
  STORAGE_KEY,
  type PaletteColorEntry,
  type PaletteCollectorData,
  type ColorPickSource,
  type SavedProject,
} from "./types";

export default function PaletteCollectorPage() {
  const { t, locale } = useI18n();
  const copy = t.apps.paletteCollector;
  const [data, setData, { hydrated }] =
    useLocalStorageState<PaletteCollectorData>(STORAGE_KEY, emptyData());
  const [projects, setProjects, { hydrated: projectsHydrated }] =
    useLocalStorageState<SavedProject[]>(PROJECTS_STORAGE_KEY, emptyProjects());
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [regionSelectMode, setRegionSelectMode] = useState(false);
  const [confirmedRegion, setConfirmedRegion] = useState<ImageRegion | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const [contrastTextHex, setContrastTextHex] = useState("#000000");
  const [contrastBgId, setContrastBgId] = useState<string | null>(null);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(
    null,
  );
  const [savingProject, setSavingProject] = useState(false);

  // 起動時に不正な保存データを安全な形へ正規化
  useEffect(() => {
    if (!hydrated) return;
    const normalized = normalizePaletteData(data);
    const same = JSON.stringify(normalized) === JSON.stringify(data);
    if (!same) setData(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (!projectsHydrated) return;
    const normalized = normalizeProjects(projects);
    const same = JSON.stringify(normalized) === JSON.stringify(projects);
    if (!same) setProjects(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsHydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  /** パレットに色があるときだけ、画像差し替えの確認を出す */
  const handleBeforeImageReplace = useCallback(() => {
    if (data.colors.length === 0) return true;
    return window.confirm(copy.projects.replaceConfirm);
  }, [copy.projects.replaceConfirm, data.colors.length]);

  /** 新しい画像を採用し、紐づくパレット／領域状態をリセット */
  function handleImageLoaded(img: HTMLImageElement) {
    setImage(img);
    setRegionSelectMode(false);
    setConfirmedRegion(null);
    setSelectedPaletteId(null);
    setContrastBgId(null);
    setData((prev) => ({ ...prev, colors: [] }));
  }

  function addColor(hex: string, source?: ColorPickSource) {
    const normalized = normalizeHex(hex) ?? hex;
    const entry: PaletteColorEntry = {
      id: createId(),
      hex: normalized,
      createdAt: new Date().toISOString(),
      ...(source ? { source } : {}),
    };
    setData((prev) => ({ ...prev, colors: [...prev.colors, entry] }));
    setSelectedPaletteId(entry.id);
    setToast(fmt(copy.toast.added, { hex: normalized.toUpperCase() }));
  }

  function addManyColors(hexes: string[]) {
    const existing = new Set(data.colors.map((c) => c.hex));
    const additions: PaletteColorEntry[] = [];
    for (const raw of hexes) {
      const normalized = normalizeHex(raw) ?? raw;
      if (existing.has(normalized)) continue;
      existing.add(normalized);
      additions.push({
        id: createId(),
        hex: normalized,
        createdAt: new Date().toISOString(),
      });
    }
    if (additions.length === 0) return;
    setData((prev) => ({ ...prev, colors: [...prev.colors, ...additions] }));
    setToast(fmt(copy.toast.autoAdded, { count: additions.length }));
  }

  function handleDelete(id: string) {
    setSelectedPaletteId((prev) => (prev === id ? null : prev));
    setData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c.id !== id),
    }));
  }

  function handleClearAll() {
    if (data.colors.length === 0) return;
    if (!window.confirm(copy.palette.clearConfirm)) return;
    setData((prev) => ({ ...prev, colors: [] }));
    setSelectedPaletteId(null);
    setToast(copy.toast.cleared);
  }

  function handleChangeFormat(format: ColorFormat) {
    setData((prev) => ({ ...prev, format }));
  }

  async function handleCopy(text: string) {
    const ok = await writeClipboardText(text);
    if (ok) setToast(fmt(copy.toast.copied, { value: text }));
  }

  async function handleExportCss() {
    if (data.colors.length === 0) return;
    const ok = await writeClipboardText(buildCssVariables(data.colors));
    if (ok) setToast(copy.toast.cssCopied);
  }

  async function handleExportJson() {
    if (data.colors.length === 0) return;
    const ok = await writeClipboardText(buildJsonExport(data.colors));
    if (ok) setToast(copy.toast.jsonCopied);
  }

  async function handleSaveProject(name: string) {
    if (!image) return;
    setSavingProject(true);
    try {
      const imageDataUrl = compressImageForStorage(image);
      const now = new Date().toISOString();
      const project: SavedProject = {
        id: createId("p"),
        name,
        createdAt: now,
        updatedAt: now,
        imageDataUrl,
        colors: data.colors,
        format: data.format,
      };
      const next = [project, ...projects];
      // 容量不足を先に検知（フック側は失敗を握りつぶすため）
      window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(next));
      setProjects(next);
      setToast(fmt(copy.toast.projectSaved, { name }));
    } catch {
      setToast(copy.toast.projectSaveFailed);
    } finally {
      setSavingProject(false);
    }
  }

  async function handleLoadProject(project: SavedProject) {
    if (data.colors.length > 0) {
      const ok = window.confirm(copy.projects.replaceConfirm);
      if (!ok) return;
    }
    try {
      const img = await loadImageFromSrc(project.imageDataUrl);
      setImage(img);
      setRegionSelectMode(false);
      setConfirmedRegion(null);
      setSelectedPaletteId(null);
      setContrastBgId(null);
      setData({
        colors: project.colors,
        format: project.format,
      });
      setToast(fmt(copy.toast.projectLoaded, { name: project.name }));
    } catch {
      setToast(copy.toast.projectLoadFailed);
    }
  }

  function handleDeleteProject(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setToast(copy.toast.projectDeleted);
  }

  const selectedPaletteEntry =
    selectedPaletteId != null
      ? (data.colors.find((c) => c.id === selectedPaletteId) ?? null)
      : null;

  const colorHighlight =
    image && selectedPaletteEntry
      ? {
          hex: selectedPaletteEntry.hex,
          source: selectedPaletteEntry.source,
        }
      : null;

  const ready = hydrated && projectsHydrated;

  return (
    <>
      <AppShell
        title={copy.shell.title}
        description={copy.shell.description}
        isPwa
        afterDataManager={<InstallAppButton copy={copy.install} />}
        dataManager={{
          appId: "palette-collector",
          fileNamePrefix: "palette-collector",
          getData: () => ({ palette: data, projects }),
          onImport: (raw) => {
            const source = raw as {
              palette?: unknown;
              projects?: unknown;
            } | null;
            if (!source || typeof source !== "object") return false;
            setData(normalizePaletteData(source.palette));
            setProjects(normalizeProjects(source.projects));
            setImage(null);
            setSelectedPaletteId(null);
            setContrastBgId(null);
            return true;
          },
        }}
      >
        <p className="mb-4 rounded-md border border-zinc-200/80 bg-zinc-100/70 px-3.5 py-2.5 text-xs leading-relaxed text-zinc-600">
          {copy.privacyBanner}
        </p>

        {!ready ? (
          <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-400">
            {t.common.loading}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-4">
              <ImageStage
                image={image}
                onImageLoaded={handleImageLoaded}
                onBeforeImageReplace={handleBeforeImageReplace}
                onPickColor={addColor}
                colorHighlight={colorHighlight}
                regionSelectMode={regionSelectMode}
                onRegionConfirmed={(region) => {
                  setConfirmedRegion(region);
                  setRegionSelectMode(false);
                }}
                copy={copy.stage}
              />
              <SavedProjectsPanel
                projects={projects}
                canSave={Boolean(image)}
                saving={savingProject}
                locale={locale === "ja" ? "ja-JP" : "en-US"}
                copy={copy.projects}
                onSave={handleSaveProject}
                onLoad={handleLoadProject}
                onDelete={handleDeleteProject}
              />
            </div>

            <div className="flex flex-col gap-4">
              <AutoExtractPanel
                image={image}
                regionSelectMode={regionSelectMode}
                onStartRegionSelect={() => setRegionSelectMode(true)}
                onCancelRegionSelect={() => {
                  setRegionSelectMode(false);
                  setConfirmedRegion(null);
                }}
                confirmedRegion={confirmedRegion}
                onConfirmedRegionConsumed={() => setConfirmedRegion(null)}
                copy={copy.autoExtract}
                onAddAll={addManyColors}
              />
              <PaletteBoard
                colors={data.colors}
                format={data.format}
                selectedId={selectedPaletteId}
                onSelectId={setSelectedPaletteId}
                copy={copy.palette}
                onChangeFormat={handleChangeFormat}
                onCopy={handleCopy}
                onDelete={handleDelete}
                onClearAll={handleClearAll}
                onAddColor={addColor}
                onExportCss={handleExportCss}
                onExportJson={handleExportJson}
              />
              <ContrastChecker
                colors={data.colors}
                textHex={contrastTextHex}
                bgId={contrastBgId}
                onChangeTextHex={setContrastTextHex}
                onChangeBg={setContrastBgId}
                copy={copy.contrast}
              />
            </div>
          </div>
        )}
      </AppShell>

      {toast ? (
        <div
          role="status"
          className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
