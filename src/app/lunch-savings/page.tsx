"use client";

import { useEffect, useMemo, useState } from "react";

import AppShell from "@/components/AppShell";
import { useI18n } from "@/i18n";
import { useLocalStorageState } from "@/lib/localData";
import { calcPeriodStats, parseLunchData } from "./calc";
import Dashboard from "./Dashboard";
import InstallAppButton from "./InstallAppButton";
import NumpadModal from "./NumpadModal";
import SetupModal from "./SetupModal";
import {
  STORAGE_KEY,
  KNOWN_GOAL_DEFAULTS,
  createId,
  isInPeriod,
  normalizeSettings,
  todayIsoDate,
  type LunchAppData,
  type LunchEntry,
  type LunchMode,
  type LunchSettings,
} from "./types";

const EMPTY: LunchAppData = { settings: null, entries: [] };

export default function LunchSavingsPage() {
  const { t, locale } = useI18n();
  const copy = t.apps.lunchSavings;
  const [data, setData, { hydrated }] = useLocalStorageState<LunchAppData>(
    STORAGE_KEY,
    EMPTY,
  );
  const [setupOpen, setSetupOpen] = useState(false);
  const [numpadOpen, setNumpadOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const today = todayIsoDate();

  // 古い LocalStorage データを起動時に正規化
  useEffect(() => {
    if (!hydrated || !data.settings) return;
    const normalized = normalizeSettings(
      data.settings as LunchSettings & Record<string, unknown>,
    );
    if (!normalized) return;
    const same =
      JSON.stringify(normalized) === JSON.stringify(data.settings);
    if (!same) {
      setData((prev) => ({ ...prev, settings: normalized }));
    }
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hydrated) return;
    if (!data.settings) setSetupOpen(true);
  }, [hydrated, data.settings]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // 言語切替時、初期例のままのご褒美名を現在言語のデフォルトへ
  useEffect(() => {
    if (!hydrated || !data.settings) return;
    const label = data.settings.goalLabel?.trim() ?? "";
    const nextDefault = copy.setup.goalLabelDefault;
    if (
      (KNOWN_GOAL_DEFAULTS as readonly string[]).includes(label) &&
      label !== nextDefault
    ) {
      setData((prev) => {
        if (!prev.settings) return prev;
        return {
          ...prev,
          settings: { ...prev.settings, goalLabel: nextDefault },
        };
      });
    }
  }, [locale, hydrated, copy.setup.goalLabelDefault]); // eslint-disable-line react-hooks/exhaustive-deps

  const settings = useMemo(() => {
    if (!data.settings) return null;
    return normalizeSettings(
      data.settings as LunchSettings & Record<string, unknown>,
    );
  }, [data.settings]);

  const stats = useMemo(() => {
    if (!settings) return null;
    return calcPeriodStats(settings, data.entries);
  }, [settings, data.entries]);

  const todayEntry = useMemo(
    () => data.entries.find((e) => e.date === today) ?? null,
    [data.entries, today],
  );

  const recent = useMemo(() => {
    if (!settings) return [];
    return [...data.entries]
      .filter((e) =>
        isInPeriod(e.date, settings.startDate, settings.endDate),
      )
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 20);
  }, [data.entries, settings]);

  function showToast(message: string, withCelebrate = false) {
    setToast(message);
    if (withCelebrate) {
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 700);
    }
  }

  function saveSettings(next: LunchSettings) {
    setData((prev) => ({ ...prev, settings: next }));
    setSetupOpen(false);
  }

  function changeMode(mode: LunchMode) {
    setData((prev) => {
      if (!prev.settings) return prev;
      const base =
        normalizeSettings(prev.settings as LunchSettings & Record<string, unknown>) ??
        prev.settings;
      return { ...prev, settings: { ...base, mode } };
    });
  }

  function upsertToday(amount: number, note: string) {
    const existing = data.entries.find((e) => e.date === today);
    const cleanedNote = note.trim().slice(0, 80);
    if (existing) {
      setData((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => {
          if (e.id !== existing.id) return e;
          const next: LunchEntry = { id: e.id, date: e.date, amount };
          if (cleanedNote) next.note = cleanedNote;
          return next;
        }),
      }));
      showToast(copy.toast.updated, true);
    } else {
      const entry: LunchEntry = {
        id: createId(),
        date: today,
        amount,
        ...(cleanedNote ? { note: cleanedNote } : {}),
      };
      setData((prev) => ({
        ...prev,
        entries: [...prev.entries, entry],
      }));
      showToast(copy.toast.saved, true);
    }
    setNumpadOpen(false);
  }

  function deleteEntry(id: string) {
    setData((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== id),
    }));
    showToast(copy.toast.deleted);
  }

  if (!hydrated) {
    return (
      <AppShell
        title={copy.shell.title}
        description={copy.shell.description}
        isPwa
      >
        <p className="text-sm text-zinc-400">{t.common.loading}</p>
      </AppShell>
    );
  }

  const setupCopy = {
    ...copy.setup,
    modes: copy.modes,
    period: copy.period,
    currency: copy.currency,
  };

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      isPwa
      afterDataManager={<InstallAppButton copy={copy.install} />}
      dataManager={{
        appId: "lunch-savings",
        fileNamePrefix: "lunch-savings",
        getData: () => data,
        onImport: (raw) => {
          const parsed = parseLunchData(raw);
          if (!parsed) return false;
          setData(parsed);
          if (!parsed.settings) setSetupOpen(true);
          return true;
        },
      }}
    >
      {settings && stats ? (
        <Dashboard
          settings={settings}
          stats={stats}
          todayEntry={todayEntry}
          recent={recent}
          copy={copy.dash}
          quips={copy.quips}
          locale={locale}
          celebrate={celebrate}
          onRecord={() => setNumpadOpen(true)}
          onEditToday={() => setNumpadOpen(true)}
          onOpenSettings={() => setSetupOpen(true)}
          onDelete={deleteEntry}
          onChangeMode={changeMode}
        />
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="text-4xl" aria-hidden>
            🍱
          </p>
          <p className="text-sm text-zinc-500">{copy.setup.subtitle}</p>
          <button
            type="button"
            onClick={() => setSetupOpen(true)}
            className="lunch-confirm-btn !px-8 !py-3.5"
          >
            {copy.setup.save}
          </button>
        </div>
      )}

      <SetupModal
        open={setupOpen}
        initial={settings}
        isEdit={settings !== null}
        copy={setupCopy}
        onClose={() => {
          if (settings) setSetupOpen(false);
        }}
        onSave={saveSettings}
      />

      <NumpadModal
        open={numpadOpen}
        initialAmount={todayEntry?.amount}
        initialNote={todayEntry?.note}
        isEdit={todayEntry !== null}
        currency={settings?.currency ?? "JPY"}
        locale={locale}
        copy={copy.numpad}
        onClose={() => setNumpadOpen(false)}
        onConfirm={upsertToday}
      />

      {toast ? (
        <div
          role="status"
          className="lunch-toast fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-zinc-900 shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </AppShell>
  );
}
