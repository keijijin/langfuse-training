import Link from "next/link";
import { getLevels } from "@/lib/content";

const colorMap: Record<string, string> = {
  green: "from-green-500 to-emerald-600",
  blue: "from-blue-500 to-indigo-600",
  yellow: "from-yellow-500 to-amber-600",
  orange: "from-orange-500 to-red-500",
  red: "from-red-500 to-rose-600",
};

const bgColorMap: Record<string, string> = {
  green: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
  blue: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  yellow: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
  orange: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
  red: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
};

export default function HomePage() {
  const levels = getLevels();

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
          Langfuse トレーニング
        </h1>
        <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          LLMアプリケーション開発者のための完全習得プログラム。
          初心者からプロフェッショナルまで、5段階で体系的に学べます。
        </p>
        <div className="mt-6 flex justify-center gap-4 text-sm text-[var(--text-secondary)]">
          <span>📚 22モジュール</span>
          <span>🎬 5本の動画</span>
          <span>⏱️ 約20時間</span>
        </div>
      </section>

      {/* Level Cards */}
      <section className="grid gap-4">
        {levels.map((level) => (
          <Link
            key={level.id}
            href={`/level/${level.id}`}
            className={`block p-6 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-0.5 ${bgColorMap[level.color]}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${colorMap[level.color]} text-white text-sm font-bold`}>
                    {level.id}
                  </span>
                  <h2 className="text-xl font-bold">{level.title}</h2>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {level.description}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                  <span>{level.modules.length} モジュール</span>
                  {level.video && <span>🎬 動画あり</span>}
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--text-secondary)] mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
