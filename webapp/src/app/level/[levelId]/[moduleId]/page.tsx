import Link from "next/link";
import { notFound } from "next/navigation";
import { getLevel, getModule } from "@/lib/content";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CompletionToggle } from "@/components/CompletionToggle";

interface PageProps {
  params: { levelId: string; moduleId: string };
}

export default function ModulePage({ params }: PageProps) {
  const level = getLevel(params.levelId);
  const mod = getModule(params.levelId, params.moduleId);

  if (!level || !mod) notFound();

  const currentIdx = level.modules.findIndex((m) => m.id === mod.id);
  const prevMod = currentIdx > 0 ? level.modules[currentIdx - 1] : null;
  const nextMod = currentIdx < level.modules.length - 1 ? level.modules[currentIdx + 1] : null;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">トップ</Link>
        <span>/</span>
        <Link href={`/level/${level.id}`} className="hover:text-primary-600 dark:hover:text-primary-400">
          {level.title}
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)]">{mod.title}</span>
      </nav>

      {/* Content */}
      <article>
        <MarkdownRenderer content={mod.content} />
      </article>

      {/* Completion */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
        <CompletionToggle moduleId={mod.id} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        {prevMod ? (
          <Link
            href={`/level/${level.id}/${prevMod.id}`}
            className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {prevMod.title}
          </Link>
        ) : <div />}
        {nextMod ? (
          <Link
            href={`/level/${level.id}/${nextMod.id}`}
            className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {nextMod.title}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <Link
            href={`/level/${level.id}`}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            レベル一覧に戻る →
          </Link>
        )}
      </div>
    </div>
  );
}
