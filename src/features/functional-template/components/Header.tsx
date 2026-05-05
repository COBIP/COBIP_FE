'use client';

import { Settings, Bookmark, Code2, SquarePen } from 'lucide-react';

interface HeaderProps {
  onSettingsClick: () => void;
  onMemoToggle: () => void;
  onEditorToggle: () => void;
  isMemoOpen: boolean;
  isEditorOpen: boolean;
  isDarkMode: boolean;
}

export function Header({
  onSettingsClick,
  onMemoToggle,
  onEditorToggle,
  isMemoOpen,
  isEditorOpen,
  isDarkMode,
}: HeaderProps) {
  return (
    <header
      className={`h-16 border-b transition-colors duration-300 flex items-center px-6 justify-between ${
        isDarkMode
          ? 'bg-[#1E293B] border-[#334155]'
          : 'bg-white border-[#F1F5F9]'
      }`}
    >
      {/* 좌측: 제목 */}
      <h1
        className={`font-bold text-lg transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-[#1E293B]'
        }`}
      >
        사용자 인증 시스템
      </h1>

      {/* 우측: 액션 버튼들 */}
      <div className="flex items-center gap-3">
        {/* 북마크 */}
        <button
          className={`p-2 rounded-lg transition-all duration-300 ${
            isDarkMode
              ? 'text-[#94A3B8] hover:bg-[#334155]'
              : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
          title="북마크"
        >
          <Bookmark className="w-5 h-5" />
        </button>

        {/* 메모 */}
        <button
          className={`p-2 rounded-lg transition-colors duration-300 ${
            isMemoOpen
              ? isDarkMode
                ? 'bg-[#7C3AED] text-white'
                : 'bg-[#7C3AED] text-white'
              : isDarkMode
              ? 'text-[#94A3B8] hover:bg-[#334155]'
              : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
          onClick={onMemoToggle}
          title="메모 (클릭 시 토글)"
        >
          <SquarePen className="w-5 h-5" />
        </button>

        {/* 코드 에디터 토글 */}
        <button
          onClick={onEditorToggle}
          className={`p-2 rounded-lg transition-all duration-300 ${
            isEditorOpen
              ? isDarkMode
                ? 'bg-[#7C3AED] text-white'
                : 'bg-purple-100 text-[#7C3AED]'
              : isDarkMode
              ? 'text-[#94A3B8] hover:bg-[#334155]'
              : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
          title="에디터"
        >
          <Code2 className="w-5 h-5" />
        </button>

        {/* 설정 */}
        <button
          onClick={onSettingsClick}
          className={`p-2 rounded-lg transition-colors duration-300 ${
            isDarkMode
              ? 'text-[#94A3B8] hover:bg-[#334155]'
              : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
          title="설정"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* 프로필 */}
        <div className={`w-8 h-8 rounded-full transition-colors duration-300 ${
          isDarkMode ? 'bg-[#334155]' : 'bg-[#E2E8F0]'
        }`} />
      </div>
    </header>
  );
}
