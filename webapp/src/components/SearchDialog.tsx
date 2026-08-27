"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  levelId: string;
  moduleId: string;
  title: string;
  snippet: string;
}

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!open) {
          /* parent handles open */
        }
      }
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-[var(--bg-primary)] rounded-xl shadow-2xl border border-[var(--border)]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="コンテンツを検索..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <kbd className="hidden sm:inline text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {loading && <p className="text-center text-sm text-[var(--text-secondary)] py-4">検索中...</p>}
          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="text-center text-sm text-[var(--text-secondary)] py-4">結果が見つかりません</p>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                router.push(`/level/${r.levelId}/${r.moduleId}`);
                onClose();
                setQuery("");
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <div className="text-sm font-medium">{r.title}</div>
              <div className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                {r.snippet}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
