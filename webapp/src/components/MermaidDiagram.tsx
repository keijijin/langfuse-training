"use client";

import { useEffect, useRef, useState, useId } from "react";

interface MermaidDiagramProps {
  code: string;
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useId().replace(/:/g, "-");

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    import("mermaid").then(async (m) => {
      if (cancelled) return;

      m.default.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          primaryColor: "#dbeafe",
          primaryTextColor: "#1e293b",
          primaryBorderColor: "#3b82f6",
          secondaryColor: "#f0fdf4",
          secondaryTextColor: "#1e293b",
          secondaryBorderColor: "#22c55e",
          tertiaryColor: "#fef3c7",
          tertiaryTextColor: "#1e293b",
          tertiaryBorderColor: "#f59e0b",
          lineColor: "#475569",
          textColor: "#1e293b",
          mainBkg: "#dbeafe",
          nodeBorder: "#3b82f6",
          clusterBkg: "#f1f5f9",
          clusterBorder: "#94a3b8",
          titleColor: "#0f172a",
          edgeLabelBackground: "#ffffff",
          nodeTextColor: "#1e293b",
          actorTextColor: "#1e293b",
          actorBorder: "#3b82f6",
          actorBkg: "#dbeafe",
          labelTextColor: "#1e293b",
          loopTextColor: "#1e293b",
          noteBkgColor: "#fef9c3",
          noteTextColor: "#1e293b",
          noteBorderColor: "#eab308",
          signalColor: "#1e293b",
          signalTextColor: "#1e293b",
        },
        securityLevel: "loose",
        fontFamily: "system-ui, -apple-system, sans-serif",
      });

      try {
        const { svg } = await m.default.render(`mermaid${uniqueId}`, code.trim());
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "描画エラー");
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code, uniqueId]);

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">Mermaid 描画エラー</p>
        <pre className="mt-2 text-xs text-red-500 overflow-x-auto">{error}</pre>
      </div>
    );
  }

  return (
    <div className="mermaid-container my-8">
      <div
        ref={containerRef}
        className="flex justify-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto"
      />
    </div>
  );
}
