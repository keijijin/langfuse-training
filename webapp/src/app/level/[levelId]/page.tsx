import Link from "next/link";
import { notFound } from "next/navigation";
import { getLevel } from "@/lib/content";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ProgressBar } from "@/components/ProgressBar";

interface PageProps {
  params: { levelId: string };
}

export default function LevelPage({ params }: PageProps) {
  const level = getLevel(params.levelId);
  if (!level) notFound();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          ← トップへ戻る
        </Link>
        <h1 className="text-3xl font-bold mt-4">{level.title}</h1>
        <p className="mt-2 text-[var(--text-secondary)]">{level.description}</p>
      </div>

      {/* Progress */}
      <ProgressBar levelId={level.id} totalModules={level.modules.length} />

      {/* Video */}
      {level.video && (
        <VideoPlayer src={level.video} title={level.title} />
      )}

      {/* Module List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">モジュール一覧</h2>
        {level.modules.map((mod, idx) => (
          <Link
            key={mod.id}
            href={`/level/${level.id}/${mod.id}`}
            className="flex items-center gap-4 p-4 rounded-lg border border-[var(--border)] hover:border-primary-300 dark:hover:border-primary-700 hover:bg-[var(--bg-secondary)] transition-all"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-secondary)] text-sm font-medium text-[var(--text-secondary)]">
              {idx + 1}
            </span>
            <div className="flex-1">
              <div className="font-medium">{mod.title}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                モジュール {mod.moduleNum}
              </div>
            </div>
            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
