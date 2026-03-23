export function resolveEnumFromQuery<T extends string>(
  raw: string | null,
  allowedValues: readonly T[],
  fallback: T,
): T {
  if (!raw) return fallback;
  return allowedValues.includes(raw as T) ? (raw as T) : fallback;
}

export function resolveTextFromQuery(raw: string | null, fallback = ""): string {
  return raw ?? fallback;
}

type QueryParamUpdate = {
  key: string;
  value: string | number | null | undefined;
  defaultValue?: string | number;
};

export function buildUpdatedQueryString(
  currentQueryString: string,
  updates: QueryParamUpdate[],
): string {
  const params = new URLSearchParams(currentQueryString);

  updates.forEach(({ key, value, defaultValue }) => {
    if (value === undefined || value === null || value === "") {
      params.delete(key);
      return;
    }

    if (defaultValue !== undefined && value === defaultValue) {
      params.delete(key);
      return;
    }

    params.set(key, String(value));
  });

  return params.toString();
}
