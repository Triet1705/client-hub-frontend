"use client";

import * as React from "react";

interface UseAsyncSearchOptions {
  initialValue?: string;
  debounceMs?: number;
  minChars?: number;
}

export function useAsyncSearch({
  initialValue = "",
  debounceMs = 250,
  minChars = 2,
}: UseAsyncSearchOptions = {}) {
  const [keyword, setKeyword] = React.useState(initialValue);
  const [debouncedKeyword, setDebouncedKeyword] = React.useState(initialValue);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, keyword]);

  const normalizedKeyword = React.useMemo(
    () => debouncedKeyword.trim(),
    [debouncedKeyword],
  );

  const canSearch = normalizedKeyword.length >= minChars;

  const resetSearch = React.useCallback(() => {
    setKeyword("");
    setDebouncedKeyword("");
  }, []);

  return {
    keyword,
    setKeyword,
    debouncedKeyword,
    normalizedKeyword,
    canSearch,
    minChars,
    resetSearch,
  };
}
