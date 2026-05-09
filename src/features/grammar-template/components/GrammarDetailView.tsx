import { useState, useCallback, useEffect, useRef } from 'react';
import { Menu, Bookmark, Bot, Settings, ChevronLeft, ChevronRight, Check, Play } from 'lucide-react';
import { PYTHON_LESSONS } from '@/features/grammar-template/Constants';

interface GrammarDetailViewProps {
  onBack: () => void;
}

/** 볼드 처리 (**텍스트**) */
function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-gray-900 font-semibold">{part.slice(2, -2)}</strong>;
    }
    // 인라인 코드 (`code`)
    const codeParts = part.split(/(`[^`]+`)/g);
    return codeParts.map((cp, j) => {
      if (cp.startsWith('`') && cp.endsWith('`')) {
        return <code key={`${i}-${j}`} className="text-purple-600 bg-purple-50 px-1 rounded text-sm font-mono">{cp.slice(1, -1)}</code>;
      }
      return <span key={`${i}-${j}`}>{cp}</span>;
    });
  });
}

export function GrammarDetailView({ onBack }: GrammarDetailViewProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(1); // 변수부터 시작
  const [runnerWidth, setRunnerWidth] = useState(480); // 실행기 기본 너비
  const [explorerWidth, setExplorerWidth] = useState(160); // 파일 탐색기 기본 너비
  const [outputHeight, setOutputHeight] = useState(140); // 출력 영역 기본 높이
  const resizingRef = useRef<'runner' | 'explorer' | 'output' | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(480);
  const startHeightRef = useRef(140);

  const currentLesson = PYTHON_LESSONS[currentLessonIndex];
  const totalLessons = PYTHON_LESSONS.length;

    const goToLesson = (index: number) => {
    if (index >= 0 && index < totalLessons) {
      setCurrentLessonIndex(index);
    }
  };

    // ===== Resize 핸들러 =====
  const handleRunnerResizeStart = useCallback((e: React.MouseEvent) => {
    resizingRef.current = 'runner';
    startXRef.current = e.clientX;
    startWidthRef.current = runnerWidth;
    startHeightRef.current = outputHeight;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [runnerWidth, outputHeight]);

  const handleExplorerResizeStart = useCallback((e: React.MouseEvent) => {
    resizingRef.current = 'explorer';
    startXRef.current = e.clientX;
    startWidthRef.current = explorerWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [explorerWidth]);

  const handleOutputResizeStart = useCallback((e: React.MouseEvent) => {
    resizingRef.current = 'output';
    startYRef.current = e.clientY;
    startHeightRef.current = outputHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [outputHeight]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;

      if (resizingRef.current === 'runner') {
        const delta = startXRef.current - e.clientX;
        const newWidth = Math.min(Math.max(startWidthRef.current + delta, 320), 800);
        setRunnerWidth(newWidth);
      } else if (resizingRef.current === 'explorer') {
        const delta = e.clientX - startXRef.current;
        const newWidth = Math.min(Math.max(startWidthRef.current + delta, 100), 300);
        setExplorerWidth(newWidth);
      } else if (resizingRef.current === 'output') {
        const delta = startYRef.current - e.clientY;
        const newHeight = Math.min(Math.max(startHeightRef.current + delta, 60), 400);
        setOutputHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      if (resizingRef.current) {
        resizingRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* ==================== 상단 헤더바 ==================== */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
        {/* 왼쪽: 햄버거 + 현재 수강 페이지 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-1.5 text-sm">
            {PYTHON_LESSONS.map((lesson, i) => (
              <span
                key={lesson.id}
                className={`${
                  i === currentLessonIndex
                    ? 'text-purple-700 font-semibold'
                    : i < currentLessonIndex
                    ? 'text-gray-400'
                    : 'text-gray-300'
                }`}
              >
                {i > 0 && <span className="mx-1 text-gray-300">·</span>}
                {i === currentLessonIndex ? lesson.title : lesson.id}
              </span>
            ))}
          </div>
        </div>

        {/* 오른쪽: 아이콘 버튼들 */}
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
          <div className="w-7 h-7 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
          <button
            onClick={onBack}
            className="ml-2 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            레슨완료
          </button>
        </div>
      </header>

      {/* ==================== 본문 영역 ==================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ===== 좌측 사이드바 (토글) ===== */}
        <aside
          className={`border-r border-gray-200 bg-gray-50 transition-all duration-300 shrink-0 overflow-y-auto ${
            isSidebarOpen ? 'w-64' : 'w-0'
          }`}
        >
          {isSidebarOpen && (
            <div className="p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                📖 파이썬 프로그래밍
              </h3>
              <ul className="space-y-0.5">
                {PYTHON_LESSONS.map((lesson, i) => (
                  <li key={lesson.id}>
                    <button
                      onClick={() => goToLesson(i)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                        i === currentLessonIndex
                          ? 'bg-purple-100 text-purple-700 font-semibold'
                          : i < currentLessonIndex
                          ? 'text-gray-500 hover:bg-gray-100'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {i < currentLessonIndex && (
                          <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

                {/* ===== 메인 콘텐츠 영역 ===== */}
        <div className="flex flex-1 overflow-hidden relative">
                    {/* 콘텐츠 */}
                    <main className={`overflow-y-auto transition-all duration-300 ${isRunnerOpen ? 'flex-1' : 'flex-1'}`}>
                      {/* 책갈피 버튼 */}
                      <button
                        onClick={() => setIsRunnerOpen(!isRunnerOpen)}
                    
                                                className={`absolute top-14 z-20 flex items-center justify-center bg-purple-50 px-2 py-3 text-purple-500 hover:text-purple-700 hover:bg-purple-100 shadow-sm cursor-pointer group ${
                                                  isRunnerOpen
                                                    ? 'border border-l-2 border-t-2 border-b-2 border-r-0 border-purple-200 hover:border-purple-300 rounded-l-lg'
                                                    : 'right-0 border border-t-2 border-b-2 border-l-2 border-r-0 border-purple-200 hover:border-purple-300 rounded-l-lg'
                                                }`}
                                                style={isRunnerOpen ? { right: `${runnerWidth}px` } : undefined}
                      >
                        <ChevronLeft className={`w-5 h-5 transition-transform duration-200 ${isRunnerOpen ? 'rotate-180' : ''}`} />
                        <span className={`absolute whitespace-nowrap text-[11px] font-medium text-purple-600 bg-white px-2 py-1 rounded-md border border-purple-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm ${
                          isRunnerOpen
                            ? 'right-full mr-2 top-1/2 -translate-y-1/2'
                            : 'right-full mr-1.5 top-1/2 -translate-y-1/2'
                        }`}>
                          {isRunnerOpen ? '실행기 닫기' : '실행기 열기'}
                        </span>
                      </button>
            <div className="max-w-4xl mx-auto px-8 py-10">
              {/* 레슨 제목 */}
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {currentLesson.title}
              </h1>

              {/* 콘텐츠 단락 */}
              <div className="space-y-4 mb-8">
                {currentLesson.contentParagraphs.map((paragraph, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed">
                    {renderContent(paragraph)}
                  </p>
                ))}
              </div>

              {/* 하이라이트 박스 */}
              {currentLesson.highlights?.map((h, i) => (
                <div key={i} className={`${h.bgColor || 'bg-blue-50'} border ${h.borderColor || 'border-blue-200'} rounded-lg p-4 mb-8`}>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">{h.title}</h4>
                  <ul className={`text-sm ${h.textColor || 'text-blue-800'} space-y-1`}>
                    {h.lines.map((line, j) => (
                      <li key={j}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* 코드 예제 */}
              {currentLesson.code && (
                <div className="rounded-xl border border-gray-200 overflow-hidden mb-8">
                  <div className="flex items-center gap-2 bg-gray-900 px-4 py-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs text-gray-400 font-mono">
                      {currentLesson.codeLanguage === 'python' ? 'example.py' : 'example.js'}
                    </span>
                  </div>
                  <pre className="bg-[#1e1e1e] text-gray-200 p-5 text-sm font-mono leading-relaxed overflow-x-auto">
                    <code>{currentLesson.code}</code>
                  </pre>
                </div>
              )}

              {/* 페이지 네비게이션 */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <button
                  onClick={() => goToLesson(currentLessonIndex - 1)}
                  disabled={currentLessonIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 disabled:text-gray-300 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  이전 레슨
                </button>

                {/* 진행 단계 표시 */}
                <span className="text-xs text-gray-400">
                  {currentLessonIndex + 1} / {totalLessons}
                </span>

                <button
                  onClick={() => goToLesson(currentLessonIndex + 1)}
                  disabled={currentLessonIndex === totalLessons - 1}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 disabled:text-gray-300 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  다음 레슨
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
                    </main>

                                        {/* 실행 환경 패널 */}
          <aside
            className={`border-l border-gray-200 bg-gray-50 overflow-hidden shrink-0 relative ${
              isRunnerOpen ? '' : 'w-0'
            } ${isRunnerOpen ? '' : ''}`}
            style={isRunnerOpen ? { width: `${runnerWidth}px` } : { width: '0px' }}
          >
            {/* 리사이즈 핸들 */}
            {isRunnerOpen && (
              <div
                className="absolute -left-1 top-0 bottom-0 w-3 z-30 cursor-col-resize flex items-center justify-center group"
                onMouseDown={handleRunnerResizeStart}
              >
                <div className="w-0.5 h-8 bg-gray-300 rounded-full group-hover:bg-purple-400 transition-colors" />
              </div>
            )}
                        {isRunnerOpen && (
                          <div className="h-full flex flex-col" style={{ width: `${runnerWidth}px` }}>
                            {/* 실행 환경 헤더 */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white shrink-0">
                              <div className="flex items-center gap-2">
                                <Play className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-semibold text-gray-800">Python 실행기</span>
                              </div>
                            </div>

                            {/* 본문: 파일트리 + 코드 영역 */}
                            <div className="flex flex-1 overflow-hidden">
                              {/* 왼쪽: 파일 탐색기 */}
                              <div
                                className="flex flex-col shrink-0 overflow-hidden"
                                style={{ width: `${explorerWidth}px` }}
                              >
                                <div className="px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-100/50 shrink-0">
                                  탐색기
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                                  {/* 파일 트리 아이템들 */}
                                  {[
                                    { name: 'main.py', icon: '🐍', active: true },
                                    { name: 'variables.py', icon: '📄', active: false },
                                    { name: 'functions.py', icon: '📄', active: false },
                                  ].map((file) => (
                                    <div
                                      key={file.name}
                                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition ${
                                        file.active
                                          ? 'bg-purple-100 text-purple-700 font-medium'
                                          : 'text-gray-600 hover:bg-gray-100'
                                      }`}
                                    >
                                      <span>{file.icon}</span>
                                      <span>{file.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 리사이즈 핸들 (파일트리 ↔ 코드) */}
                              <div
                                className="w-1 cursor-col-resize shrink-0 relative group"
                                onMouseDown={handleExplorerResizeStart}
                              >
                                <div className="absolute inset-0 -left-1 -right-1" />
                                <div className="w-full h-full bg-gray-200 group-hover:bg-purple-400 transition-colors" />
                              </div>

                              {/* 오른쪽: 코드 편집 + 실행 */}
                              <div className="flex-1 flex flex-col overflow-hidden">
                                {/* 파일 타이틀 바 */}
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 border-b border-gray-200">
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-t border border-gray-200 border-b-0 text-xs text-gray-700 font-medium">
                                    <span className="text-[10px]">🐍</span>
                                    main.py
                                    <button className="ml-1 text-gray-400 hover:text-gray-600 text-[10px] leading-none">✕</button>
                                  </div>
                                </div>

                                                                {/* 코드 에디터 */}
                                <div className="flex-1 bg-[#1e1e1e] overflow-hidden">
                                  <textarea
                                    className="w-full h-full bg-transparent text-gray-200 p-4 text-sm font-mono resize-none outline-none leading-relaxed"
                                    defaultValue={currentLesson.code || ''}
                                    placeholder="# 여기에 코드를 입력하세요"
                                  />
                                </div>

                                {/* 가로 리사이즈 핸들 (코드 에디터 아래 ↔ 도구모음 위) */}
                                <div
                                  className="h-1 cursor-row-resize shrink-0 relative group"
                                  onMouseDown={handleOutputResizeStart}
                                >
                                  <div className="absolute inset-0 -top-1 -bottom-1" />
                                  <div className="w-full h-full bg-gray-700 group-hover:bg-purple-500 transition-colors" />
                                </div>

                                {/* 하단 도구 모음 (실행 버튼 + 실행흐름) */}
                                <div className="flex items-center gap-2 px-4 py-2 bg-white shrink-0">
                                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-[11px] font-medium rounded-md hover:bg-purple-700 transition cursor-pointer">
                                    <Play className="w-3 h-3 fill-white" />
                                    실행
                                  </button>
                                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 text-[11px] font-medium rounded-md border border-gray-200 hover:bg-gray-50 hover:border-purple-200 hover:text-purple-600 transition cursor-pointer">
                                    <span>▶</span>
                                    실행흐름
                                  </button>

                                  <div className="flex-1" />

                                                                    {/* 출력 결과 간략 표시 */}
                                  <span className="text-[10px] text-gray-400">{'// 실행 결과'}</span>
                                </div>

                                {/* 출력 영역 */}
                                <div
                                  className="border-t border-gray-200 bg-[#1e1e1e] overflow-y-auto shrink-0"
                                  style={{ height: `${outputHeight}px` }}
                                >
                                  <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-800 sticky top-0">
                                    <span className="text-[10px] text-gray-400 font-medium">출력</span>
                                  </div>
                                  <div className="p-3">
                                    <p className="text-xs text-gray-500 font-mono">{'// 실행 결과가 여기에 표시됩니다'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    </aside>
        </div>
      </div> {/* 👈 flex-1 overflow-hidden */}
    </div>
  );
}

