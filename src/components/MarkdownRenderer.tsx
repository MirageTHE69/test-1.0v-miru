'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string | null | undefined;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return <span className="text-slate-400 italic font-medium text-xs">No plan details compiled.</span>;

  // Split by line to parse simple headers, lists, and bold text
  const lines = content.split('\n');

  return (
    <div className={`space-y-4 text-slate-800 leading-relaxed font-sans ${className}`}>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // 1. Empty lines
        if (trimmed === '') {
          return <div key={index} className="h-2" />;
        }

        // 2. Heading 1 (e.g. # Header)
        if (trimmed.startsWith('# ')) {
          const text = trimmed.substring(2);
          return (
            <h1
              key={index}
              className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 mt-6 first:mt-0 font-tight tracking-tight"
            >
              {parseInlineMarkdown(text)}
            </h1>
          );
        }

        // 3. Heading 2 (e.g. ## Header)
        if (trimmed.startsWith('## ')) {
          const text = trimmed.substring(3);
          return (
            <h2 key={index} className="text-base font-bold text-indigo-950 mt-4 first:mt-0">
              {parseInlineMarkdown(text)}
            </h2>
          );
        }

        // 4. Heading 3 (e.g. ### Header)
        if (trimmed.startsWith('### ')) {
          const text = trimmed.substring(4);
          return (
            <h3 key={index} className="text-sm font-semibold text-slate-900 mt-3">
              {parseInlineMarkdown(text)}
            </h3>
          );
        }

        // 5. Bullet lists (e.g. - item or * item)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const text = trimmed.substring(2);
          return (
            <div key={index} className="flex items-start gap-2 pl-4 text-xs">
              <span className="text-indigo-500 mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <p className="flex-1 text-slate-600">{parseInlineMarkdown(text)}</p>
            </div>
          );
        }

        // 6. Numbered lists (e.g. 1. item)
        const numListMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numListMatch) {
          const num = numListMatch[1];
          const text = numListMatch[2];
          return (
            <div key={index} className="flex items-start gap-3 pl-2 text-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-50 text-[10px] font-bold text-indigo-600 mt-0.5 shrink-0">
                {num}
              </span>
              <p className="flex-1 text-slate-600 mt-0.5">{parseInlineMarkdown(text)}</p>
            </div>
          );
        }

        // 7. Standard block quote (e.g. > text)
        if (trimmed.startsWith('> ')) {
          const text = trimmed.substring(2);
          return (
            <blockquote
              key={index}
              className="border-l-4 border-indigo-400 bg-indigo-50/30 rounded-r px-4 py-2 my-2 text-xs text-indigo-950 font-medium italic"
            >
              {parseInlineMarkdown(text)}
            </blockquote>
          );
        }

        // Default: Standard Paragraph text
        return (
          <p key={index} className="text-xs text-slate-600 leading-normal">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

// Helper function to replace inline markdown like bold (**text**)
function parseInlineMarkdown(text: string) {
  // Regex to match **bold**
  const parts = [];
  let currentIndex = 0;
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.substring(currentIndex, match.index));
    }
    // Add the styled bold text
    parts.push(
      <strong key={match.index} className="font-semibold text-slate-900 bg-indigo-50/50 px-1 rounded">
        {match[1]}
      </strong>
    );
    currentIndex = boldRegex.lastIndex;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }

  return parts.length > 0 ? parts : text;
}
