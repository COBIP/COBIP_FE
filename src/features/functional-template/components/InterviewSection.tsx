'use client';

import { useState } from 'react';

interface InterviewSectionProps {
  isDarkMode?: boolean;
}

export function InterviewSection({ isDarkMode = false }: InterviewSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const questions = [
    {
      q: "세션 기반 인증과 토큰 기반 인증의 차이는?",
      a: "세션 기반은 서버에서 상태를 관리하여 메모리를 사용하지만, 토큰 기반은 클라이언트에서 상태를 유지하므로 서버 부하가 적고 확장성이 뛰어납니다."
    },
    {
      q: "JWT의 구조와 각 부분의 역할은?",
      a: "JWT는 Header(알고리즘), Payload(데이터), Signature(서명)의 3부분으로 구성됩니다. Header는 토큰 타입을, Payload는 클레임(사용자 정보)을, Signature는 토큰의 진위성을 보증합니다."
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className={`text-[20px] font-semibold tracking-[-0.02em] transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-[#1E293B]'
      }`}>
        면접질문
      </h2>

      <div className="space-y-3">
        {questions.map((item, idx) => (
          <div key={idx} className={`rounded-lg border transition-colors duration-300 ${
            isDarkMode
              ? 'bg-[#1E293B] border-[#334155]'
              : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors duration-300 ${
                isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className={`mt-px text-[13px] font-semibold shrink-0 ${
                  isDarkMode ? 'text-[#7C3AED]' : 'text-[#7C3AED]'
                }`}>
                  Q{idx + 1}
                </span>
                <h3 className={`text-[14px] font-medium leading-relaxed ${
                  isDarkMode ? 'text-white' : 'text-[#1E293B]'
                }`}>
                  {item.q}
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
                <span className="font-semibold text-[#7C3AED]">모범 답안.</span> {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}