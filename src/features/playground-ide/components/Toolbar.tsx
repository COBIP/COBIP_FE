'use client';

import { Download, Play, Moon, Sun } from 'lucide-react';
import { type Language, type ProjectTemplate, type File } from '@/app/types/Playground';
import { LANGUAGE_CONFIGS } from '@/data/Languages';
import { PROJECT_TEMPLATES } from '@/data/Templates';

interface ToolbarProps {
  selectedLanguage: Language;
  selectedTemplate: ProjectTemplate;
  activeFile: File | undefined;
  onLanguageChange: (lang: Language) => void;
  onTemplateChange: (template: ProjectTemplate) => void;
  onRun: () => void;
  onDownload: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Toolbar({
  selectedLanguage,
  selectedTemplate,
  activeFile,
  onLanguageChange,
  onTemplateChange,
  onRun,
  onDownload,
  isDarkMode,
  onToggleDarkMode,
}: ToolbarProps) {
  return (
    <div className={`border-b px-4 py-3 flex items-center justify-between shrink-0 flex-wrap gap-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* 좌측: 선택 드롭다운 */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* 프로젝트 템플릿 선택 */}
        <div className="flex items-center gap-2">
          <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Template:</label>
          <select
            value={selectedTemplate}
            onChange={(e) => onTemplateChange(e.target.value as ProjectTemplate)}
            className={`px-3 py-1.5 rounded text-sm border transition cursor-pointer focus:outline-none ${isDarkMode 
              ? 'bg-gray-700 text-gray-100 border-gray-600 hover:border-purple-500 focus:border-purple-500' 
              : 'bg-gray-100 text-gray-900 border-gray-300 hover:border-purple-400 focus:border-purple-400'}`}
          >
            {Object.entries(PROJECT_TEMPLATES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            ))}
          </select>
        </div>

        {/* 언어 선택 (템플릿이 없을 때만) */}
        {selectedTemplate === 'none' && (
          <div className="flex items-center gap-2">
            <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Language:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className={`px-3 py-1.5 rounded text-sm border transition cursor-pointer focus:outline-none ${isDarkMode 
                ? 'bg-gray-700 text-gray-100 border-gray-600 hover:border-purple-500 focus:border-purple-500' 
                : 'bg-gray-100 text-gray-900 border-gray-300 hover:border-purple-400 focus:border-purple-400'}`}
            >
              {Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 현재 파일명 표시 */}
        {activeFile && (
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className={`${isDarkMode ? 'text-purple-400' : 'text-purple-600'} font-medium`}>{activeFile.name}</span>
          </div>
        )}
      </div>

      {/* 우측: 액션 버튼 */}
      <div className="flex items-center gap-2">
        {/* 다크모드 토글 */}
        <button
          onClick={onToggleDarkMode}
          className={`p-1.5 rounded transition ${isDarkMode 
            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          title={isDarkMode ? '라이트 모드' : '다크 모드'}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={onDownload}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition ${isDarkMode 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          title="코드 다운로드"
        >
          <Download size={16} />
          Download
        </button>
        <button
          onClick={onRun}
          className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition ${isDarkMode 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-green-500 hover:bg-green-600 text-white'}`}
        >
          <Play size={16} />
          Run
        </button>
      </div>
    </div>
  );
}