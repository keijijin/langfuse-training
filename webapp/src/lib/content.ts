import fs from "fs";
import path from "path";

const CONTENT_DIR = process.env.NODE_ENV === "production"
  ? path.join(process.cwd(), "content")
  : path.join(process.cwd(), "..");

export interface ModuleInfo {
  id: string;
  levelId: string;
  moduleNum: string;
  title: string;
  filename: string;
  content: string;
}

export interface LevelInfo {
  id: string;
  title: string;
  description: string;
  color: string;
  video: string | null;
  modules: ModuleInfo[];
}

const LEVEL_META: Record<string, { title: string; description: string; color: string }> = {
  "1": { title: "基礎", description: "Langfuseの概念を理解し、最初のトレースを送信する", color: "green" },
  "2": { title: "実践入門", description: "SDKを使った本格的なトレーシングとフレームワーク統合", color: "blue" },
  "3": { title: "中級 — 品質改善ループ", description: "プロンプト管理・評価・データセットで品質を体系的に改善", color: "yellow" },
  "4": { title: "上級 — 本番運用", description: "本番監視・アノテーション・自動化・セキュリティ", color: "orange" },
  "5": { title: "プロフェッショナル", description: "セルフホスト構築・アーキテクチャ・カスタマイズ", color: "red" },
};

const VIDEO_FILES: Record<string, string> = {
  "1": "Langfuse_マスター_レベル1__基礎.mp4",
  "2": "Langfuse__本格的なLLMトレーシング.mp4",
  "3": "Langfuseマスター__継続的品質改善.mp4",
  "4": "Langfuse_Level_4__本番運用設計.mp4",
  "5": "LangfuseマスタリーLv5__設計図.mp4",
};

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].replace(/^モジュール\s+[\d-]+:\s*/, "") : "Untitled";
}

export function getLevels(): LevelInfo[] {
  return Object.entries(LEVEL_META).map(([id, meta]) => {
    const levelDir = path.join(CONTENT_DIR, `level-${id}`);
    const modules = getModulesForLevel(id, levelDir);
    const videoFile = VIDEO_FILES[id] || null;

    return {
      id,
      title: `Level ${id}: ${meta.title}`,
      description: meta.description,
      color: meta.color,
      video: videoFile ? `/videos/${encodeURIComponent(videoFile)}` : null,
      modules,
    };
  });
}

export function getLevel(levelId: string): LevelInfo | null {
  const meta = LEVEL_META[levelId];
  if (!meta) return null;

  const levelDir = path.join(CONTENT_DIR, `level-${levelId}`);
  const modules = getModulesForLevel(levelId, levelDir);
  const videoFile = VIDEO_FILES[levelId] || null;

  return {
    id: levelId,
    title: `Level ${levelId}: ${meta.title}`,
    description: meta.description,
    color: meta.color,
    video: videoFile ? `/videos/${encodeURIComponent(videoFile)}` : null,
    modules,
  };
}

function getModulesForLevel(levelId: string, levelDir: string): ModuleInfo[] {
  if (!fs.existsSync(levelDir)) return [];

  const files = fs.readdirSync(levelDir)
    .filter((f) => f.endsWith(".md") && !f.includes("README"))
    .sort();

  return files.map((filename) => {
    const content = fs.readFileSync(path.join(levelDir, filename), "utf-8");
    const idMatch = filename.match(/^(\d+)-(\d+)-/);
    const moduleNum = idMatch ? `${idMatch[1]}-${idMatch[2]}` : filename.replace(".md", "");

    return {
      id: moduleNum,
      levelId,
      moduleNum,
      title: extractTitle(content),
      filename,
      content,
    };
  });
}

export function getModule(levelId: string, moduleId: string): ModuleInfo | null {
  const levelDir = path.join(CONTENT_DIR, `level-${levelId}`);
  if (!fs.existsSync(levelDir)) return null;

  const files = fs.readdirSync(levelDir).filter((f) => f.startsWith(`${moduleId}-`) && f.endsWith(".md"));
  if (files.length === 0) return null;

  const filename = files[0];
  const content = fs.readFileSync(path.join(levelDir, filename), "utf-8");

  return {
    id: moduleId,
    levelId,
    moduleNum: moduleId,
    title: extractTitle(content),
    filename,
    content,
  };
}

export function getAllContent(): { levelId: string; moduleId: string; title: string; content: string }[] {
  const levels = getLevels();
  return levels.flatMap((level) =>
    level.modules.map((mod) => ({
      levelId: level.id,
      moduleId: mod.id,
      title: `${level.title} / ${mod.title}`,
      content: mod.content,
    }))
  );
}
