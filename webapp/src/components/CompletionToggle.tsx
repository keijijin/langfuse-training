"use client";

import { useEffect, useState } from "react";
import { isComplete, markComplete, markIncomplete } from "@/lib/progress";

interface CompletionToggleProps {
  moduleId: string;
}

export function CompletionToggle({ moduleId }: CompletionToggleProps) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(isComplete(moduleId));
  }, [moduleId]);

  const toggle = () => {
    if (completed) {
      markIncomplete(moduleId);
      setCompleted(false);
    } else {
      markComplete(moduleId);
      setCompleted(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        completed
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700"
          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-primary-300"
      }`}
    >
      {completed ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
        </svg>
      )}
      {completed ? "修了済み" : "修了にする"}
    </button>
  );
}
