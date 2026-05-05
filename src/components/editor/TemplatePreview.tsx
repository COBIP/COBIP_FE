'use client';

/* eslint-disable @next/next/no-img-element */

import type { JSONContent } from '@tiptap/core';
import type { CSSProperties, ReactNode } from 'react';
import type { AdminGrammarSection } from '@/types/AdminGrammarTemplateTypes';

interface TemplatePreviewProps {
  sections: AdminGrammarSection[];
}

interface PreviewMediaAttrs {
  src?: string;
  alt?: string;
  caption?: string;
  align?: 'left' | 'center' | 'right';
  width?: number;
  poster?: string;
}

function buildPlainText(node: JSONContent): string {
  if (node.text) {
    return node.text;
  }

  return (node.content ?? []).map(buildPlainText).join('');
}

function getAlignClass(align: PreviewMediaAttrs['align']) {
  if (align === 'left') {
    return 'items-start';
  }

  if (align === 'right') {
    return 'items-end';
  }

  return 'items-center';
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

    if (mark.type === 'code') {
      content = (
        <code key={`${key}-code`} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-sm">
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
          className="font-medium text-emerald-700 underline"
        >
          {content}
        </a>
      );
    }
  }

  return content;
}

function renderPreviewChildren(node: JSONContent, keyPrefix: string): ReactNode {
  return (node.content ?? []).map((childNode, index) =>
    renderPreviewNode(childNode, `${keyPrefix}-${index}`),
  );
}

function renderPreviewMedia(node: JSONContent, key: string, mediaType: 'image' | 'video') {
  const attrs = (node.attrs ?? {}) as PreviewMediaAttrs;
  const width = attrs.width ?? 100;
  const style: CSSProperties = { width: `${width}%` };

  return (
    <figure key={key} className={`my-5 flex flex-col gap-2 ${getAlignClass(attrs.align)}`}>
      {mediaType === 'image' ? (
        <img
          src={attrs.src}
          alt={attrs.alt ?? ''}
          className="max-h-96 rounded border border-slate-200 object-contain"
          style={style}
        />
      ) : (
        <video
          src={attrs.src}
          poster={attrs.poster}
          controls
          className="max-h-96 rounded border border-slate-200 bg-slate-950"
          style={style}
        />
      )}
      {attrs.caption ? (
        <figcaption className="w-full text-center text-sm text-slate-500">{attrs.caption}</figcaption>
      ) : null}
    </figure>
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
      <h3 key={key} className={`mt-6 font-bold text-slate-950 ${headingClass}`}>
        {renderPreviewChildren(node, key)}
      </h3>
    );
  }

  if (node.type === 'paragraph') {
    return (
      <p key={key} className="min-h-6 leading-7 text-slate-700">
        {renderPreviewChildren(node, key)}
      </p>
    );
  }

  if (node.type === 'bulletList') {
    return (
      <ul key={key} className="list-disc space-y-1 pl-6 text-slate-700">
        {renderPreviewChildren(node, key)}
      </ul>
    );
  }

  if (node.type === 'orderedList') {
    return (
      <ol key={key} className="list-decimal space-y-1 pl-6 text-slate-700">
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
      <blockquote key={key} className="border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-slate-700">
        {renderPreviewChildren(node, key)}
      </blockquote>
    );
  }

  if (node.type === 'codeBlock') {
    return (
      <pre key={key} className="overflow-x-auto rounded bg-slate-950 p-4 text-sm text-emerald-100">
        <code>{buildPlainText(node)}</code>
      </pre>
    );
  }

  if (node.type === 'horizontalRule') {
    return <hr key={key} className="my-6 border-slate-200" />;
  }

  if (node.type === 'hardBreak') {
    return <br key={key} />;
  }

  if (node.type === 'image') {
    return renderPreviewMedia(node, key, 'image');
  }

  if (node.type === 'video') {
    return renderPreviewMedia(node, key, 'video');
  }

  return <div key={key}>{renderPreviewChildren(node, key)}</div>;
}

export function TemplatePreview({ sections }: TemplatePreviewProps) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.id} className="space-y-3 border-b border-slate-200 pb-6 last:border-b-0">
          <h2 className="text-lg font-bold text-slate-950">{section.heading}</h2>
          <div className="space-y-3">
            {section.content.content?.length ? (
              section.content.content.map((node, index) => renderPreviewNode(node, `${section.id}-${index}`))
            ) : (
              <p className="text-sm text-slate-400">작성된 본문이 없습니다.</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
