import { useState, useCallback } from "react";

const STORAGE_KEY = "tk-upload-history";
const MAX_ENTRIES = 20;

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function formatRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days}d`;
  return new Date(isoString).toLocaleDateString("es-BO", { day: "numeric", month: "short" });
}

export function useUploadHistory() {
  const [history, setHistory] = useState(readHistory);

  const addEntry = useCallback((entry) => {
    const newEntry = {
      ...entry,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...readHistory()].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setHistory(updated);
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(readHistory());
  }, []);

  return { history, addEntry, refreshHistory };
}
