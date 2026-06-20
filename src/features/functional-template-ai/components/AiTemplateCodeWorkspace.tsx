'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { fetchAiCodeAnalyze, type AiFeatureTemplateCodeFile } from '@/api/services/AiService';
import { AiChatPanel, type ChatMessage } from '@/components/ai/AiChatPanel';
import { CodeEditor } from '@/features/functional-template/components/CodeEditor';
import { FileExplorer } from '@/features/functional-template/components/FileExplorer';

interface FileNode {
  name: string;
  path?: string;
  type: 'folder' | 'file';
  children?: FileNode[];
  expanded?: boolean;
}

interface AiTemplateCodeWorkspaceProps {
  codeFiles: AiFeatureTemplateCodeFile[];
  templateTitle: string;
  chatContext: string;
  onCodeFilesChange: (files: AiFeatureTemplateCodeFile[]) => void;
  onWorkspaceStateChange?: (state: { isOpen: boolean; width: number }) => void;
}

type ResizeMode = 'workspace' | 'explorer' | 'chat';

export const AI_TEMPLATE_CHAT_OPEN_EVENT = 'cobip:ai-template-chat-open';
export const AI_TEMPLATE_CODE_OPEN_EVENT = 'cobip:ai-template-code-open';

function getFileKey(file: Pick<AiFeatureTemplateCodeFile, 'fileName' | 'filePath'>) {
  return file.filePath ?? file.fileName;
}

function buildFileTree(files: AiFeatureTemplateCodeFile[]): FileNode[] {
  const root: FileNode[] = [];

  files.forEach((file) => {
    const path = getFileKey(file);
    const parts = path.split(/[\\/]/).filter(Boolean);
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const existing = current.find((node) => node.name === part && node.type === (isFile ? 'file' : 'folder'));

      if (existing?.children) {
        current = existing.children;
        return;
      }
      if (existing) return;

      const node: FileNode = isFile
        ? { name: part, path, type: 'file' }
        : { name: part, type: 'folder', expanded: true, children: [] };

      current.push(node);
      if (node.children) current = node.children;
    });
  });

  return root;
}

export function AiTemplateCodeWorkspace({
  codeFiles,
  templateTitle,
  chatContext,
  onCodeFilesChange,
  onWorkspaceStateChange,
}: AiTemplateCodeWorkspaceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeFile, setActiveFile] = useState(getFileKey(codeFiles[0] ?? { fileName: '' }));
  const [runOutput, setRunOutput] = useState('');
  const [isAnalyzingCode, setIsAnalyzingCode] = useState(false);
  const [workspaceWidth, setWorkspaceWidth] = useState(960);
  const [explorerWidth, setExplorerWidth] = useState(260);
  const [chatPanelWidth, setChatPanelWidth] = useState(416);
  const resizeModeRef = useRef<ResizeMode | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const fileTabs = useMemo(() => codeFiles.map(getFileKey), [codeFiles]);
  const fileTree = useMemo(() => buildFileTree(codeFiles), [codeFiles]);
  const currentFile = codeFiles.find((file) => getFileKey(file) === activeFile) ?? codeFiles[0];
  const resolvedActiveFile = currentFile ? getFileKey(currentFile) : '';

  useEffect(() => {
    onWorkspaceStateChange?.({ isOpen, width: workspaceWidth });
  }, [isOpen, onWorkspaceStateChange, workspaceWidth]);

  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(false);
      setIsChatOpen(true);
    };
    const handleOpenCode = (event: Event) => {
      const nextFile = event instanceof CustomEvent && typeof event.detail === 'string' ? event.detail : '';

      if (nextFile && codeFiles.some((file) => getFileKey(file) === nextFile)) {
        setActiveFile(nextFile);
      }
      setIsOpen(true);
    };

    window.addEventListener(AI_TEMPLATE_CHAT_OPEN_EVENT, handleOpenChat);
    window.addEventListener(AI_TEMPLATE_CODE_OPEN_EVENT, handleOpenCode);
    return () => {
      window.removeEventListener(AI_TEMPLATE_CHAT_OPEN_EVENT, handleOpenChat);
      window.removeEventListener(AI_TEMPLATE_CODE_OPEN_EVENT, handleOpenCode);
    };
  }, [codeFiles]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!resizeModeRef.current) return;
      const delta = startXRef.current - event.clientX;

      if (resizeModeRef.current === 'workspace') {
        setWorkspaceWidth(Math.min(Math.max(startWidthRef.current + delta, 720), window.innerWidth - 280));
      } else if (resizeModeRef.current === 'explorer') {
        setExplorerWidth(Math.min(Math.max(startWidthRef.current - delta, 200), 420));
      } else {
        setChatPanelWidth(Math.min(Math.max(startWidthRef.current + delta, 320), 720));
      }
    };
    const handleMouseUp = () => {
      resizeModeRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const beginResize = useCallback((event: React.MouseEvent, mode: ResizeMode, width: number) => {
    event.preventDefault();
    resizeModeRef.current = mode;
    startXRef.current = event.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleCodeChange = (value: string) => {
    if (!currentFile) return;
    onCodeFilesChange(codeFiles.map((file) => (
      getFileKey(file) === getFileKey(currentFile) ? { ...file, content: value } : file
    )));
  };

  const handleRun = async () => {
    if (!currentFile) return;

    try {
      setIsAnalyzingCode(true);
      setRunOutput('AI가 현재 파일을 분석하고 있습니다...');
      const result = await fetchAiCodeAnalyze({
        code: currentFile.content,
        language: currentFile.language || 'text',
        context: `${chatContext}\n\n현재 파일: ${getFileKey(currentFile)}\n역할: ${currentFile.role || '-'}`,
      });
      const sections = [
        `요약\n${result.summary}`,
        `설명\n${result.explanation}`,
        result.potentialIssues.length > 0
          ? `잠재 이슈\n${result.potentialIssues.map((issue) => `- ${issue}`).join('\n')}`
          : '잠재 이슈\n- 발견된 이슈가 없습니다.',
        result.improvementSuggestions.length > 0
          ? `개선 제안\n${result.improvementSuggestions.map((suggestion) => `- ${suggestion}`).join('\n')}`
          : '개선 제안\n- 추가 제안이 없습니다.',
      ];

      setRunOutput(sections.join('\n\n'));
    } catch (error) {
      setRunOutput(error instanceof Error ? error.message : 'AI 코드 분석에 실패했습니다.');
    } finally {
      setIsAnalyzingCode(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="코드 실행기 열기"
          title="코드 실행기 열기"
          className="fixed right-0 top-[14.25rem] z-30 flex h-12 w-8 items-center justify-center rounded-l-lg border-2 border-r-0 border-[#D8B4FE] bg-[#F3E8FF] text-[#7C3AED] shadow-md transition hover:bg-[#EDE9FE]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {isOpen && (
        <section
          style={{ width: `${workspaceWidth}px` }}
          className="fixed right-0 top-[14.25rem] bottom-14 z-40 flex min-w-[45rem] overflow-visible border-l border-[#CBD5E1] bg-white shadow-xl"
        >
          <div
            onMouseDown={(event) => beginResize(event, 'workspace', workspaceWidth)}
            className="absolute inset-y-0 left-0 z-40 w-1 -translate-x-1/2 cursor-col-resize bg-[#CBD5E1] transition-colors hover:bg-[#7C3AED]"
          >
            <button
              type="button"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => {
                setIsOpen(false);
                setIsChatOpen(false);
              }}
              aria-label="코드 실행기 닫기"
              title="코드 실행기 닫기"
              className="absolute left-1/2 top-8 z-50 flex h-12 w-8 -translate-x-1/2 items-center justify-center rounded-l-lg border-2 border-[#D8B4FE] bg-[#F3E8FF] text-[#7C3AED] shadow-md transition hover:bg-[#EDE9FE]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#E2E8F0] px-4">
              <Play className="h-5 w-5 text-[#7C3AED]" />
              <h2 className="text-sm font-bold text-[#1E293B]">코드 실행기</h2>
              <span className="truncate text-xs text-[#64748B]">{templateTitle}</span>
            </header>

            <div className="flex min-h-0 flex-1 overflow-hidden">
              <div style={{ width: `${explorerWidth}px` }} className="min-w-0 shrink-0 border-r border-[#E2E8F0]">
                <FileExplorer files={fileTree} activeFile={resolvedActiveFile} onFileSelect={setActiveFile} />
              </div>
              <div
                onMouseDown={(event) => beginResize(event, 'explorer', explorerWidth)}
                className="w-1 shrink-0 cursor-col-resize bg-[#E2E8F0] transition-colors hover:bg-[#7C3AED]"
              />
              <div className="min-w-0 flex-1 overflow-hidden">
                <CodeEditor
                  fileName={resolvedActiveFile}
                  code={currentFile?.content ?? ''}
                  onCodeChange={handleCodeChange}
                  fileTabs={fileTabs}
                  activeFile={resolvedActiveFile}
                  onFileSelect={setActiveFile}
                  hasContent={codeFiles.length > 0}
                  onRun={handleRun}
                  isRunning={isAnalyzingCode}
                  runLabel="코드 분석"
                  runningLabel="분석 중"
                  runOutput={runOutput}
                />
              </div>
            </div>
          </div>

          {isChatOpen && (
            <div className="relative h-full shrink-0" style={{ width: `${chatPanelWidth}px` }}>
              <div
                onMouseDown={(event) => beginResize(event, 'chat', chatPanelWidth)}
                className="absolute inset-y-0 left-0 z-30 w-1 cursor-col-resize bg-[#CBD5E1] transition-colors hover:bg-[#7C3AED]"
              />
              <AiChatPanel
                isOpen={isChatOpen}
                title="AI 채팅"
                context={`${chatContext}\n\n현재 파일: ${getFileKey(currentFile ?? { fileName: '' })}\n${currentFile?.content ?? ''}`}
                variant="sidecar"
                className="h-full"
                messages={chatMessages}
                onMessagesChange={setChatMessages}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          )}
        </section>
      )}

      {!isOpen && isChatOpen && (
        <AiChatPanel
          isOpen={isChatOpen}
          title="AI 채팅"
          context={chatContext}
          messages={chatMessages}
          onMessagesChange={setChatMessages}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
}
