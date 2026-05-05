'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface MemoPanelProps {
  isDarkMode: boolean;
  onClose: () => void;
}

export function MemoPanel({ isDarkMode, onClose }: MemoPanelProps) {
  const [memoContent, setMemoContent] = useState('// verifyToken 구현 메모\n\n// 1. token을 . 기준으로 분리\n// 2. HMAC으로 signature 비교\n// 3. exp 만료 시간 확인\n// 4. payload 반환');

  return (
    <div
      className={`fixed right-0 top-28 z-40 h-[calc(100vh-112px)] w-[320px] border-l shadow-xl transition-all duration-300 flex flex-col ${
        isDarkMode
          ? 'bg-[#0F172A] border-[#334155]'
          : 'bg-white border-[#E2E8F0]'
      }`}
    >
      {/* 헤더 */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-[#334155]' : 'border-[#E2E8F0]'
        }`}
      >
        <h3
          className={`text-[14px] font-semibold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-[#1E293B]'
          }`}
        >
          메모 작성
        </h3>
        <button
          onClick={onClose}
          className={`rounded-md p-1 transition-colors duration-300 ${
            isDarkMode
              ? 'text-[#94A3B8] hover:bg-[#334155]'
              : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 메모 입력 영역 */}
      <textarea
        value={memoContent}
        onChange={(e) => setMemoContent(e.target.value)}
        className={`flex-1 p-4 resize-none focus:outline-none transition-colors duration-300 text-[14px] leading-relaxed ${
          isDarkMode
            ? 'bg-[#0F172A] text-white placeholder-[#64748B]'
            : 'bg-white text-[#1E293B] placeholder-[#94A3B8]'
        }`}
        placeholder="메모를 입력하세요..."
      />

      {/* 하단 버튼 */}
      <div
        className={`flex items-center gap-2 border-t px-4 py-3 transition-colors duration-300 ${
          isDarkMode ? 'border-[#334155]' : 'border-[#E2E8F0]'
        }`}
      >
        <button
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-300 ${
            isDarkMode
              ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
              : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
          }`}
        >
          <Save className="w-4 h-4" />
          저장
        </button>
      </div>
    </div>
  );
}
