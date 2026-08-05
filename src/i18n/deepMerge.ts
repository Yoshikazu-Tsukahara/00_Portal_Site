import type { DeepPartial } from "./localeMeta";

/**
 * オブジェクトを再帰的にマージする。
 * source の値が undefined でないキーで target を上書き（配列は置換）。
 */
export function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return (source as T) ?? target;
  }
  if (!target || typeof target !== "object" || Array.isArray(target)) {
    return target;
  }

  const out: Record<string, unknown> = {
    ...(target as Record<string, unknown>),
  };

  for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
    if (value === undefined) continue;
    const prev = out[key];
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      prev !== null &&
      typeof prev === "object" &&
      !Array.isArray(prev)
    ) {
      out[key] = deepMerge(prev, value as DeepPartial<typeof prev>);
    } else {
      out[key] = value;
    }
  }

  return out as T;
}
