'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bot, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { AiFeatureTemplateCodeFile } from '@/api/services/AiService';
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
}

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
}: AiTemplateCodeWorkspaceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeFile, setActiveFile] = useState(getFileKey(codeFiles[0] ?? { fileName: '' }));
  const [runOutput, setRunOutput] = useState('');

  const fileTabs = useMemo(() => codeFiles.map(getFileKey), [codeFiles]);
  const fileTree = useMemo(() => buildFileTree(codeFiles), [codeFiles]);
  const currentFile = codeFiles.find((file) => getFileKey(file) === activeFile) ?? codeFiles[0];
  const resolvedActiveFile = currentFile ? getFileKey(currentFile) : '';

  useEffect(() => {
    const handleOpenChat = () => setIsChatOpen(true);
    const handleOpenCode = (event: Event) => {
      const nextFile = event instanceof CustomEvent && typeof event.detail === 'string'
        ? event.detail
        : '';

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

  const handleCodeChange = (value: string) => {
    if (!currentFile) return;

    onCodeFilesChange(
      codeFiles.map((file) => getFileKey(file) === getFileKey(currentFile) ? { ...file, content: value } : file),
    );
  };

  const handleRun = () => {
    setRunOutput(
      'AI 생성 템플릿은 아직 실행용 백엔드 리소스와 연결되지 않았습니다.\n' +
      '코드 편집과 AI 질문은 사용할 수 있으며, 실제 실행은 AI 템플릿 저장·실행 API 연결 후 지원됩니다.',
    );
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed right-0 top-40 z-30 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="mr-3 inline-flex h-10 items-center gap-2 rounded-lg border border-[#DDD6FE] bg-white px-3 text-sm font-semibold text-[#7C3AED] shadow-sm transition hover:bg-[#F5F3FF]"
          >
            <Bot className="h-4 w-4" />
            AI 챗봇
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="코드 실행기 열기"
            title="코드 실행기 열기"
            className="flex h-12 w-8 items-center justify-center rounded-l-lg border-2 border-r-0 border-[#D8B4FE] bg-[#F3E8FF] text-[#7C3AED] shadow-md transition hover:bg-[#EDE9FE]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      {isOpen && (
        <section className="fixed inset-y-0 right-0 z-40 flex w-[72vw] min-w-[48rem] overflow-hidden border-l border-[#CBD5E1] bg-white shadow-2xl">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsChatOpen(false);
            }}
            aria-label="코드 실행기 닫기"
            title="코드 실행기 닫기"
            className="absolute left-0 top-8 z-50 flex h-12 w-8 -translate-x-full items-center justify-center rounded-l-lg border-2 border-r-0 border-[#D8B4FE] bg-[#F3E8FF] text-[#7C3AED] shadow-md transition hover:bg-[#EDE9FE]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#E2E8F0] px-4">
              <Play className="h-5 w-5 text-[#7C3AED]" />
              <h2 className="text-sm font-bold text-[#1E293B]">코드 실행기</h2>
              <span className="truncate text-xs text-[#64748B]">{templateTitle}</span>
            </header>

            <div className="flex min-h-0 flex-1">
              <div className="w-60 shrink-0 border-r border-[#E2E8F0]">
                <FileExplorer files={fileTree} activeFile={resolvedActiveFile} onFileSelect={setActiveFile} />
              </div>
              <div className="min-w-0 flex-1">
                <CodeEditor
                  fileName={resolvedActiveFile}
                  code={currentFile?.content ?? ''}
                  onCodeChange={handleCodeChange}
                  fileTabs={fileTabs}
                  activeFile={resolvedActiveFile}
                  onFileSelect={setActiveFile}
                  hasContent={codeFiles.length > 0}
                  onRun={handleRun}
                  onAiChatOpen={() => setIsChatOpen(true)}
                  runOutput={runOutput}
                />
              </div>
            </div>
          </div>

          {isChatOpen && (
            <div className="h-full w-[24rem] shrink-0">
              <AiChatPanel
                isOpen={isChatOpen}
                title="AI 학습 도우미"
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
          title="AI 학습 도우미"
          context={chatContext}
          messages={chatMessages}
          onMessagesChange={setChatMessages}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
}
