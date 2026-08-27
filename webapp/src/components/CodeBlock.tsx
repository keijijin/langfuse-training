"use client";

import { useState, useEffect, useRef } from "react";
import hljs from "highlight.js";

interface CodeBlockProps {
  language: string;
  children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && language) {
      hljs.highlightElement(codeRef.current);
    }
  }, [children, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-5 rounded-xl overflow-hidden shadow-sm border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#1c2128] text-slate-400 text-xs px-4 py-2.5 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-2 font-mono">{language || "code"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-700/60 hover:text-slate-200 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">コピー済み</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>コピー</span>
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre className="!m-0 !rounded-none bg-[#161b22] overflow-x-auto p-4 text-sm leading-relaxed whitespace-pre-wrap">
        <code ref={codeRef} className={language ? `language-${language}` : "text-[#e6edf3]"}>
          {children}
        </code>
      </pre>
    </div>
  );
}
