'use client';

import type { ReactNode } from 'react';

interface MarkdownTextViewProps {
  content?: string;
  isDarkMode?: boolean;
  className?: string;
  compact?: boolean;
  maxBlocks?: number;
  maxListItems?: number;
}

type Block =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; language?: string; text: string };

type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'code'; text: string }
  | { type: 'link'; text: string; href: string };

function parseBlocks(content: string): Block[] {
  const normalizedContent = content
    .replace(/(#{1,6}\s+)/g, '\n$1')
    .replace(/\s+([-*+]\s+)/g, '\n$1')
    .replace(/\s+(\d+\.\s+)/g, '\n$1');
  const lines = normalizedContent.split(/\r?\n/);
  const blocks: Block[] = [];

  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i] ?? '';
    const line = rawLine.trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const opening = line.match(/^```([a-zA-Z0-9_-]+)?\s*(.*)$/);
      const language = opening?.[1];
      const firstLine = opening?.[2]?.trimEnd();
      const codeLines: string[] = [];

      if (firstLine) {
        codeLines.push(firstLine);
      }

      i += 1;

      while (i < lines.length) {
        const current = lines[i] ?? '';

        if (current.trim().startsWith('```')) {
          i += 1;
          break;
        }

        codeLines.push(current.replace(/^\s{0,4}/, ''));
        i += 1;
      }

      blocks.push({ type: 'code', language, text: codeLines.join('\n').trimEnd() });
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.replace(/^###\s+/, '') });
      i += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.replace(/^##\s+/, '') });
      i += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.replace(/^#\s+/, '') });
      i += 1;
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];

      while (i < lines.length && /^[-*+]\s+/.test((lines[i] ?? '').trim())) {
        items.push((lines[i] ?? '').trim().replace(/^[-*+]\s+/, ''));
        i += 1;
      }

      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];

      while (i < lines.length && /^\d+\.\s+/.test((lines[i] ?? '').trim())) {
        items.push((lines[i] ?? '').trim().replace(/^\d+\.\s+/, ''));
        i += 1;
      }

      blocks.push({ type: 'ol', items });
      continue;
    }

    const paragraphLines: string[] = [];

    while (i < lines.length) {
      const current = (lines[i] ?? '').trim();

      if (!current) {
        i += 1;
        break;
      }

      if (/^#{1,6}\s+/.test(current) || /^[-*+]\s+/.test(current) || /^\d+\.\s+/.test(current)) {
        break;
      }

      paragraphLines.push(current);
      i += 1;
    }

    if (paragraphLines.length > 0) {
      blocks.push({ type: 'p', text: paragraphLines.join(' ') });
    }
  }

  return blocks;
}

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const inlinePattern = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlinePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', text: text.slice(lastIndex, match.index) });
    }

    if (match[2]) {
      tokens.push({ type: 'bold', text: match[2] });
    } else if (match[3]) {
      tokens.push({ type: 'code', text: match[3] });
    } else if (match[4] && match[5]) {
      tokens.push({ type: 'link', text: match[4], href: match[5] });
    }

    lastIndex = inlinePattern.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', text: text.slice(lastIndex) });
  }

  return tokens;
}

function renderInline(text: string, keyPrefix: string, isDarkMode: boolean): ReactNode {
  return parseInline(text).map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    if (token.type === 'bold') {
      return <strong key={key}>{token.text}</strong>;
    }

    if (token.type === 'code') {
      return (
        <code
          key={key}
          className={`rounded px-1.5 py-0.5 font-mono text-[0.92em] ${
            isDarkMode ? 'bg-[#0F172A] text-[#E9D5FF]' : 'bg-white text-[#5B21B6]'
          }`}
        >
          {token.text}
        </code>
      );
    }

    if (token.type === 'link') {
      return (
        <a
          key={key}
          href={token.href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-[#7C3AED] underline underline-offset-2"
        >
          {token.text}
        </a>
      );
    }

    return token.text;
  });
}

export function formatPlainTextFromMarkdown(text?: string) {
  if (!text) {
    return '';
  }

  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function MarkdownTextView({
  content,
  isDarkMode = false,
  className,
  compact = false,
  maxBlocks,
  maxListItems,
}: MarkdownTextViewProps) {
  const text = content?.trim() ?? '';

  if (!text) {
    return null;
  }

  const blocks = parseBlocks(text).slice(0, maxBlocks);
  const paragraphClass = compact ? 'my-1 leading-5' : 'my-2 leading-relaxed';
  const h1Class = compact ? 'mt-1 text-sm' : 'mt-3 text-base';
  const h2Class = compact ? 'mt-1 text-[13px]' : 'mt-3 text-[15px]';
  const h3Class = compact ? 'mt-1 text-[13px]' : 'mt-2 text-sm';
  const listClass = compact ? 'my-1 list-disc space-y-1 pl-4' : 'my-2 list-disc space-y-1 pl-5';
  const orderedListClass = compact ? 'my-1 list-decimal space-y-1 pl-4' : 'my-2 list-decimal space-y-1 pl-5';
  const codeClass = compact
    ? 'my-2 max-w-full overflow-x-auto rounded-md px-3 py-2 text-xs leading-5'
    : 'my-3 max-w-full overflow-x-auto rounded-lg px-4 py-3 text-sm leading-6';

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === 'h1') {
          return (
            <h3
              key={`h1-${index}`}
              className={`${h1Class} font-semibold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}
            >
              {renderInline(block.text, `h1-${index}`, isDarkMode)}
            </h3>
          );
        }

        if (block.type === 'h2') {
          return (
            <h4
              key={`h2-${index}`}
              className={`${h2Class} font-semibold ${isDarkMode ? 'text-[#E2E8F0]' : 'text-[#334155]'}`}
            >
              {renderInline(block.text, `h2-${index}`, isDarkMode)}
            </h4>
          );
        }

        if (block.type === 'h3') {
          return (
            <h5
              key={`h3-${index}`}
              className={`${h3Class} font-semibold ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}
            >
              {renderInline(block.text, `h3-${index}`, isDarkMode)}
            </h5>
          );
        }

        if (block.type === 'ul') {
          return (
            <ul key={`ul-${index}`} className={listClass}>
              {block.items.slice(0, maxListItems).map((item, itemIndex) => (
                <li key={`ul-item-${index}-${itemIndex}`}>
                  {renderInline(item, `ul-item-${index}-${itemIndex}`, isDarkMode)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ol') {
          return (
            <ol key={`ol-${index}`} className={orderedListClass}>
              {block.items.slice(0, maxListItems).map((item, itemIndex) => (
                <li key={`ol-item-${index}-${itemIndex}`}>
                  {renderInline(item, `ol-item-${index}-${itemIndex}`, isDarkMode)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === 'code') {
          return (
            <pre
              key={`code-${index}`}
              className={`${codeClass} ${
                isDarkMode ? 'bg-[#0F172A] text-[#E2E8F0]' : 'bg-white text-[#1E293B]'
              }`}
            >
              <code className="font-mono whitespace-pre">{block.text}</code>
            </pre>
          );
        }

        return (
          <p key={`p-${index}`} className={paragraphClass}>
            {renderInline(block.text, `p-${index}`, isDarkMode)}
          </p>
        );
      })}
    </div>
  );
}
