import { useState, useCallback, useEffect, useRef } from 'react';
import { Menu, Bookmark, Bot, Settings, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { grammarTemplateService } from '@/api/services/GrammarTemplateService';
import type { GrammarTemplateDetail } from '@/features/grammar-template/Constants';
import { CodeRunner } from './CodeRunner';

interface GrammarDetailViewProps {
  templateId: number;
  onBack: () => void;
}

// ===== 탐색기 트리 타입 (CodeRunner와 공유) =====
export interface ExplorerFile { name: string; type: 'file'; }
export interface ExplorerFolder { name: string; type: 'folder'; isOpen: boolean; children: ExplorerNode[]; }
export type ExplorerNode = ExplorerFile | ExplorerFolder;

/** JSON 콘텐츠를 렌더링 */
function renderContentJson(json: Record<string, unknown> | null | undefined) {
  if (!json) return null;
  return (
    <div className="space-y-6">
      {Object.entries(json).map(([key, value]) => (
        <div key={key}>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{key}</h3>
          {typeof value === 'string' ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{value}</p>
          ) : (
            <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          )}
    </div>
      ))}
    </div>
  );
}

export function GrammarDetailView({ templateId, onBack }: GrammarDetailViewProps) {
    const [template, setTemplate] = useState<GrammarTemplateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [runnerWidth, setRunnerWidth] = useState(480);
  const [explorerWidth, setExplorerWidth] = useState(200);
  const [outputHeight, setOutputHeight] = useState(140);
    const [activeFilePath, setActiveFilePath] = useState('');
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [explorerTree, setExplorerTree] = useState<ExplorerNode[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  /** API에서 템플릿 상세 정보 불러오기 */
  useEffect(() => {
    let isCancelled = false;

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const result = await grammarTemplateService.getTemplateDetail(templateId);
        if (!isCancelled) {
          setTemplate(result);
        }
      } catch (err) {
        console.error('문법 템플릿 상세 조회 실패:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchDetail();

    return () => {
      isCancelled = true;
    };
  }, [templateId]);

  const resizingRef = useRef<'runner' | 'explorer' | 'output' | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(480);
  const startHeightRef = useRef(140);

  // ===== 탐색기 함수 (재귀) =====
  const toggleFolder = useCallback((targetPath: string) => {
    setExplorerTree((prev) => {
      const parts = targetPath.split('/').filter(Boolean);
      const updateRecursive = (nodes: ExplorerNode[], depth: number): ExplorerNode[] =>
        nodes.map((node) => {
          if (node.type === 'folder') {
            if (depth === parts.length - 1 && node.name === parts[depth]) {
              return { ...node, isOpen: !node.isOpen };
            }
            if (node.name === parts[depth]) {
              return { ...node, children: updateRecursive(node.children, depth + 1) };
            }
          }
          return node;
        });
      return updateRecursive(prev, 0);
    });
  }, []);

  const handleAddFile = useCallback((targetPath: string, fileName: string) => {
    setExplorerTree((prev) => {
      const parts = targetPath.split('/').filter(Boolean);
      const updateRecursive = (nodes: ExplorerNode[], depth: number): ExplorerNode[] =>
        nodes.map((node) => {
          if (node.type === 'folder') {
            if (depth === parts.length - 1 && node.name === parts[depth]) {
              return { ...node, isOpen: true, children: [...node.children, { name: fileName, type: 'file' as const }] };
            }
            if (node.name === parts[depth]) {
              return { ...node, children: updateRecursive(node.children, depth + 1) };
            }
          }
          return node;
        });
      return updateRecursive(prev, 0);
    });
    setFileContents((prev) => ({ ...prev, [`${targetPath}/${fileName}`]: '' }));
    setActiveFilePath(`${targetPath}/${fileName}`);
  }, []);

  const handleAddSubFolder = useCallback((targetPath: string, folderName: string) => {
    setExplorerTree((prev) => {
      const parts = targetPath.split('/').filter(Boolean);
      const updateRecursive = (nodes: ExplorerNode[], depth: number): ExplorerNode[] =>
        nodes.map((node) => {
          if (node.type === 'folder') {
            if (depth === parts.length - 1 && node.name === parts[depth]) {
              return { ...node, isOpen: true, children: [...node.children, { name: folderName, type: 'folder' as const, isOpen: false, children: [] } as ExplorerNode] };
            }
            if (node.name === parts[depth]) {
              return { ...node, children: updateRecursive(node.children, depth + 1) };
            }
          }
          return node;
        });
      return updateRecursive(prev, 0);
    });
  }, []);

  const handleAddRootFolder = useCallback((folderName: string) => {
    setExplorerTree((prev) => [...prev, { name: folderName, type: 'folder', isOpen: false, children: [] }]);
  }, []);

  const openFile = useCallback((filePath: string) => {
    setActiveFilePath(filePath);
  }, []);

  // ===== Resize 핸들러 =====
  const handleRunnerResizeStart = useCallback((e: React.MouseEvent) => {
    resizingRef.current = 'runner'; startXRef.current = e.clientX; startWidthRef.current = runnerWidth;
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
  }, [runnerWidth]);

  const handleExplorerResizeStart = useCallback((e: React.MouseEvent) => {
    resizingRef.current = 'explorer'; startXRef.current = e.clientX; startWidthRef.current = explorerWidth;
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
  }, [explorerWidth]);

  const handleOutputResizeStart = useCallback((e: React.MouseEvent) => {
    resizingRef.current = 'output'; startYRef.current = e.clientY; startHeightRef.current = outputHeight;
    document.body.style.cursor = 'row-resize'; document.body.style.userSelect = 'none';
  }, [outputHeight]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      if (resizingRef.current === 'runner') {
        setRunnerWidth(Math.min(Math.max(startWidthRef.current + (startXRef.current - e.clientX), 320), 800));
      } else if (resizingRef.current === 'explorer') {
        setExplorerWidth(Math.min(Math.max(startWidthRef.current + (e.clientX - startXRef.current), 100), 300));
      } else if (resizingRef.current === 'output') {
        setOutputHeight(Math.min(Math.max(startHeightRef.current + (startYRef.current - e.clientY), 60), 400));
      }
    };
    const handleMouseUp = () => {
      if (resizingRef.current) { resizingRef.current = null; document.body.style.cursor = ''; document.body.style.userSelect = ''; }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, []);

    // 로딩 중
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">템플릿을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 헤더바 */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer">
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
                    <div className="flex items-center gap-1.5 text-sm">
            <span className="text-purple-700 font-semibold">{template?.title || '문법 템플릿'}</span>
            {template?.category && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500">{template.category}</span>
              </>
            )}
            {template?.difficulty && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">
                  {template.difficulty === 'BEGINNER' ? '초급' : template.difficulty === 'INTERMEDIATE' ? '중급' : '고급'}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer group relative">
            <Bookmark className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer group relative">
            <Bot className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer group relative">
            <Settings className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
          </button>
          <div className="w-7 h-7 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">U</div>
          <button onClick={onBack} className="ml-2 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition cursor-pointer flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> 레슨완료
          </button>
        </div>
      </header>

      {/* 본문 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 사이드바 */}
        <aside className={`border-r border-gray-200 bg-gray-50 transition-all duration-300 shrink-0 overflow-y-auto ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
                    {isSidebarOpen && (
            <div className="p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                📖 {template?.title || '문법 템플릿'}
              </h3>
              {/* 챕터 목록 */}
              {template?.chapters && template.chapters.length > 0 && (
                <ul className="space-y-0.5 mb-4">
                  {template.chapters.map((chapter, i) => (
                    <li key={chapter.id}>
                      <button
                        onClick={() => setCurrentChapterIndex(i)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                          i === currentChapterIndex
                            ? 'bg-purple-100 text-purple-700 font-semibold'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <span className="truncate">{chapter.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>

        {/* 메인 콘텐츠 */}
        <div className="flex flex-1 overflow-hidden relative">
            {/* 실행기 토글 버튼 */}
            <button
              onClick={() => setIsRunnerOpen(!isRunnerOpen)}
              className={`absolute top-14 z-20 flex items-center justify-center bg-purple-50 px-2 py-3 text-purple-500 hover:text-purple-700 hover:bg-purple-100 shadow-sm cursor-pointer group ${isRunnerOpen ? 'border border-l-2 border-t-2 border-b-2 border-r-0 border-purple-200 hover:border-purple-300 rounded-l-lg' : 'right-0 border border-t-2 border-b-2 border-l-2 border-r-0 border-purple-200 hover:border-purple-300 rounded-l-lg'}`}
              style={isRunnerOpen ? { right: `${runnerWidth}px` } : undefined}
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-200 ${isRunnerOpen ? 'rotate-180' : ''}`} />
              <span className={`absolute whitespace-nowrap text-[11px] font-medium text-purple-600 bg-white px-2 py-1 rounded-md border border-purple-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm ${isRunnerOpen ? 'right-full mr-2 top-1/2 -translate-y-1/2' : 'right-full mr-1.5 top-1/2 -translate-y-1/2'}`}>
                {isRunnerOpen ? '실행기 닫기' : '실행기 열기'}
              </span>
            </button>

                    <main className="overflow-y-auto flex-1">
            <div className="max-w-4xl mx-auto px-8 py-10">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{template?.title}</h1>
              {template?.chapters && template.chapters.length > 0 && currentChapterIndex < template.chapters.length && (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">{template.chapters[currentChapterIndex].title}</h2>
                  {renderContentJson(template.chapters[currentChapterIndex].contentJson)}
                </>
              )}
              {(!template?.chapters || template.chapters.length === 0) && template?.summary && (
                <p className="text-gray-500 text-sm mb-8">{template.summary}</p>
              )}
              {(!template?.chapters || template.chapters.length === 0) && renderContentJson(template?.contentJson)}
            </div>
          </main>
          {/* 실행 환경 패널 */}
          {isRunnerOpen && (
            <CodeRunner
              runnerWidth={runnerWidth}
              explorerWidth={explorerWidth}
              outputHeight={outputHeight}
              explorerTree={explorerTree}
              activeFilePath={activeFilePath}
              fileContents={fileContents}
              onRunnerResizeStart={handleRunnerResizeStart}
              onExplorerResizeStart={handleExplorerResizeStart}
              onOutputResizeStart={handleOutputResizeStart}
              onToggleFolder={toggleFolder}
              onAddFile={handleAddFile}
              onAddSubFolder={handleAddSubFolder}
              onAddRootFolder={handleAddRootFolder}
              onOpenFile={openFile}
              setFileContents={setFileContents}
            />
          )}
        </div>
      </div>

            {/* 하단 고정바 */}
      <footer className="h-14 border-t border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 relative z-10">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {template?.chapters && currentChapterIndex > 0 && (
            <button
              onClick={() => setCurrentChapterIndex(currentChapterIndex - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span className="truncate">{template.chapters[currentChapterIndex - 1].title}</span>
            </button>
          )}
        </div>

        <div className="flex items-center shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>목록</span>
          </button>
        </div>

        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          {template?.chapters && currentChapterIndex < template.chapters.length - 1 && (
            <button
              onClick={() => setCurrentChapterIndex(currentChapterIndex + 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 transition cursor-pointer"
            >
              <span className="truncate">{template.chapters[currentChapterIndex + 1].title}</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

