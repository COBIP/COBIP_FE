'use client';

import type { ReactNode } from 'react';
import type { JSONContent } from '@tiptap/core';

interface TiptapRendererProps {
  content: Record<string, unknown> | null | undefined;
}

/** Tiptap JSON → React 컴포넌트로 렌더링 */
export function TiptapRenderer({ content }: TiptapRendererProps) {
  if (!content) return null;

  return (
    <div className="space-y-3">
      {(content as JSONContent).content?.map((node, index) =>
        renderPreviewNode(node, `content-${index}`),
      )}
    </div>
  );
}

function renderPreviewNode(node: JSONContent, key: string): ReactNode {
    if (node.type === 'text') {
    return renderTextMarks(node, key);
      }

  if (node.type === 'heading') {
    const level = Number(node.attrs?.level ?? 2);
    const headingClass = level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg';
    return (
      <h3 key={key} className={`mt-6 font-bold text-gray-900 ${headingClass}`}>
        {renderPreviewChildren(node, key)}
      </h3>
    );
}

  if (node.type === 'paragraph') {
    return (
      <p key={key} className="min-h-6 leading-7 text-gray-700">
        {renderPreviewChildren(node, key)}
      </p>
    );
  }

  if (node.type === 'bulletList') {
    return (
      <ul key={key} className="list-disc space-y-1 pl-6 text-gray-700">
        {renderPreviewChildren(node, key)}
      </ul>
    );
  }

  if (node.type === 'orderedList') {
    return (
      <ol key={key} className="list-decimal space-y-1 pl-6 text-gray-700">
        {renderPreviewChildren(node, key)}
      </ol>
    );
  }

  if (node.type === 'listItem') {
    return (
      <li key={key} className="leading-7">
        {renderPreviewChildren(node, key)}
      </li>
    );
  }

  if (node.type === 'blockquote') {
    return (
      <blockquote key={key} className="border-l-4 border-purple-400 bg-purple-50 px-4 py-3 text-gray-700">
        {renderPreviewChildren(node, key)}
      </blockquote>
    );
  }

  if (node.type === 'codeBlock') {
    return (
      <pre key={key} className="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
        <code>{buildPlainText(node)}</code>
      </pre>
    );
  }

  if (node.type === 'horizontalRule') {
    return <hr key={key} className="my-6 border-gray-200" />;
  }

  if (node.type === 'hardBreak') {
    return <br key={key} />;
  }

  return <div key={key}>{renderPreviewChildren(node, key)}</div>;
}

function renderPreviewChildren(node: JSONContent, keyPrefix: string): ReactNode {
  return (node.content ?? []).map((childNode, index) =>
    renderPreviewNode(childNode, `${keyPrefix}-${index}`),
  );
}

function renderTextMarks(node: JSONContent, key: string): ReactNode {
  let content: ReactNode = node.text ?? '';

  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') {
      content = <strong key={`${key}-bold`}>{content}</strong>;
    }
    if (mark.type === 'italic') {
      content = <em key={`${key}-italic`}>{content}</em>;
    }
    if (mark.type === 'underline') {
      content = <u key={`${key}-underline`}>{content}</u>;
    }
    if (mark.type === 'strike') {
      content = <s key={`${key}-strike`}>{content}</s>;
    }
    if (mark.type === 'code') {
      content = (
        <code key={`${key}-code`} className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-purple-700">
          {content}
        </code>
      );
    }
    if (mark.type === 'textStyle') {
      content = (
        <span key={`${key}-color`} style={{ color: mark.attrs?.color as string | undefined }}>
          {content}
        </span>
      );
    }
    if (mark.type === 'highlight') {
      content = (
        <span
          key={`${key}-highlight`}
          style={{ backgroundColor: mark.attrs?.color as string | undefined }}
        >
          {content}
        </span>
      );
    }
    if (mark.type === 'link') {
      content = (
        <a
          key={`${key}-link`}
          href={mark.attrs?.href as string | undefined}
          className="font-medium text-purple-600 underline"
        >
          {content}
        </a>
      );
    }
  }

  return content;
}

function buildPlainText(node: JSONContent): string {
  if (node.text) return node.text;
  return (node.content ?? []).map(buildPlainText).join('');
}

