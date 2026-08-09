"use client";

import { useCallback, useEffect, useState } from "react";

import AppShell from "@/components/AppShell";
import { useI18n } from "@/i18n";
import { useLayout } from "@/lib/layout";
import {
  LoadInvoiceDialog,
  SaveInvoiceDialog,
} from "./HistoryDialogs";
import InstallAppButton from "./InstallAppButton";
import InvoiceForm from "./InvoiceForm";
import InvoiceSheet from "./InvoiceSheet";
import PreviewModal from "./PreviewModal";
import PrintLayer from "./PrintLayer";
import { suggestPdfFileName } from "./calc";
import { getDocLabels, getInvoiceSheetLabels } from "./docLabels";
import { createSampleInvoice } from "./sample";
import {
  addSavedInvoice,
  loadInvoiceStore,
  parseImportedData,
  removeSavedInvoice,
  saveInvoiceStore,
} from "./storage";
import {
  createDefaultInvoice,
  createEmptyItem,
  defaultDocLocaleFor,
  docLocaleLabel,
  MAX_INVOICE_ITEMS,
  suggestSaveName,
  type InvoiceData,
  type InvoiceItem,
  type InvoiceParty,
  type SavedInvoice,
} from "./types";

export default function InvoiceMakerPage() {
  const { t, locale, ready } = useI18n();
  const { layoutMode } = useLayout();
  const copy = t.apps.invoiceMaker;
  const [data, setData] = useState<InvoiceData | null>(null);
  const [history, setHistory] = useState<SavedInvoice[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  /** 新規帳票時にフォームを載せ替え、入力表示の取りこぼしを防ぐ */
  const [formEpoch, setFormEpoch] = useState(0);
  /** 実機スマホ、または表示幅「縦型」では短いボタンラベル */
  const [narrowViewport, setNarrowViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrowViewport(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const compactChrome = narrowViewport || layoutMode === "portrait";

  // 初回のみ: 空ストアならサイト言語から書類言語・通貨の初期値を推測。
  // 以降ヘッダーでサイト言語を変えても、書類言語（docLocale）は自動では変えない。
  useEffect(() => {
    if (!ready || data !== null) return;
    const store = loadInvoiceStore(locale);
    setData(store.draft);
    setHistory(store.history);
  }, [ready, locale, data]);

  // 入力のたびに下書き＋履歴を LocalStorage へオートセーブ
  useEffect(() => {
    if (!data) return;
    saveInvoiceStore({ draft: data, history });
  }, [data, history]);

  const patch = useCallback((next: Partial<InvoiceData>) => {
    setData((prev) => (prev ? { ...prev, ...next } : prev));
  }, []);

  const patchParty = useCallback(
    (which: "from" | "to", next: Partial<InvoiceParty>) => {
      setData((prev) =>
        prev ? { ...prev, [which]: { ...prev[which], ...next } } : prev,
      );
    },
    [],
  );

  const addItem = useCallback(() => {
    const uiLabels = getDocLabels(defaultDocLocaleFor(locale));
    setData((prev) => {
      if (!prev) return prev;
      if (prev.items.length >= MAX_INVOICE_ITEMS) {
        window.alert(uiLabels.form.items.maxItemsAlert);
        return prev;
      }
      return { ...prev, items: [...prev.items, createEmptyItem()] };
    });
  }, [locale]);

  const patchItem = useCallback((id: string, next: Partial<InvoiceItem>) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((item) =>
              item.id === id ? { ...item, ...next } : item,
            ),
          }
        : prev,
    );
  }, []);

  const removeItem = useCallback(
    (id: string) => {
      const uiLabels = getDocLabels(defaultDocLocaleFor(locale));
      setData((prev) => {
        if (!prev) return prev;
        if (prev.items.length <= 1) {
          window.alert(uiLabels.form.items.removeLastAlert);
          return prev;
        }
        return { ...prev, items: prev.items.filter((item) => item.id !== id) };
      });
    },
    [locale],
  );

  const startNextInvoice = useCallback(() => {
    if (!window.confirm(copy.actions.newInvoiceConfirm)) return;
    // 記入欄はすべて空に戻し、書類言語・通貨・税率だけ表示言語から設定
    setData(createDefaultInvoice(locale));
    setFormEpoch((n) => n + 1);
  }, [copy.actions.newInvoiceConfirm, locale]);

  const handleSave = useCallback(
    (name: string) => {
      if (!data) return;
      setHistory((prev) => addSavedInvoice(prev, name, data));
      setSaveOpen(false);
      setSavedToast(true);
      window.setTimeout(() => setSavedToast(false), 1800);
    },
    [data],
  );

  const handleLoad = useCallback(
    (id: string) => {
      const entry = history.find((item) => item.id === id);
      if (!entry) return;
      // 呼び出し時もディープコピーして、履歴側を汚さない
      setData(structuredClone(entry.data));
      setFormEpoch((n) => n + 1);
      setLoadOpen(false);
    },
    [history],
  );

  const handleLoadSample = useCallback(() => {
    // デモ本文はサイトの表示言語に合わせる（書類言語もそれに揃える）
    setData(createSampleInvoice(locale));
    setFormEpoch((n) => n + 1);
    setLoadOpen(false);
  }, [locale]);

  const handleDelete = useCallback((id: string) => {
    setHistory((prev) => removeSavedInvoice(prev, id));
  }, []);

  const handlePrint = useCallback(() => {
    if (!data) {
      window.print();
      return;
    }
    // ブラウザの「PDFに保存」は document.title を初期ファイル名に使う
    const previousTitle = document.title;
    const labels = getInvoiceSheetLabels(data.docLocale);
    const title =
      labels.titles[data.documentType] || labels.titles.invoice;
    document.title = suggestPdfFileName(data, title);

    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      document.title = previousTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
    // afterprint 未対応環境向け（ダイアログ操作中に戻さないよう長めに）
    window.setTimeout(restore, 60_000);
  }, [data]);

  if (!data) {
    return (
      <AppShell
        title={copy.shell.title}
        description={copy.loading}
        isPwa
        afterDataManager={<InstallAppButton copy={copy.install} />}
      >
        <p className="text-sm text-zinc-400">{copy.loading}</p>
      </AppShell>
    );
  }

  const labels = getInvoiceSheetLabels(data.docLocale);
  const sheet = <InvoiceSheet data={data} labels={labels} />;

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      isPwa
      afterDataManager={<InstallAppButton copy={copy.install} />}
      actions={
        <div
          className={
            compactChrome
              ? "grid w-full max-w-full grid-cols-3 gap-1.5"
              : "flex w-full max-w-full flex-nowrap items-center justify-end gap-2"
          }
        >
          <button
            type="button"
            onClick={() => setSaveOpen(true)}
            title={copy.toolbar.save}
            aria-label={copy.toolbar.save}
            className="btn-secondary min-w-0 !px-2 !py-1.5 text-center text-[11px] leading-tight active:scale-[0.98] active:bg-zinc-100 md:!px-3 md:text-sm"
          >
            {compactChrome ? copy.toolbar.saveShort : copy.toolbar.save}
          </button>
          <button
            type="button"
            onClick={() => setLoadOpen(true)}
            title={copy.toolbar.load}
            aria-label={copy.toolbar.load}
            className="btn-secondary min-w-0 !px-2 !py-1.5 text-center text-[11px] leading-tight active:scale-[0.98] active:bg-zinc-100 md:!px-3 md:text-sm"
          >
            {compactChrome ? copy.toolbar.loadShort : copy.toolbar.load}
          </button>
          <button
            type="button"
            onClick={startNextInvoice}
            title={copy.actions.newInvoice}
            aria-label={copy.actions.newInvoice}
            className="btn-secondary min-w-0 !px-2 !py-1.5 text-center text-[11px] leading-tight active:scale-[0.98] active:bg-zinc-100 md:!px-3 md:text-sm"
          >
            {compactChrome
              ? copy.actions.newInvoiceShort
              : copy.actions.newInvoice}
          </button>
        </div>
      }
      dataManager={{
        appId: "invoice-maker",
        fileNamePrefix: "invoice-maker",
        getData: () => ({ draft: data, history }),
        onImport: (raw) => {
          const next = parseImportedData(raw);
          if (!next) return false;
          setData(next.draft);
          setHistory(next.history);
        },
      }}
    >
      <div className="w-full min-w-0 max-w-full overflow-x-hidden">
        <InvoiceForm
          key={formEpoch}
          data={data}
          siteLocale={locale}
          copy={copy}
          onPatch={patch}
          onPatchParty={patchParty}
          onAddItem={addItem}
          onPatchItem={patchItem}
          onRemoveItem={removeItem}
          onPreview={() => setPreviewOpen(true)}
          onPrint={handlePrint}
        />

        {savedToast ? (
          <p
            className="mt-2 text-center text-[11px] font-medium text-emerald-600"
            role="status"
          >
            {copy.history.savedToast}
          </p>
        ) : null}

        <PreviewModal
          open={previewOpen}
          copy={copy.preview}
          docLanguageLabel={docLocaleLabel(data.docLocale)}
          onClose={() => setPreviewOpen(false)}
          onPrint={handlePrint}
        >
          {sheet}
        </PreviewModal>

        <SaveInvoiceDialog
          open={saveOpen}
          copy={copy.history}
          suggestedName={suggestSaveName(data)}
          onClose={() => setSaveOpen(false)}
          onSave={handleSave}
        />

        <LoadInvoiceDialog
          open={loadOpen}
          copy={copy.history}
          history={history}
          locale={locale}
          onClose={() => setLoadOpen(false)}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onLoadSample={handleLoadSample}
        />

        <PrintLayer>{sheet}</PrintLayer>
      </div>
    </AppShell>
  );
}
