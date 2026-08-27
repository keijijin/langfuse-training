"use client";

import { useEffect, useState } from "react";
import { getLevelProgress } from "@/lib/progress";

interface ProgressBarProps {
  levelId: string;
  totalModules: number;
}

export function ProgressBar({ levelId, totalModules }: ProgressBarProps) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    setPercent(getLevelProgress(levelId, totalModules));
  }, [levelId, totalModules]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-[var(--text-secondary)] font-medium min-w-[3ch]">
        {percent}%
      </span>
    </div>
  );
}
