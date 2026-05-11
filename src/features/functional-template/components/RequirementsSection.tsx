"use client";

import { MarkdownTextView } from './MarkdownTextView';

interface RequirementsSectionProps {
  isDarkMode?: boolean;
  content?: string;
}

type RequirementItem = {
  type: string;
  required: boolean;
  description: string;
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
                className={`rounded-lg border px-4 py-3 ${
                  isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[#7C3AED]">{requirement.type}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
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
                <p className="text-base leading-relaxed">{requirement.description}</p>
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
