"use client";

import { MarkdownTextView } from './MarkdownTextView';

interface RequirementsSectionProps {
  isDarkMode?: boolean;
  content?: string;
}

type RequirementItem = {
  id?: string;
  type: string;
  required: boolean;
  description: string;
  priority?: string;
  inputValue?: string;
  condition?: string;
  successResult?: string;
  failureResult?: string;
};

function formatRequirementType(type: string) {
  const normalized = type.trim().replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();

  if (lower.includes('non-functional')) {
    return '비기능 요구사항';
  }

  if (lower.includes('functional')) {
    return '기능 요구사항';
  }

  if (lower.includes('description')) {
    return '기능 요구사항';
  }

  return normalized || '요구사항';
}

function parseRequirementSpec(content?: string): RequirementItem[] {
  const text = content?.trim() ?? '';

  if (!text) {
    return [];
  }

  try {
    const parsed = JSON.parse(text) as unknown;
    const rawItems = Array.isArray(parsed)
      ? parsed
      : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as { items?: unknown }).items)
        ? (parsed as { items: unknown[] }).items
        : [];

    if (rawItems.length > 0) {
      return rawItems
        .map((item, index) => {
          const record = item as Record<string, unknown>;
          const description = String(record.description ?? record.name ?? record.title ?? '').trim();

          if (!description) return null;

          return {
            id: String(record.id ?? `R-${String(index + 1).padStart(3, '0')}`),
            type: formatRequirementType(String(record.type ?? '요구사항')),
            required: record.required === false || record.optionalFlag === true ? false : true,
            description,
            priority: String(record.priority ?? '').trim(),
            inputValue: String(record.inputValue ?? record.input ?? '').trim(),
            condition: String(record.condition ?? '').trim(),
            successResult: String(record.successResult ?? record.success ?? '').trim(),
            failureResult: String(record.failureResult ?? record.failure ?? '').trim(),
          } satisfies RequirementItem;
        })
        .filter(Boolean) as RequirementItem[];
    }
  } catch {
    // Keep supporting the legacy markdown-like requirement syntax below.
  }

  const items: RequirementItem[] = [];
  const pattern = /\[([^:\]]+)(?::(optional|required))?\]\s*([\s\S]*?)(?=\s*\[[^:\]]+(?::(?:optional|required))?\]\s*|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const description = match[3]?.replace(/\s+/g, ' ').trim();

    if (!description) {
      continue;
    }

    items.push({
      type: formatRequirementType(match[1] ?? ''),
      required: (match[2] ?? 'required').toLowerCase() !== 'optional',
      description,
    });
  }

  return items;
}

function RequirementDetail({
  label,
  value,
  isDarkMode,
}: {
  label: string;
  value?: string;
  isDarkMode: boolean;
}) {
  if (!value) return null;

  return (
    <div className={`rounded-md border px-3 py-2 ${isDarkMode ? 'border-[#334155] bg-[#111827]' : 'border-[#E2E8F0] bg-[#F8FAFC]'}`}>
      <dt className={`text-xs font-semibold ${isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'}`}>{label}</dt>
      <dd className={`mt-1 text-sm leading-relaxed ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#334155]'}`}>{value}</dd>
    </div>
  );
}

export function RequirementsSection({ isDarkMode = false, content }: RequirementsSectionProps) {
  const hasContent = Boolean(content?.trim());
  const requirements = parseRequirementSpec(content);

  return (
    <div className="space-y-6">
      <h2
        className={`text-2xl font-bold transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-[#1E293B]'
        }`}
      >
        요구사항
      </h2>

      <div
        className={`rounded-lg border p-6 transition-colors duration-300 ${
          isDarkMode
            ? 'border-[#334155] bg-[#1E293B] text-[#E2E8F0]'
            : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B]'
        }`}
      >
        {requirements.length > 0 ? (
          <div className="space-y-3">
            {requirements.map((requirement, index) => (
              <div
                key={`${requirement.type}-${index}`}
                className={`rounded-lg border px-4 py-4 ${
                  isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'
                }`}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {requirement.id ? (
                      <span className="text-sm font-bold text-[#7C3AED]">{requirement.id}</span>
                    ) : null}
                    <p className="mt-1 text-base font-bold leading-relaxed">{requirement.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      isDarkMode ? 'bg-violet-500/15 text-violet-200' : 'bg-violet-50 text-violet-700'
                    }`}
                  >
                    {requirement.priority || (requirement.required ? '필수' : '선택')}
                  </span>
                </div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {requirement.type}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      requirement.required
                        ? isDarkMode
                          ? 'bg-rose-500/15 text-rose-200'
                          : 'bg-rose-50 text-rose-700'
                        : isDarkMode
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {requirement.required ? '필수' : '선택'}
                  </span>
                </div>
                <dl className="grid gap-2 md:grid-cols-2">
                  <RequirementDetail label="입력값" value={requirement.inputValue} isDarkMode={isDarkMode} />
                  <RequirementDetail label="처리 조건" value={requirement.condition} isDarkMode={isDarkMode} />
                  <RequirementDetail label="성공 결과" value={requirement.successResult} isDarkMode={isDarkMode} />
                  <RequirementDetail label="실패 결과" value={requirement.failureResult} isDarkMode={isDarkMode} />
                </dl>
              </div>
            ))}
          </div>
        ) : hasContent ? (
          <MarkdownTextView content={content} isDarkMode={isDarkMode} />
        ) : (
          <div className={`text-center text-sm ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}
