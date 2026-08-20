"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Replace } from "lucide-react";

import { useI18n } from "@/i18n";
import type { BookVariable } from "./types";

type VariablesReaderModalProps = {
  variables: BookVariable[];
  onConfirm: (values: Record<string, string>) => void;
};

/**
 * 閲覧開始前の名前入力オーバーレイ。
 * 確定するまで本の描画（paginate）を始めない。
 */
export default function VariablesReaderModal({
  variables,
  onConfirm,
}: VariablesReaderModalProps) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer.view.variables;
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      variables.map((variable) => [variable.id, variable.defaultValue]),
    ),
  );

  // 本が変わったとき初期値を入れ直す
  useEffect(() => {
    setValues(
      Object.fromEntries(
        variables.map((variable) => [variable.id, variable.defaultValue]),
      ),
    );
  }, [variables]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onConfirm(values);
  }

  return (
    <div className="bv-reader-vars" role="dialog" aria-modal="true" aria-labelledby="bv-reader-vars-title">
      <form className="bv-reader-vars__card" onSubmit={handleSubmit}>
        <div className="mb-3 flex items-start gap-2">
          <Replace className="mt-0.5 size-5 shrink-0 text-zinc-500" aria-hidden />
          <div className="min-w-0">
            <h2
              id="bv-reader-vars-title"
              className="text-base font-semibold tracking-tight text-zinc-800"
            >
              {copy.title}
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
              {copy.lead}
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {variables.map((variable) => (
            <li key={variable.id}>
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[11px] font-medium text-zinc-600">
                  {variable.label.trim() || variable.id}
                </span>
                <input
                  type="text"
                  value={values[variable.id] ?? ""}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      [variable.id]: event.target.value,
                    }))
                  }
                  placeholder={variable.defaultValue}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none ring-zinc-400 focus:ring-2"
                  autoComplete="off"
                />
              </label>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="submit" className="btn-primary">
            {copy.confirm}
          </button>
        </div>
      </form>
    </div>
  );
}
