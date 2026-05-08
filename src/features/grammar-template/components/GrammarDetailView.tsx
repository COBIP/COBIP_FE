import { useState } from 'react';
import { Menu, Bookmark, Bot, Settings, ChevronLeft, ChevronRight, Check } from 'lucide-react';
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
  const [currentLessonIndex, setCurrentLessonIndex] = useState(1); // 변수부터 시작

  const currentLesson = PYTHON_LESSONS[currentLessonIndex];
  const totalLessons = PYTHON_LESSONS.length;

  const goToLesson = (index: number) => {
    if (index >= 0 && index < totalLessons) {
      setCurrentLessonIndex(index);
    }
  };

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

        {/* ===== 메인 콘텐츠 ===== */}
        <main className="flex-1 overflow-y-auto">
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
      </div>
    </div>
  );
}
