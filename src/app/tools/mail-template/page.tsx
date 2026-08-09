"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import AppShell from "@/components/AppShell";
import PrivacyNotice from "@/components/PrivacyNotice";
import { fmt, useI18n } from "@/i18n";
import InstallAppButton from "./InstallAppButton";
import PreviewPane from "./PreviewPane";
import TagFilterBar from "./TagFilterBar";
import TagMasterModal from "./TagMasterModal";
import TemplateEditorModal, { type Draft } from "./TemplateEditorModal";
import TemplateList from "./TemplateList";
import TemplateSearchBar from "./TemplateSearchBar";
import VariableForm from "./VariableForm";
import VariableMasterModal from "./VariableMasterModal";
import {
  loadInputHistory,
  saveInputHistory,
  type InputHistoryMap,
} from "./inputHistory";
import {
  loadAppData,
  parseImportedAppData,
  parseImportedInputHistory,
  saveAppData,
} from "./storage";
import {
  applyVariables,
  buildFinalText,
  findEmptyVariableLabels,
  filterTemplates,
  resolveEnabledVariables,
} from "./templateUtils";
import {
  createId,
  type MailTemplate,
  type TagMasterItem,
  type VariableMasterItem,
} from "./types";

export default function MailTemplatePage() {
  const { t, ready, locale } = useI18n();
  const mt = t.apps.mailTemplate;
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [variables, setVariables] = useState<VariableMasterItem[]>([]);
  const [tags, setTags] = useState<TagMasterItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [inputHistory, setInputHistory] = useState<InputHistoryMap>({});
  const [hydrated, setHydrated] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [masterOpen, setMasterOpen] = useState(false);
  const [tagMasterOpen, setTagMasterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTagId, setFilterTagId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    // 初期サンプルのままなら、サイト言語の defaults（テンプレ／変数／タグ）に差し替える
    const data = loadAppData(mt.defaults, locale);
    const sorted = filterTemplates(data.templates, "", null);
    setTemplates(data.templates);
    setVariables(data.variables);
    setTags(data.tags);
    setInputHistory(loadInputHistory());
    setSelectedId(sorted[0]?.id ?? null);
    setValues({});
    setFilterTagId(null);
    setSearchQuery("");
    setHydrated(true);
  }, [ready, mt.defaults, locale]);

  const persistAll = useCallback(
    (
      nextTemplates: MailTemplate[],
      nextVariables: VariableMasterItem[],
      nextTags: TagMasterItem[],
    ) => {
      setTemplates(nextTemplates);
      setVariables(nextVariables);
      setTags(nextTags);
      // ユーザー編集済みとして記録（以降は言語切替で上書きしない）
      saveAppData({
        templates: nextTemplates,
        variables: nextVariables,
        tags: nextTags,
        seedLocale: null,
      });
    },
    [],
  );

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId],
  );

  const filteredTemplates = useMemo(
    () => filterTemplates(templates, searchQuery, filterTagId),
    [templates, searchQuery, filterTagId],
  );

  const isFilterActive =
    searchQuery.trim().length > 0 || filterTagId !== null;

  const enabledVariables = useMemo(() => {
    if (!selected) return [];
    return resolveEnabledVariables(variables, selected.enabledVariableIds);
  }, [selected, variables]);

  useEffect(() => {
    if (!selectedId) {
      setValues({});
      return;
    }
    const tpl = templates.find((t) => t.id === selectedId);
    if (!tpl) {
      setValues({});
      return;
    }
    const enabled = resolveEnabledVariables(variables, tpl.enabledVariableIds);
    setValues((prev) => {
      const next: Record<string, string> = {};
      for (const v of enabled) {
        next[v.key] = prev[v.key] ?? "";
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    setValues((prev) => {
      const next: Record<string, string> = {};
      let changed = false;
      for (const v of enabledVariables) {
        if (v.key in prev) {
          next[v.key] = prev[v.key];
        } else {
          next[v.key] = "";
          changed = true;
        }
      }
      if (
        !changed &&
        Object.keys(prev).length === Object.keys(next).length
      ) {
        return prev;
      }
      if (Object.keys(prev).some((k) => !(k in next))) changed = true;
      return changed || Object.keys(prev).length !== Object.keys(next).length
        ? next
        : prev;
    });
  }, [enabledVariables]);

  const previewSubject = selected
    ? applyVariables(selected.subject, values)
    : "";
  const previewBody = selected ? applyVariables(selected.body, values) : "";
  const finalText = selected
    ? buildFinalText(selected.subject, selected.body, values, mt.combinedText)
    : "";
  const emptyLabels = findEmptyVariableLabels(enabledVariables, values);

  const editorInitial: Draft | null = useMemo(() => {
    if (editorMode === "edit" && editingId) {
      const t = templates.find((x) => x.id === editingId);
      if (!t) return null;
      return {
        title: t.title,
        subject: t.subject,
        body: t.body,
        enabledVariableIds: t.enabledVariableIds,
        tagIds: t.tagIds ?? [],
      };
    }
    return null;
  }, [editorMode, editingId, templates]);

  function openCreate() {
    setEditorMode("create");
    setEditingId(null);
    setEditorOpen(true);
  }

  function openEdit(id: string) {
    setEditorMode("edit");
    setEditingId(id);
    setEditorOpen(true);
  }

  function handleSave(draft: Draft) {
    const now = Date.now();
    if (editorMode === "create") {
      const created: MailTemplate = {
        id: createId("tpl"),
        title: draft.title,
        subject: draft.subject,
        body: draft.body,
        enabledVariableIds: draft.enabledVariableIds,
        tagIds: draft.tagIds,
        pinned: false,
        createdAt: now,
        updatedAt: now,
      };
      persistAll([created, ...templates], variables, tags);
      setSelectedId(created.id);
    } else if (editingId) {
      const next = templates.map((t) =>
        t.id === editingId
          ? {
              ...t,
              title: draft.title,
              subject: draft.subject,
              body: draft.body,
              enabledVariableIds: draft.enabledVariableIds,
              tagIds: draft.tagIds,
              updatedAt: now,
            }
          : t,
      );
      persistAll(next, variables, tags);
      setSelectedId(editingId);
    }
    setEditorOpen(false);
  }

  function handleDelete(id: string) {
    const target = templates.find((t) => t.id === id);
    if (!target) return;
    if (!window.confirm(fmt(mt.confirm.deleteTemplate, { title: target.title })))
      return;
    const next = templates.filter((t) => t.id !== id);
    persistAll(next, variables, tags);
    if (selectedId === id) {
      setSelectedId(next[0]?.id ?? null);
    }
  }

  function handleTogglePin(id: string) {
    const next = templates.map((t) =>
      t.id === id ? { ...t, pinned: !t.pinned, updatedAt: Date.now() } : t,
    );
    persistAll(next, variables, tags);
  }

  function handleMasterChange(nextVariables: VariableMasterItem[]) {
    const ids = new Set(nextVariables.map((v) => v.id));
    const nextTemplates = templates.map((t) => {
      let { subject, body } = t;
      for (const old of variables) {
        const updated = nextVariables.find((v) => v.id === old.id);
        if (updated && updated.key !== old.key) {
          const re = new RegExp(`\\{\\{\\s*${old.key}\\s*\\}\\}`, "g");
          const replacement = `{{${updated.key}}}`;
          subject = subject.replace(re, replacement);
          body = body.replace(re, replacement);
        }
      }
      return {
        ...t,
        subject,
        body,
        enabledVariableIds: t.enabledVariableIds.filter((id) => ids.has(id)),
      };
    });
    persistAll(nextTemplates, nextVariables, tags);
  }

  function handleTagMasterChange(nextTags: TagMasterItem[]) {
    const ids = new Set(nextTags.map((t) => t.id));
    const nextTemplates = templates.map((t) => ({
      ...t,
      tagIds: (t.tagIds ?? []).filter((id) => ids.has(id)),
    }));
    if (filterTagId && !ids.has(filterTagId)) {
      setFilterTagId(null);
    }
    persistAll(nextTemplates, variables, nextTags);
  }

  return (
    <AppShell
      title={mt.shell.title}
      description={mt.shell.description}
      fillViewport
      isPwa
      afterDataManager={<InstallAppButton copy={mt.install} />}
      dataManager={{
        appId: "mail-template",
        fileNamePrefix: "mail-template",
        getData: () => ({
          app: { templates, variables, tags },
          inputHistory,
        }),
        onImport: (raw) => {
          const nextApp = parseImportedAppData(raw, mt.defaults);
          if (!nextApp) return false;
          const nextHistory = parseImportedInputHistory(raw);
          saveAppData(nextApp);
          saveInputHistory(nextHistory);
          setTemplates(nextApp.templates);
          setVariables(nextApp.variables);
          setTags(nextApp.tags);
          setInputHistory(nextHistory);
          const sorted = filterTemplates(nextApp.templates, "", null);
          setSelectedId(sorted[0]?.id ?? null);
          setSearchQuery("");
          setFilterTagId(null);
          setValues({});
        },
      }}
      actions={
        <div className="flex w-full max-w-full flex-nowrap items-center gap-1 sm:gap-2 md:w-auto md:justify-end">
          <button
            type="button"
            onClick={() => setTagMasterOpen(true)}
            className="btn-secondary min-w-0 flex-1 !px-2 !py-1.5 text-[11px] leading-tight active:scale-[0.98] active:bg-zinc-100 sm:flex-none sm:!px-3 sm:!py-1.5 sm:text-sm"
          >
            <span className="sm:hidden">{mt.actions.tagMasterShort}</span>
            <span className="hidden sm:inline">{mt.actions.tagMaster}</span>
          </button>
          <button
            type="button"
            onClick={() => setMasterOpen(true)}
            className="btn-secondary min-w-0 flex-1 !px-2 !py-1.5 text-[11px] leading-tight active:scale-[0.98] active:bg-zinc-100 sm:flex-none sm:!px-3 sm:!py-1.5 sm:text-sm"
          >
            <span className="sm:hidden">{mt.actions.variableMasterShort}</span>
            <span className="hidden sm:inline">{mt.actions.variableMaster}</span>
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="btn-primary min-w-0 flex-1 !px-2 !py-1.5 text-[11px] leading-tight active:scale-[0.98] active:brightness-95 sm:flex-none sm:!px-3 sm:!py-1.5 sm:text-sm"
          >
            <span className="sm:hidden">{mt.actions.newTemplateShort}</span>
            <span className="hidden sm:inline">{mt.actions.newTemplate}</span>
          </button>
        </div>
      }
    >
      <PrivacyNotice className="mb-2" />
      {!hydrated ? (
        <p className="text-sm text-zinc-400">{mt.loading}</p>
      ) : (
        <div className="grid min-h-0 w-full max-w-full flex-1 grid-cols-1 gap-2 overflow-x-hidden overflow-y-auto md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-3 md:overflow-hidden lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <aside className="flex max-h-[min(42dvh,20rem)] min-h-0 min-w-0 flex-col overflow-hidden rounded-md border border-zinc-200/80 bg-white p-2 shadow-sm md:max-h-none md:p-3">
            <div className="mb-2 shrink-0 space-y-2 px-0.5 md:px-1">
              <p className="text-[11px] font-medium text-zinc-500">
                {mt.list.heading}
                <span className="ml-1 tabular-nums text-zinc-400">
                  {isFilterActive
                    ? `${filteredTemplates.length} / ${templates.length}`
                    : templates.length}
                </span>
              </p>
              <TemplateSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <TagFilterBar
                tags={tags}
                selectedTagId={filterTagId}
                onChange={setFilterTagId}
              />
            </div>
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
              <TemplateList
                templates={filteredTemplates}
                tags={tags}
                selectedId={selectedId}
                isFilterActive={isFilterActive}
                onSelect={setSelectedId}
                onEdit={openEdit}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            </div>
          </aside>

          <section className="flex min-h-[min(50dvh,24rem)] min-w-0 flex-col gap-2 overflow-hidden rounded-md border border-zinc-200/80 bg-white p-2 shadow-sm md:min-h-0 md:gap-3 md:p-4 lg:p-6">
            {selected ? (
              <>
                <div className="min-w-0 shrink-0">
                  <h2 className="break-words text-sm font-semibold text-zinc-900 md:truncate">
                    {selected.title}
                  </h2>
                </div>
                <div className="max-h-[min(38%,14rem)] shrink-0 overflow-x-hidden overflow-y-auto border-b border-zinc-100 pb-2 md:max-h-[42%] md:pb-3">
                  <VariableForm
                    variables={enabledVariables}
                    values={values}
                    history={inputHistory}
                    onChange={(key, value) =>
                      setValues((prev) => ({ ...prev, [key]: value }))
                    }
                    onHistoryChange={setInputHistory}
                  />
                </div>
                <PreviewPane
                  subject={previewSubject}
                  body={previewBody}
                  combinedText={finalText}
                  emptyLabels={emptyLabels}
                />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center px-2">
                <p className="break-words text-center text-sm text-zinc-400">
                  {mt.list.selectPrompt}
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      <TemplateEditorModal
        open={editorOpen}
        mode={editorMode}
        initial={editorInitial}
        masterVariables={variables}
        tags={tags}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />

      <VariableMasterModal
        open={masterOpen}
        variables={variables}
        onClose={() => setMasterOpen(false)}
        onChange={handleMasterChange}
      />

      <TagMasterModal
        open={tagMasterOpen}
        tags={tags}
        onClose={() => setTagMasterOpen(false)}
        onChange={handleTagMasterChange}
      />
    </AppShell>
  );
}
