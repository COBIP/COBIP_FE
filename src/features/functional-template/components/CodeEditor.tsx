'use client';

import { FileText, History, MessageCircle, Play, Save } from 'lucide-react';

interface CodeEditorProps {
  fileName?: string;
  code?: string;
  onCodeChange?: (value: string) => void;
  fileTabs?: string[];
  onFileSelect?: (fileName: string) => void;
  activeFile?: string;
  isDarkMode?: boolean;
  hasContent?: boolean;
  onRun?: () => void;
  isRunning?: boolean;
  runOutput?: string;
  showRunner?: boolean;
}

export function CodeEditor({
  fileName = 'main.java',
  code,
  onCodeChange,
  fileTabs = [],
  onFileSelect,
  activeFile,
  isDarkMode = false,
  hasContent = true,
  onRun,
  isRunning = false,
  runOutput,
  showRunner = true,
}: CodeEditorProps) {
  const editorCode = code ?? '';
  const canEdit = Boolean(onCodeChange);
  const lineNumbers = Array.from({ length: Math.max(editorCode.split('\n').length, 1) }, (_, index) => index + 1);
  const isEmpty = !hasContent || (!canEdit && editorCode.length === 0);

  return (
    <div className={`flex h-full min-w-0 flex-col overflow-hidden ${isDarkMode ? 'bg-[#0B1220]' : 'bg-white'}`}>
      <div className={`border-b px-3 py-2 ${isDarkMode ? 'border-[#334155] bg-[#111827]' : 'border-[#E2E8F0] bg-[#FAFBFF]'}`}>
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          {fileTabs.length > 0 ? (
            fileTabs.map((tab) => {
              const isActive = tab === (activeFile ?? fileName);
              const basename = String(tab).split(/[/\\]/).at(-1) ?? tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onFileSelect?.(tab)}
                  title={tab}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    isActive
                      ? isDarkMode
                        ? 'border-[#8B5CF6] bg-[#2D1B69] text-white'
                        : 'border-[#A78BFA] bg-white text-[#6D28D9] shadow-sm'
                      : isDarkMode
                        ? 'border-transparent text-[#94A3B8] hover:bg-[#334155]'
                        : 'border-transparent text-[#64748B] hover:bg-[#EEF2FF]'
                  }`}
                >
                  <FileText className={`h-4 w-4 ${isActive ? 'text-[#7C3AED]' : 'text-[#94A3B8]'}`} />
                  <span>{basename}</span>
                </button>
              );
            })
          ) : (
            <div className={`text-sm ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>파일이 없습니다.</div>
          )}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {isEmpty ? (
          <div className={`flex w-full items-center justify-center px-6 py-10 text-center text-sm ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            코드가 없습니다.
          </div>
        ) : (
          <>
            <div
              className={`select-none border-r px-3 py-4 font-mono text-[12px] ${
                isDarkMode ? 'border-[#334155] bg-[#111827] text-[#64748B]' : 'border-[#E2E8F0] bg-[#FAFBFF] text-[#94A3B8]'
              }`}
            >
              {lineNumbers.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>

            <textarea
              className={`min-w-0 flex-1 resize-none overflow-auto px-4 py-4 font-mono text-[14px] focus:outline-none ${
                isDarkMode ? 'bg-[#0B1220] text-white' : 'bg-white text-[#1E293B]'
              }`}
              wrap="off"
              style={{ lineHeight: '1.5', whiteSpace: 'pre', overflowX: 'auto' }}
              spellCheck="false"
              placeholder={canEdit ? '여기에 코드를 입력하세요.' : undefined}
              onChange={(event) => onCodeChange?.(event.target.value)}
              value={editorCode}
              readOnly={!canEdit}
            />
          </>
        )}
      </div>

      {showRunner && (
        <>
          <div className={`flex items-center justify-between border-t px-4 py-3 ${isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'}`}>
            <button
              type="button"
              onClick={onRun}
              disabled={isEmpty || isRunning || !onRun}
              className="inline-flex items-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#6D28D9] disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              {isRunning ? '실행 중' : '실행'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium ${
                  isDarkMode ? 'border-[#A78BFA] text-[#A78BFA] hover:bg-[#2D1B69]' : 'border-[#A855F7] text-[#7C3AED] hover:bg-purple-50'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                AI 코드리뷰
              </button>
              <button type="button" className={`rounded-lg p-2 ${isDarkMode ? 'text-[#94A3B8] hover:bg-[#334155]' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}>
                <Save className="h-4 w-4" />
              </button>
              <button type="button" className={`rounded-lg p-2 ${isDarkMode ? 'text-[#94A3B8] hover:bg-[#334155]' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}>
                <History className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={`flex h-32 shrink-0 flex-col border-t ${isDarkMode ? 'border-[#334155] bg-[#111827]' : 'border-[#E2E8F0] bg-[#FAFBFF]'}`}>
            <div className={`flex items-center gap-1 border-b px-4 py-2 text-[12px] font-semibold ${isDarkMode ? 'border-[#334155] text-[#94A3B8]' : 'border-[#E2E8F0] text-[#64748B]'}`}>
              <span>&lt;/&gt;</span>
              <span>실행 결과</span>
            </div>
            <div className={`flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] ${isDarkMode ? 'text-[#E2E8F0]' : 'text-[#1E293B]'}`}>
              {runOutput ? (
                <pre className="whitespace-pre-wrap">{runOutput}</pre>
              ) : (
                <div className={isDarkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}>실행 결과가 여기에 표시됩니다.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
