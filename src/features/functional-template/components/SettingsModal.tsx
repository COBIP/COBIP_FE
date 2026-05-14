'use client';

import { X, Moon, Sun } from 'lucide-react';

interface SettingsModalProps {
  isDarkMode: boolean;
  themeMode: 'light' | 'dark';
  onThemeModeChange: (mode: 'light' | 'dark') => void;
  isAiGuruHintMode: boolean;
  onAiGuruHintModeChange: (enabled: boolean) => void;
  onClose: () => void;
}

export function SettingsModal({
  isDarkMode,
  themeMode,
  onThemeModeChange,
  isAiGuruHintMode,
  onAiGuruHintModeChange,
  onClose,
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-md rounded-lg shadow-xl transition-colors duration-300 ${
          isDarkMode ? 'bg-[#1E293B]' : 'bg-white'
        }`}
      >
        {/* 헤더 */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b transition-colors duration-300 ${
            isDarkMode ? 'border-[#334155]' : 'border-[#E2E8F0]'
          }`}
        >
          <h2
            className={`text-lg font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-[#1E293B]'
            }`}
          >
            ⚙️ 설정
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors duration-300 ${
              isDarkMode
                ? 'text-[#94A3B8] hover:bg-[#334155]'
                : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="px-6 py-6 space-y-6">
          {/* 화면 모드 설정 */}
          <div>
            <h3
              className={`mb-3 text-[14px] font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-[#1E293B]'
              }`}
            >
              테마 설정
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onThemeModeChange('light')}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-[13px] font-medium transition-all duration-300 ${
                  themeMode === 'light'
                    ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                    : isDarkMode
                    ? 'bg-[#334155] text-[#94A3B8] border-[#334155] hover:bg-[#475569]'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                }`}
              >
                <Sun className="w-4 h-4" />
                라이트
              </button>

              <button
                onClick={() => onThemeModeChange('dark')}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-[13px] font-medium transition-all duration-300 ${
                  themeMode === 'dark'
                    ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                }`}
              >
                <Moon className="w-4 h-4" />
                다크
              </button>
            </div>
          </div>

          {/* AI 활성화 설정 */}
          <div
            className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-[#334155]' : 'bg-[#F8FAFC]'
            }`}
          >
            <div>
              <p
                className={`font-medium text-sm flex items-center gap-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-[#1E293B]'
                }`}
              >
                AI 가이드 활성화
              </p>
              <p
                className={`text-xs transition-colors duration-300 ${
                  isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                }`}
              >
                코드 리뷰 및 학습 피드백 AI 기능
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isAiGuruHintMode}
                onChange={(event) => onAiGuruHintModeChange(event.target.checked)}
              />
              <div className="w-10 h-6 bg-[#CBD5E1] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#7C3AED] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7C3AED]" />
            </label>
          </div>
        </div>

        {/* 푸터 */}
        <div
          className={`px-6 py-4 border-t transition-colors duration-300 ${
            isDarkMode ? 'border-[#334155]' : 'border-[#E2E8F0]'
          }`}
        >
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
              isDarkMode
                ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
            }`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
