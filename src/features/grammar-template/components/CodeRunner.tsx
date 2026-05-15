import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { grammarTemplateService } from '@/api/services/GrammarTemplateService';
import type { ExplorerNode, ExplorerFolder } from './GrammarDetailView';
import type { ExecutionFlowStep } from '@/features/grammar-template/Constants';
import { ExecutionFlowPanel } from './ExecutionFlowPanel';

const CODE_EDITOR_LINE_HEIGHT = 24;

function formatCodeLine(line: string) {
  return line.trim().replace(/;$/, '').trim().replace(/\s+/g, ' ');
}

function checkNonExecutableLine(line: string) {
  const trimmed = line.trim();

  return (
    !trimmed ||
    trimmed === '{' ||
    trimmed === '}' ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('*/')
  );
}

function findClosestExecutableLine(codeLines: string[], lineNumber: number) {
  if (!codeLines.length) return lineNumber;

  const targetIndex = Math.min(Math.max(lineNumber - 1, 0), codeLines.length - 1);

  for (let offset = 0; offset < codeLines.length; offset += 1) {
    const nextIndex = targetIndex + offset;
    if (nextIndex < codeLines.length && !checkNonExecutableLine(codeLines[nextIndex])) {
      return nextIndex + 1;
    }

    const previousIndex = targetIndex - offset;
    if (offset > 0 && previousIndex >= 0 && !checkNonExecutableLine(codeLines[previousIndex])) {
      return previousIndex + 1;
    }
  }

  return lineNumber;
}

function findMatchingSourceLine(codeLines: string[], sourceLine: string, lineNumber: number) {
  const normalizedSource = formatCodeLine(sourceLine);
  if (!normalizedSource) return null;

  const matches = codeLines
    .map((line, index) => ({ line, lineNumber: index + 1 }))
    .filter(({ line }) => !checkNonExecutableLine(line) && formatCodeLine(line) === normalizedSource);

  if (!matches.length) return null;

  return matches.sort(
    (left, right) => Math.abs(left.lineNumber - lineNumber) - Math.abs(right.lineNumber - lineNumber),
  )[0].lineNumber;
}

function getExecutableLineNumber(step: ExecutionFlowStep, codeLines: string[]) {
  const lineNumber = Math.min(Math.max(step.lineNumber, 1), Math.max(codeLines.length, 1));
  const matchedLine = findMatchingSourceLine(codeLines, step.sourceLine, lineNumber);

  if (matchedLine) return matchedLine;
  if (!checkNonExecutableLine(codeLines[lineNumber - 1] ?? '')) return lineNumber;

  return findClosestExecutableLine(codeLines, lineNumber);
}

function buildExecutionFlowStepsWithExecutableLines(steps: ExecutionFlowStep[], sourceCode: string) {
  const codeLines = sourceCode.split('\n');

  return steps.map((step) => {
    const originalLineNumber = step.lineNumber;
    const lineNumber = getExecutableLineNumber(step, codeLines);
    const resolvedSourceLine = codeLines[lineNumber - 1] ?? step.sourceLine;
    const sourceLine = checkNonExecutableLine(step.sourceLine) ? resolvedSourceLine : step.sourceLine;
    const normalizeSnapshotLine = <T extends { lineNumber: number; stepOrder: number } | null | undefined>(
      snapshot: T,
    ): T => {
      if (!snapshot) return snapshot;

      if (snapshot.stepOrder === step.stepOrder || snapshot.lineNumber === originalLineNumber) {
        return { ...snapshot, lineNumber } as T;
      }

      return snapshot;
    };

    return {
      ...step,
      lineNumber,
      sourceLine,
      activeVariable: normalizeSnapshotLine(step.activeVariable),
      activeOutput: normalizeSnapshotLine(step.activeOutput),
      variables: step.variables?.map(normalizeSnapshotLine),
      outputs: step.outputs?.map(normalizeSnapshotLine),
    };
  });
}

function formatRunResponseText(result: { output?: string; stdout?: string | null; compileOutput?: string | null; stderr?: string | null; message?: string | null; status?: string }) {
  const text = [result.output, result.stdout, result.compileOutput, result.stderr, result.message]
    .filter((value): value is string => Boolean(value?.trim()))
    .join('\n');

  if (text) return text;
  if (result.status && result.status !== 'ACCEPTED') return `// 실행 결과: ${result.status}`;
  return '// 실행 완료 (출력 없음)';
}

function formatErrorText(err: unknown) {
  if (err && typeof err === 'object') {
    const axiosErr = err as { response?: { data?: { message?: string }; status?: number }; message?: string };
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }
  return '알 수 없는 오류';
}

// ===== 탐색기 노드 컴포넌트 (재귀) =====
function ExplorerFolderNode({
  node,
  activeFilePath,
  onOpenFile,
  onToggleFolder,
  onAddFile,
  onAddSubFolder,
  path,
}: {
  node: ExplorerFolder;
  activeFilePath: string;
  onOpenFile: (filePath: string) => void;
  onToggleFolder: (name: string) => void;
  onAddFile: (folderName: string, fileName: string) => void;
  onAddSubFolder: (parentFolder: string, folderName: string) => void;
  path: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputMode, setInputMode] = useState<'file' | 'folder' | null>(null);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isMenuOpen) setIsMenuOpen(false);
        if (inputMode) {
          setInputMode(null);
          setInputValue('');
        }
      }
    };
    if (isMenuOpen || inputMode) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, inputMode]);
  const handleConfirm = useCallback(() => {
    const val = inputValue.trim();
    if (!val) { setInputMode(null); return; }
    if (inputMode === 'file') {
      onAddFile(path, val);
    } else if (inputMode === 'folder') {
      onAddSubFolder(path, val);
    }
    setInputMode(null);
    setInputValue('');
  }, [inputValue, inputMode, path, onAddFile, onAddSubFolder]);

  const handleCancel = useCallback(() => {
    setInputMode(null);
    setInputValue('');
  }, []);

  const handleAddClick = useCallback((mode: 'file' | 'folder') => {
    setIsMenuOpen(false);
    // 폴더가 접혀있으면 먼저 펼친 후 입력 모드 진입
    if (!node.isOpen) {
      onToggleFolder(path);
    }
    setInputMode(mode);
    setInputValue('');
  }, [node.isOpen, path, onToggleFolder]);

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-100 rounded-md px-2 py-1">
        <div className="flex items-center gap-1.5 flex-1 min-w-0" onClick={() => onToggleFolder(path)}>
          <span className="text-[10px] text-gray-500 transition-transform duration-150">
            {node.isOpen ? '▼' : '▶'}
          </span>
          <span className="text-xs">📁</span>
          <span className="text-xs text-gray-700 font-medium truncate">{node.name}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen((prev) => !prev); }}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-purple-600 text-xs px-1 rounded hover:bg-purple-50 transition cursor-pointer"
          >+</button>
          {isMenuOpen && (
            <div className="absolute right-0 top-5 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]">
              <button
                onClick={(e) => { e.stopPropagation(); handleAddClick('file'); }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
              >📄 새 파일</button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAddClick('folder'); }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
              >📁 새 폴더</button>
            </div>
          )}
        </div>
      </div>
      {(node.isOpen || inputMode) && (
        <div className="ml-4 space-y-0.5 mt-0.5">
          {node.children.map((child) =>
            child.type === 'folder' ? (
              <ExplorerFolderNode
                key={child.name}
                node={child as ExplorerFolder}
                activeFilePath={activeFilePath}
                onOpenFile={onOpenFile}
                onToggleFolder={onToggleFolder}
                onAddFile={onAddFile}
                onAddSubFolder={onAddSubFolder}
                path={`${path}/${child.name}`}
              />
            ) : (
              <div key={child.name} onClick={() => onOpenFile(`${path}/${child.name}`)} className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs cursor-pointer transition ${`${path}/${child.name}` === activeFilePath ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                <span className="text-[10px]">📄</span>
                <span>{child.name}</span>
              </div>
            )
          )}
          {inputMode && (
            <div className="flex items-center gap-1 px-2 py-1">
              <span className={inputMode === 'file' ? 'text-[10px]' : 'text-xs'}>{inputMode === 'file' ? '📄' : '📁'}</span>
              <input
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') handleCancel(); }}
                onBlur={handleConfirm}
                className="flex-1 text-xs bg-white border border-purple-300 rounded px-1.5 py-0.5 outline-none text-gray-700"
                placeholder={inputMode === 'file' ? '파일명.py' : '폴더명'}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== Props =====
interface CodeRunnerProps {
  templateId: number;
  chapterId?: number;
  language?: string;
  runnerWidth: number;
  explorerWidth: number;
  outputHeight: number;
  explorerTree: ExplorerNode[];
  activeFilePath: string;
  fileContents: Record<string, string>;
  onRunnerResizeStart: (e: React.MouseEvent) => void;
  onExplorerResizeStart: (e: React.MouseEvent) => void;
  onOutputResizeStart: (e: React.MouseEvent) => void;
  onToggleFolder: (name: string) => void;
  onAddFile: (folderName: string, fileName: string) => void;
  onAddSubFolder: (parentFolder: string, folderName: string) => void;
  onAddRootFolder: (folderName: string) => void;
  onOpenFile: (filePath: string) => void;
  setFileContents: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

// ===== Code Runner 메인 컴포넌트 =====
export function CodeRunner({
  templateId,
  chapterId,
  language,
  runnerWidth,
  explorerWidth,
  outputHeight,
  explorerTree,
  activeFilePath,
  fileContents,
  onRunnerResizeStart,
  onExplorerResizeStart,
  onOutputResizeStart,
  onToggleFolder,
  onAddFile,
  onAddSubFolder,
  onAddRootFolder,
  onOpenFile,
  setFileContents,
}: CodeRunnerProps) {
    const [isRootInputOpen, setIsRootInputOpen] = useState(false);
    const [rootInputValue, setRootInputValue] = useState('');
        const [executionSteps, setExecutionSteps] = useState<ExecutionFlowStep[] | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isFlowLoading, setIsFlowLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [outputText, setOutputText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [editorScrollTop, setEditorScrollTop] = useState(0);
    const activeExecutionLine = executionSteps?.[currentStepIndex]?.lineNumber;
    const activeCode = fileContents[activeFilePath] || '';
    const codeLines = activeCode.split('\n');

    /** 코드 실행 */
    const handleRun = useCallback(async () => {
      if (!activeFilePath || !fileContents[activeFilePath]) {
        setOutputText('// 실행할 코드를 입력해주세요.');
        setErrorMessage('');
        return;
      }
      if (!chapterId || !templateId || isRunning) return;
      setIsRunning(true);
      setOutputText('// 실행 중...');
      setErrorMessage('');
      setExecutionSteps(null);

                  try {
        const result = await grammarTemplateService.runCode(templateId, chapterId, {
          sourceCode: fileContents[activeFilePath],
          language: language ?? 'PYTHON',
        });
        setOutputText(formatRunResponseText(result));
      } catch (err) {
        setOutputText('');
        setErrorMessage(`// 실행 실패: ${formatErrorText(err)}`);
      } finally {
        setIsRunning(false);
      }
    }, [templateId, chapterId, activeFilePath, fileContents, language, isRunning]);

    /** 실행흐름 조회 */
    const handleExecutionFlow = useCallback(async () => {
      if (!activeFilePath || !fileContents[activeFilePath]) {
        setErrorMessage('// 실행흐름을 볼 코드를 입력해주세요.');
        setExecutionSteps(null);
        return;
      }
      if (!chapterId || !templateId || isFlowLoading) return;
      setIsFlowLoading(true);
      setErrorMessage('');
      setExecutionSteps(null);
      setCurrentStepIndex(0);

      try {
        const result = await grammarTemplateService.getExecutionFlow(templateId, chapterId, {
          sourceCode: fileContents[activeFilePath],
          language: language ?? 'PYTHON',
        });
        setExecutionSteps(buildExecutionFlowStepsWithExecutableLines(result.steps, fileContents[activeFilePath]));
      } catch (err) {
        setErrorMessage(`// 실행흐름 조회 실패: ${formatErrorText(err)}`);
      } finally {
        setIsFlowLoading(false);
      }
    }, [templateId, chapterId, activeFilePath, fileContents, language, isFlowLoading]);

  const handleRootConfirm = useCallback(() => {
    const val = rootInputValue.trim();
    if (!val) { setIsRootInputOpen(false); return; }
    onAddRootFolder(val);
    setIsRootInputOpen(false);
    setRootInputValue('');
  }, [rootInputValue, onAddRootFolder]);

  if (executionSteps) {
    return (
      <aside className="border-l border-gray-200 bg-white overflow-hidden shrink-0 relative" style={{ width: `${runnerWidth}px` }}>
        <div className="absolute -left-1 top-0 bottom-0 w-3 z-50 cursor-col-resize flex items-center justify-center group" onMouseDown={onRunnerResizeStart}>
          <div className="w-0.5 h-8 bg-gray-300 rounded-full group-hover:bg-purple-400 transition-colors" />
        </div>

        <div className="flex h-full min-w-0" style={{ width: `${runnerWidth}px` }}>
          <section className="min-w-0 flex-[1.45] overflow-hidden border-r border-gray-200 bg-slate-50">
            <ExecutionFlowPanel
              steps={executionSteps}
              currentStepIndex={currentStepIndex}
              onStepClick={setCurrentStepIndex}
              onClose={() => {
                setExecutionSteps(null);
                setCurrentStepIndex(0);
              }}
            />
          </section>

          <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-gray-50">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">코드 하이라이트</p>
                <p className="truncate text-[11px] text-gray-500">{activeFilePath}</p>
              </div>
              <span className="rounded-md bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700">
                line {activeExecutionLine}
              </span>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-4 py-1.5 shrink-0">
              <div className="flex items-center gap-1.5 rounded-t border border-b-0 border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-700">
                <span className="text-[10px]">📄</span>
                {activeFilePath.split('/').pop()}
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden bg-gray-50">
              {activeExecutionLine && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden px-4 py-4 font-mono text-sm"
                  style={{ lineHeight: `${CODE_EDITOR_LINE_HEIGHT}px` }}
                >
                  <div style={{ transform: `translateY(-${editorScrollTop}px)` }}>
                    {codeLines.map((_, index) => (
                      <div
                        key={index}
                        className={index + 1 === activeExecutionLine ? 'rounded bg-purple-100/80 ring-1 ring-purple-200' : ''}
                        style={{ height: `${CODE_EDITOR_LINE_HEIGHT}px` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <textarea
                className="relative z-10 h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-gray-800 outline-none"
                style={{ lineHeight: `${CODE_EDITOR_LINE_HEIGHT}px` }}
                value={activeCode}
                onChange={(e) => setFileContents((prev) => ({ ...prev, [activeFilePath]: e.target.value }))}
                onScroll={(e) => setEditorScrollTop(e.currentTarget.scrollTop)}
                placeholder="# 여기에 코드를 입력하세요"
              />
            </div>
          </section>
        </div>
      </aside>
    );
  }

  return (
    <aside className="border-l border-gray-200 bg-gray-50 overflow-hidden shrink-0 relative" style={{ width: `${runnerWidth}px` }}>
      {/* 리사이즈 핸들 */}
      <div className="absolute -left-1 top-0 bottom-0 w-3 z-30 cursor-col-resize flex items-center justify-center group" onMouseDown={onRunnerResizeStart}>
        <div className="w-0.5 h-8 bg-gray-300 rounded-full group-hover:bg-purple-400 transition-colors" />
      </div>

      <div className="h-full flex flex-col" style={{ width: `${runnerWidth}px` }}>
        {/* 실행 환경 헤더 */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-800">코드 실행기</span>
          </div>
        </div>

                {/* 본문: 실행흐름 패널 + 파일트리 + 코드 영역 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 왼쪽: 파일 탐색기 */}
          <div className="flex flex-col shrink-0 overflow-hidden" style={{ width: `${explorerWidth}px` }}>
            <div className="px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-100/50 shrink-0">탐색기</div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {explorerTree.map((node) =>
                node.type === 'folder' ? (
                  <ExplorerFolderNode
                    key={node.name}
                    node={node as ExplorerFolder}
                    activeFilePath={activeFilePath}
                    onOpenFile={onOpenFile}
                    onToggleFolder={onToggleFolder}
                    onAddFile={onAddFile}
                    onAddSubFolder={onAddSubFolder}
                    path={node.name}
                  />
                ) : (
                  <div key={node.name} onClick={() => onOpenFile(node.name)} className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs cursor-pointer transition ${node.name === activeFilePath ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <span className="text-[10px]">📄</span>
                    <span>{node.name}</span>
                  </div>
                )
              )}
              {isRootInputOpen ? (
                <div className="flex items-center gap-1.5 px-2 py-1 mt-1">
                  <span className="text-xs">📁</span>
                  <input autoFocus value={rootInputValue} onChange={(e) => setRootInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRootConfirm(); if (e.key === 'Escape') { setIsRootInputOpen(false); setRootInputValue(''); } }} onBlur={handleRootConfirm} className="flex-1 text-xs bg-white border border-purple-300 rounded px-1.5 py-0.5 outline-none text-gray-700" placeholder="폴더명" />
                </div>
              ) : (
                <button onClick={() => { setIsRootInputOpen(true); setRootInputValue(''); }} className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-purple-600 hover:bg-gray-100 rounded-md transition cursor-pointer mt-1">
                  <span>+</span><span>폴더 추가</span>
                </button>
              )}
            </div>
          </div>

          {/* 리사이즈 핸들 (파일트리 ↔ 코드) */}
          <div className="w-0.5 cursor-col-resize shrink-0 relative group" onMouseDown={onExplorerResizeStart}>
            <div className="absolute inset-0 -left-1 -right-1" />
            <div className="w-full h-full bg-gray-200 group-hover:bg-purple-400 transition-colors" />
          </div>

          {/* 오른쪽: 코드 편집 + 실행 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 파일 타이틀 바 */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-t border border-gray-200 border-b-0 text-xs text-gray-700 font-medium">
                <span className="text-[10px]">🐍</span>
                {activeFilePath.split('/').pop()}
                <button className="ml-1 text-gray-400 hover:text-gray-600 text-[10px] leading-none">✕</button>
              </div>
            </div>

            {/* 코드 에디터 */}
            <div className="relative flex-1 bg-gray-50 overflow-hidden">
              {activeExecutionLine && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden px-4 py-4 font-mono text-sm"
                  style={{ lineHeight: `${CODE_EDITOR_LINE_HEIGHT}px` }}
                >
                  <div style={{ transform: `translateY(-${editorScrollTop}px)` }}>
                    {codeLines.map((_, index) => (
                      <div
                        key={index}
                        className={index + 1 === activeExecutionLine ? 'rounded bg-purple-100/80 ring-1 ring-purple-200' : ''}
                        style={{ height: `${CODE_EDITOR_LINE_HEIGHT}px` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <textarea
                className="relative z-10 w-full h-full bg-transparent text-gray-800 p-4 text-sm font-mono resize-none outline-none"
                style={{ lineHeight: `${CODE_EDITOR_LINE_HEIGHT}px` }}
                value={activeCode}
                onChange={(e) => setFileContents((prev) => ({ ...prev, [activeFilePath]: e.target.value }))}
                onScroll={(e) => setEditorScrollTop(e.currentTarget.scrollTop)}
                placeholder="# 여기에 코드를 입력하세요"
              />
            </div>

            {/* 가로 리사이즈 핸들 */}
            <div className="h-0.5 cursor-row-resize shrink-0 relative group" onMouseDown={onOutputResizeStart}>
              <div className="absolute inset-0 -top-1 -bottom-1" />
              <div className="w-full h-full bg-gray-200 group-hover:bg-purple-500 transition-colors" />
            </div>

                        {/* 하단 도구 모음 */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-white shrink-0">
                                                    <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-[11px] font-medium rounded-md hover:bg-purple-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRunning ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3 fill-white" />
                            )}
                            실행
                          </button>
                          <button
                            onClick={handleExecutionFlow}
                            disabled={isFlowLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 text-[11px] font-medium rounded-md border border-gray-200 hover:bg-gray-50 hover:border-purple-200 hover:text-purple-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isFlowLoading ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <span>▶</span>
                            )}
                            실행흐름
                          </button>
                          <div className="flex-1" />
                          <span className="text-[10px] text-gray-400">{'// 실행 결과'}</span>
                        </div>

                        {/* 출력 영역 */}
                        <div className="border-t border-gray-200 bg-gray-50 overflow-y-auto shrink-0" style={{ height: `${outputHeight}px` }}>
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 border-b border-gray-200 sticky top-0">
                            <span className="text-[10px] text-gray-500 font-medium">출력</span>
                          </div>
                                                    <div className="p-3">
                            {errorMessage ? (
                              <pre className="text-xs text-red-500 font-mono whitespace-pre-wrap">{errorMessage}</pre>
                            ) : outputText ? (
                              <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">{outputText}</pre>
                            ) : (
                              <p className="text-xs text-gray-400 font-mono">{'// 실행 결과가 여기에 표시됩니다'}</p>
                            )}
                          </div>
                        </div>
          </div>
        </div>
      </div>
    </aside>
  );
}


