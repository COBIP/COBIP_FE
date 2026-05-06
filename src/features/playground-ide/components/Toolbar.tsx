'use client';

import { Download, Play } from 'lucide-react';
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
}

export function Toolbar({
  selectedLanguage,
  selectedTemplate,
  activeFile,
  onLanguageChange,
  onTemplateChange,
  onRun,
  onDownload,
}: ToolbarProps) {
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between shrink-0 flex-wrap gap-4">
      {/* 좌측: 선택 드롭다운 */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* 프로젝트 템플릿 선택 */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-400">Template:</label>
          <select
            value={selectedTemplate}
            onChange={(e) => onTemplateChange(e.target.value as ProjectTemplate)}
            className="px-3 py-1.5 bg-gray-700 text-gray-100 rounded text-sm border border-gray-600 hover:border-purple-500 transition cursor-pointer focus:outline-none focus:border-purple-500"
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
            <label className="text-xs font-medium text-gray-400">Language:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="px-3 py-1.5 bg-gray-700 text-gray-100 rounded text-sm border border-gray-600 hover:border-purple-500 transition cursor-pointer focus:outline-none focus:border-purple-500"
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
          <div className="text-xs text-gray-400">
            <span className="text-purple-400 font-medium">{activeFile.name}</span>
          </div>
        )}
      </div>

      {/* 우측: 액션 버튼 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition"
          title="코드 다운로드"
        >
          <Download size={16} />
          Download
        </button>
        <button
          onClick={onRun}
          className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition"
        >
          <Play size={16} />
          Run
        </button>
      </div>
    </div>
  );
}