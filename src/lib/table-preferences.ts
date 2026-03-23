export type TableVisibleColumns = Record<string, boolean>;

const TABLE_PREFERENCES_PREFIX = "clienthub.table.preferences";
const TABLE_PREFERENCES_VERSION = 1;

type StoredTablePreferences = {
  version: number;
  updatedAt: number;
  visibleColumns: TableVisibleColumns;
};

function getStorageKey(tableKey: string): string {
  return `${TABLE_PREFERENCES_PREFIX}.${tableKey}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeVisibleColumns(
  value: unknown,
  fallback: TableVisibleColumns,
): TableVisibleColumns {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const input = value as Record<string, unknown>;
  const normalized: TableVisibleColumns = { ...fallback };

  Object.keys(fallback).forEach((key) => {
    if (typeof input[key] === "boolean") {
      normalized[key] = input[key] as boolean;
    }
  });

  return normalized;
}

export function readTableVisibleColumns(
  tableKey: string,
  fallback: TableVisibleColumns,
): TableVisibleColumns {
  if (!isBrowser()) return fallback;

  try {
    const raw = window.localStorage.getItem(getStorageKey(tableKey));
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<StoredTablePreferences>;
    return normalizeVisibleColumns(parsed.visibleColumns, fallback);
  } catch {
    return fallback;
  }
}

export function writeTableVisibleColumns(
  tableKey: string,
  visibleColumns: TableVisibleColumns,
): void {
  if (!isBrowser()) return;

  const payload: StoredTablePreferences = {
    version: TABLE_PREFERENCES_VERSION,
    updatedAt: Date.now(),
    visibleColumns,
  };

  window.localStorage.setItem(getStorageKey(tableKey), JSON.stringify(payload));
}
