"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "./CodeBlock";
import { MermaidDiagram } from "./MermaidDiagram";

interface MarkdownRendererProps {
  content: string;
}

function extractCodeFromPre(children: React.ReactNode): {
  language: string;
  code: string;
} | null {
  const child = React.Children.toArray(children)[0];
  if (!React.isValidElement(child)) return null;

  const props = child.props as { className?: string; children?: React.ReactNode };
  const className = props.className || "";
  const match = /language-(\w+)/.exec(className);
  const language = match ? match[1] : "";
  const code = String(props.children || "").replace(/\n$/, "");

  return { language, code };
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-img:rounded-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          pre({ children }) {
            const extracted = extractCodeFromPre(children);
            if (!extracted) {
              return <pre>{children}</pre>;
            }

            const { language, code } = extracted;

            if (language === "mermaid") {
              return <MermaidDiagram code={code} />;
            }

            return <CodeBlock language={language}>{code}</CodeBlock>;
          },
          code({ className, children, ...props }) {
            const isBlock = /language-/.test(className || "");
            if (isBlock) {
              return <code className={className} {...props}>{children}</code>;
            }
            return <code {...props}>{children}</code>;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-6 rounded-lg border border-[var(--border)]">
                <table className="min-w-full">{children}</table>
              </div>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary-500 bg-[var(--bg-secondary)] rounded-r-lg px-4 py-3 my-4 not-italic text-[var(--text-secondary)]">
                {children}
              </blockquote>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-2xl font-bold mt-12 mb-4 pb-2 border-b border-[var(--border)]">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-xl font-semibold mt-8 mb-3">{children}</h3>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
