"use client";

import { Code } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { TemplatePracticeFileApiResponse } from '@/api/services/FunctionalTemplateService';

interface SourceCodeSectionProps {
  isDarkMode?: boolean;
  files?: TemplatePracticeFileApiResponse[];
  onOpenEditor?: (filePath?: string) => void;
}

export function SourceCodeSection({ isDarkMode = false, files = [], onOpenEditor }: SourceCodeSectionProps) {
  const sortedFiles = useMemo(
    () => [...files].sort((left, right) => left.orderIndex - right.orderIndex || left.filePath.localeCompare(right.filePath)),
    [files],
  );
  const [activeFile, setActiveFile] = useState(sortedFiles[0]?.filePath ?? '');
  const resolvedActiveFile = sortedFiles.some((file) => file.filePath === activeFile)
    ? activeFile
    : sortedFiles[0]?.filePath ?? '';
  const currentFile = sortedFiles.find((file) => file.filePath === resolvedActiveFile);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Code className="text-[#7C3AED]" size={26} />
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>전체 코드</h2>
        </div>
        {currentFile && (
          <button
            type="button"
            onClick={() => onOpenEditor?.(currentFile.filePath)}
            className="rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
          >
            코드 실행기 열기
          </button>
        )}
      </div>

      {sortedFiles.length > 0 ? (
        <div
          className={`overflow-hidden rounded-lg border ${
            isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'
          }`}
        >
          <div className={`flex overflow-x-auto border-b ${isDarkMode ? 'border-[#334155] bg-[#1E293B]' : 'border-[#E2E8F0] bg-[#F8FAFC]'}`}>
            {sortedFiles.map((file) => (
              <button
                key={file.filePath}
                type="button"
                onClick={() => setActiveFile(file.filePath)}
                title={file.filePath}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  file.filePath === resolvedActiveFile
                    ? 'border-[#7C3AED] text-[#7C3AED]'
                    : isDarkMode
                      ? 'border-transparent text-[#94A3B8] hover:text-white'
                      : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                {file.filePath.split('/').pop()}
              </button>
            ))}
          </div>
          <pre className={`max-h-[34rem] overflow-auto p-5 text-sm leading-6 ${isDarkMode ? 'text-[#E2E8F0]' : 'text-[#1E293B]'}`}>
            <code className="font-mono whitespace-pre">{currentFile?.content ?? ''}</code>
          </pre>
        </div>
      ) : (
        <div className={`rounded-lg border px-6 py-10 text-center text-sm ${isDarkMode ? 'border-[#334155] text-[#94A3B8]' : 'border-[#E2E8F0] text-[#64748B]'}`}>
          등록된 코드 파일이 없습니다. 관리자 실습 관리에서 파일과 코드를 추가해주세요.
        </div>
      )}
    </div>
  );
}
