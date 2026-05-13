'use client';

import { useMemo } from 'react';

interface TiptapRendererProps {
  content: Record<string, unknown> | null | undefined;
}

/** Tiptap JSON → HTML 변환 후 렌더링 (클라이언트 전용) */
export function TiptapRenderer({ content }: TiptapRendererProps) {
  const html = useMemo(() => {
    if (!content) return '';

    try {
      return renderTiptapJson(content);
    } catch {
      return '';
    }
  }, [content]);

  if (!html) return null;

  return (
    <div
      className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-purple-700 prose-pre:bg-gray-900 prose-pre:text-gray-100"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Tiptap JSON 노드를 HTML 문자열로 변환 */
function renderTiptapJson(node: Record<string, unknown>): string {
  if (!node || !node.type) return '';
  
  const nodeType = node.type as string;
  const tag = getTagForNodeType(nodeType, node.attrs as Record<string, unknown> | undefined);
  if (!tag) return '';

  const children = renderChildren(node.content as unknown[] | undefined, nodeType);
  
  if (tag === 'br') return '<br/>';
  
  return `<${tag}>${children}</${tag}>`;
}

/** 노드 타입을 HTML 태그로 변환 */
function getTagForNodeType(type: string, attrs?: Record<string, unknown>): string | null {
  switch (type) {
    case 'doc': return 'div';
    case 'paragraph': return 'p';
    case 'heading': {
      const level = (attrs?.level as number) || 2;
      return `h${Math.min(Math.max(level, 1), 6)}`;
    }
    case 'bulletList': return 'ul';
    case 'orderedList': return 'ol';
    case 'listItem': return 'li';
    case 'codeBlock': return 'pre';
    case 'blockquote': return 'blockquote';
    case 'horizontalRule': return 'hr';
    case 'hardBreak': return 'br';
    case 'text': return null;
    default: return null;
  }
}

/** 자식 노드들을 HTML로 변환 */
function renderChildren(content?: unknown[], parentType?: string): string {
  if (!content || !Array.isArray(content)) return '';
  
  return content.map((child) => {
    const node = child as Record<string, unknown>;
    
    if (node.type === 'text') {
      let text = renderTextNode(node);
      // codeBlock 내부의 텍스트는 code 태그로 감싸기
      if (parentType === 'codeBlock') {
        text = `<code>${text}</code>`;
      }
      return text;
    }
    
    return renderTiptapJson(node);
  }).join('');
}

/** 텍스트 노드를 HTML로 변환 (마크/스타일 적용) */
function renderTextNode(node: Record<string, unknown>): string {
  let text = (node.text as string) || '';
  
  const marks = node.marks as Array<Record<string, unknown>> | undefined;
  if (marks) {
    for (const mark of marks) {
      switch (mark.type) {
        case 'bold': text = `<strong>${text}</strong>`; break;
        case 'italic': text = `<em>${text}</em>`; break;
        case 'underline': text = `<u>${text}</u>`; break;
        case 'strike': text = `<s>${text}</s>`; break;
        case 'code': text = `<code>${text}</code>`; break;
        case 'highlight': text = `<mark>${text}</mark>`; break;
        case 'textStyle': {
          const style = mark.attrs as Record<string, unknown> | undefined;
          if (style?.color) text = `<span style="color:${style.color}">${text}</span>`;
          break;
        }
        case 'textAlign': {
          const align = (mark.attrs as Record<string, unknown> | undefined)?.textAlign;
          if (align) text = `<span style="text-align:${align}">${text}</span>`;
          break;
        }
      }
    }
  }
  
  return text;
}
