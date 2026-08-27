"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchDialog } from "./SearchDialog";

const levels = [
  { id: "1", label: "L1 基礎", color: "bg-green-500" },
  { id: "2", label: "L2 実践", color: "bg-blue-500" },
  { id: "3", label: "L3 中級", color: "bg-yellow-500" },
  { id: "4", label: "L4 上級", color: "bg-orange-500" },
  { id: "5", label: "L5 プロ", color: "bg-red-500" },
];

export function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-primary)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg-primary)]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="text-primary-600 dark:text-primary-400">Langfuse</span>
              <span className="hidden sm:inline text-sm font-normal text-[var(--text-secondary)]">
                トレーニング
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {levels.map((level) => (
                <Link
                  key={level.id}
                  href={`/level/${level.id}`}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    pathname?.startsWith(`/level/${level.id}`)
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                  }`}
                >
                  {level.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                aria-label="検索"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <ThemeToggle />
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-[var(--bg-secondary)]"
                aria-label="メニュー"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden pb-3 border-t border-[var(--border)] mt-2 pt-2">
              {levels.map((level) => (
                <Link
                  key={level.id}
                  href={`/level/${level.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-[var(--bg-secondary)]"
                >
                  <span className={`w-2 h-2 rounded-full ${level.color}`} />
                  {level.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
