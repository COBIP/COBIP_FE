"use client";

import { MarkdownTextView } from './MarkdownTextView';

interface StructureSectionProps {
  isDarkMode?: boolean;
  content?: string;
}

export function StructureSection({ isDarkMode = false, content }: StructureSectionProps) {
  const hasContent = Boolean(content?.trim());

  return (
    <div className="space-y-6">
      <h2
        className={`text-2xl font-bold transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-[#1E293B]'
        }`}
      >
        구조설명
      </h2>

      <div
        className={`rounded-lg border p-6 transition-colors duration-300 ${
          isDarkMode
            ? 'border-[#334155] bg-[#1E293B] text-[#E2E8F0]'
            : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B]'
        }`}
      >
        {hasContent ? (
          <MarkdownTextView content={content} isDarkMode={isDarkMode} />
        ) : (
          <div className={`flex min-h-32 items-center justify-center text-sm ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}
