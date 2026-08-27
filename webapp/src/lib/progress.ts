"use client";

const STORAGE_KEY = "langfuse-training-progress";

export interface Progress {
  completedModules: string[];
  lastVisited: string | null;
  quizScores: Record<string, number>;
}

function getDefault(): Progress {
  return { completedModules: [], lastVisited: null, quizScores: {} };
}

export function getProgress(): Progress {
  if (typeof window === "undefined") return getDefault();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefault();
  } catch {
    return getDefault();
  }
}

export function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markComplete(moduleId: string): void {
  const progress = getProgress();
  if (!progress.completedModules.includes(moduleId)) {
    progress.completedModules.push(moduleId);
  }
  saveProgress(progress);
}

export function markIncomplete(moduleId: string): void {
  const progress = getProgress();
  progress.completedModules = progress.completedModules.filter((m) => m !== moduleId);
  saveProgress(progress);
}

export function isComplete(moduleId: string): boolean {
  return getProgress().completedModules.includes(moduleId);
}

export function setLastVisited(path: string): void {
  const progress = getProgress();
  progress.lastVisited = path;
  saveProgress(progress);
}

export function getLevelProgress(levelId: string, totalModules: number): number {
  const progress = getProgress();
  const completed = progress.completedModules.filter((m) => m.startsWith(`${levelId}-`)).length;
  return totalModules > 0 ? Math.round((completed / totalModules) * 100) : 0;
}
