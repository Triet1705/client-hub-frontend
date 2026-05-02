import { useState } from "react";
import { SmartTaskHistoryItem } from "../types/smart-tasks.types";

const HISTORY_KEY = "clienthub_smart_tasks_history";

export function useSmartTasksHistory() {
  const [history, setHistory] = useState<SmartTaskHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) return JSON.parse(stored) as SmartTaskHistoryItem[];
    } catch {
      // ignore parse errors and start with empty history
    }
    return [];
  });

  const addHistoryItem = (item: SmartTaskHistoryItem) => {
    const newHistory = [item, ...history];
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const updateHistoryItem = (id: string, updates: Partial<SmartTaskHistoryItem>) => {
    const newHistory = history.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const removeHistoryItem = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  return {
    history,
    addHistoryItem,
    updateHistoryItem,
    removeHistoryItem,
  };
}
