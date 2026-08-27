import { NextRequest, NextResponse } from "next/server";
import Fuse from "fuse.js";
import { getAllContent } from "@/lib/content";

let fuseIndex: Fuse<{ levelId: string; moduleId: string; title: string; content: string }> | null = null;

function getIndex() {
  if (!fuseIndex) {
    const items = getAllContent();
    fuseIndex = new Fuse(items, {
      keys: [
        { name: "title", weight: 2 },
        { name: "content", weight: 1 },
      ],
      threshold: 0.3,
      includeMatches: true,
      ignoreLocation: true,
    });
  }
  return fuseIndex;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const fuse = getIndex();
  const raw = fuse.search(q, { limit: 10 });

  const results = raw.map((r) => {
    const contentMatch = r.matches?.find((m) => m.key === "content");
    let snippet = "";
    if (contentMatch && contentMatch.indices.length > 0) {
      const [start] = contentMatch.indices[0];
      const text = r.item.content;
      const from = Math.max(0, start - 40);
      const to = Math.min(text.length, start + 120);
      snippet = (from > 0 ? "..." : "") + text.slice(from, to).replace(/\n/g, " ") + (to < text.length ? "..." : "");
    } else {
      snippet = r.item.content.slice(0, 150).replace(/\n/g, " ") + "...";
    }

    return {
      levelId: r.item.levelId,
      moduleId: r.item.moduleId,
      title: r.item.title,
      snippet,
    };
  });

  return NextResponse.json({ results });
}
