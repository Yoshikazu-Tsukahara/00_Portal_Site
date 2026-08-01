"use client";

import { useCallback, useEffect, useState } from "react";

import AppShell from "@/components/AppShell";
import PrivacyNotice from "@/components/PrivacyNotice";
import { useI18n } from "@/i18n";
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
  createEmptyItem,
  createNextInvoice,
  MAX_INVOICE_ITEMS,
  suggestSaveName,
  type InvoiceData,
  type InvoiceItem,
  type InvoiceParty,
  type SavedInvoice,
} from "./types";

export default function InvoiceMakerPage() {
  const { t, locale, ready } = useI18n();
  const copy = t.apps.invoiceMaker;
  const [data, setData] = useState<InvoiceData | null>(null);
  const [history, setHistory] = useState<SavedInvoice[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // サイト言語は「初回の既定値」を決めるためだけに使う（以降はユーザーの選択が優先）
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
    setData((prev) => {
      if (!prev) return prev;
      if (prev.items.length >= MAX_INVOICE_ITEMS) {
        window.alert(getDocLabels(prev.docLocale).form.items.maxItemsAlert);
        return prev;
      }
      return { ...prev, items: [...prev.items, createEmptyItem()] };
    });
  }, []);

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

  const removeItem = useCallback((id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      if (prev.items.length <= 1) {
        window.alert(getDocLabels(prev.docLocale).form.items.removeLastAlert);
        return prev;
      }
      return { ...prev, items: prev.items.filter((item) => item.id !== id) };
    });
  }, []);

  const startNextInvoice = useCallback(() => {
    if (!window.confirm(copy.actions.newInvoiceConfirm)) return;
    setData((prev) => (prev ? createNextInvoice(prev) : prev));
  }, [copy.actions.newInvoiceConfirm]);

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
      setLoadOpen(false);
    },
    [history],
  );

  const handleLoadSample = useCallback(() => {
    // デモだけはサイトの表示言語（Header の JA/EN）で内容を切り替える
    setData(createSampleInvoice(locale));
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
        <div className="flex flex-nowrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSaveOpen(true)}
            className="btn-secondary !px-2 !py-1.5 text-[11px] sm:!px-2.5 sm:text-xs"
          >
            <span className="sm:hidden">{copy.toolbar.saveShort}</span>
            <span className="hidden sm:inline">{copy.toolbar.save}</span>
          </button>
          <button
            type="button"
            onClick={() => setLoadOpen(true)}
            className="btn-secondary !px-2 !py-1.5 text-[11px] sm:!px-2.5 sm:text-xs"
          >
            <span className="sm:hidden">{copy.toolbar.loadShort}</span>
            <span className="hidden sm:inline">{copy.toolbar.load}</span>
          </button>
          <button
            type="button"
            onClick={startNextInvoice}
            className="btn-secondary !px-2 !py-1.5 text-[11px] sm:!px-2.5 sm:text-xs"
          >
            <span className="sm:hidden">{copy.actions.newInvoiceShort}</span>
            <span className="hidden sm:inline">{copy.actions.newInvoice}</span>
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
      <PrivacyNotice className="mb-3" />

      <InvoiceForm
        data={data}
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
    </AppShell>
  );
}
