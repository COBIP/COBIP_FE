'use client';

import { useState } from 'react';

import { MarkdownTextView } from './MarkdownTextView';

interface InterviewQuestion {
  question: string;
  answerHint?: string | null;
  answer_hint?: string | null;
}

interface InterviewSectionProps {
  isDarkMode?: boolean;
  questions?: Array<string | InterviewQuestion>;
}

export function InterviewSection({ isDarkMode = false, questions }: InterviewSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const visibleQuestions = questions && questions.length > 0
    ? questions
        .map((item) =>
          typeof item === 'string'
            ? { question: item.trim(), answerHint: '' }
            : {
                question: item.question.trim(),
                answerHint: (item.answerHint ?? item.answer_hint ?? '').trim(),
              },
        )
        .filter((item) => item.question.length > 0)
    : [];

  return (
    <div className="space-y-4">
      <h2 className={`text-[20px] font-semibold tracking-[-0.02em] transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-[#1E293B]'
      }`}>
        면접질문
      </h2>

      <div className="space-y-3">
        {visibleQuestions.length > 0 ? (
          visibleQuestions.map((item, idx) => (
            <div key={`${item.question}-${idx}`} className={`rounded-lg border transition-colors duration-300 ${
              isDarkMode
                ? 'bg-[#1E293B] border-[#334155]'
                : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-[13px] font-semibold text-[#7C3AED]">
                    Q{idx + 1}
                  </span>
                  <h3 className={`text-[14px] font-medium leading-relaxed ${
                    isDarkMode ? 'text-white' : 'text-[#1E293B]'
                  }`}>
                    {item.question}
                  </h3>
                </div>
                <span className={`text-[12px] ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                  {openIndex === idx ? '닫기' : '열기'}
                </span>
              </button>

              {openIndex === idx && (
                <div className={`border-t px-4 py-3 text-[14px] leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'border-[#334155] text-[#CBD5E1]' : 'border-[#E2E8F0] text-[#475569]'
                }`}>
                  {item.answerHint ? (
                    <div className="space-y-2">
                      <p className={`text-[12px] font-semibold ${
                        isDarkMode ? 'text-[#C4B5FD]' : 'text-[#6D28D9]'
                      }`}>
                        답변 힌트
                      </p>
                      <MarkdownTextView
                        content={item.answerHint}
                        isDarkMode={isDarkMode}
                        compact
                        className={isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}
                      />
                    </div>
                  ) : (
                    <p className={isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}>
                      답변 힌트가 없습니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={`rounded-lg border p-6 text-center text-sm ${isDarkMode ? 'border-[#334155] text-[#94A3B8]' : 'border-[#E2E8F0] text-[#64748B]'}`}>
            데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}
