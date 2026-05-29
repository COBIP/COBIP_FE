"use client";

import { MarkdownTextView } from './MarkdownTextView';

interface DesignIntentSectionProps {
  isDarkMode?: boolean;
  content?: string;
  title?: string;
}

export function DesignIntentSection({ isDarkMode = false, content, title = '설계의도' }: DesignIntentSectionProps) {
  const hasContent = Boolean(content?.trim());

  return (
    <div className="space-y-4">
      <h2 className={`text-[20px] font-semibold tracking-[-0.02em] transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-[#1E293B]'
      }`}>
        {title}
      </h2>

      <div className={`rounded-lg border p-4 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#1E293B] border-[#334155]'
          : 'bg-[#F8FAFC] border-[#E2E8F0]'
      }`}>
        {hasContent ? (
          <div className={`space-y-3 text-[14px] leading-relaxed transition-colors duration-300 ${
            isDarkMode ? 'text-[#E2E8F0]' : 'text-[#1E293B]'
          }`}>
            <MarkdownTextView content={content} isDarkMode={isDarkMode} />
          </div>
        ) : (
          <div className={`flex min-h-32 items-center justify-center text-sm ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            데이터 없음
          </div>
        )}
        </div>
      </div>
  );
}
