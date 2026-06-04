'use client';

import type { AiFeatureTemplateApiSpec } from '@/api/services/AiService';
import { ApiSpecDetails } from '@/features/functional-template-ai/components/ApiSpecDetails';
import { MarkdownTextView } from './MarkdownTextView';

function formatJson(value: unknown) {
  if (typeof value === 'string') return value;
  return JSON.stringify(value ?? {}, null, 2);
}

export function parseStructuredApiSpec(content?: string): AiFeatureTemplateApiSpec[] | null {
  if (!content?.trim()) return null;

  try {
    const parsed: unknown = JSON.parse(content);
    const items = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && 'apis' in parsed && Array.isArray(parsed.apis)
        ? parsed.apis
        : null;

    if (!items) return null;

    return items.filter((item): item is AiFeatureTemplateApiSpec => (
      Boolean(item) &&
      typeof item === 'object' &&
      'method' in item &&
      'endpoint' in item
    ));
  } catch {
    return null;
  }
}

export function ApiSpecSection({ content, isDarkMode = false }: { content?: string; isDarkMode?: boolean }) {
  const apiSpecs = parseStructuredApiSpec(content);

  if (!content?.trim()) {
    return (
      <div className={`flex min-h-40 items-center justify-center rounded-lg border text-sm ${
        isDarkMode ? 'border-[#334155] bg-[#1E293B] text-[#94A3B8]' : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
      }`}>
        API 명세가 없습니다.
      </div>
    );
  }

  if (!apiSpecs) {
    return (
      <section className={`rounded-lg border p-5 ${
        isDarkMode ? 'border-[#334155] bg-[#1E293B] text-[#E2E8F0]' : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B]'
      }`}>
        <MarkdownTextView content={content} isDarkMode={isDarkMode} />
      </section>
    );
  }

  return (
    <div className="space-y-5">
      {apiSpecs.map((api, index) => (
        <article key={`${api.method}-${api.endpoint}-${index}`} className={`rounded-lg border p-5 ${
          isDarkMode ? 'border-[#334155] bg-[#1E293B]' : 'border-[#E2E8F0] bg-white'
        }`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
                {api.apiName || `API ${index + 1}`}
              </h3>
              {api.description && (
                <p className={`mt-2 text-sm leading-6 ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>{api.description}</p>
              )}
            </div>
            <span className="rounded-md bg-[#F5F3FF] px-3 py-1.5 font-mono text-xs font-bold text-[#7C3AED]">
              {api.method || 'GET'} {api.endpoint || '/'}
            </span>
          </div>

          <ApiSpecDetails api={api} />

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className={`mb-2 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>Request Body</h4>
              <pre className="max-h-80 overflow-auto rounded-lg bg-[#0F172A] p-4 text-xs leading-5 text-[#E2E8F0]"><code>{formatJson(api.requestBody)}</code></pre>
            </div>
            <div>
              <h4 className={`mb-2 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>Response Body</h4>
              <pre className="max-h-80 overflow-auto rounded-lg bg-[#0F172A] p-4 text-xs leading-5 text-[#E2E8F0]"><code>{formatJson(api.responseBody)}</code></pre>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
