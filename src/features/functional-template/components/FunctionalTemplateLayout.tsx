'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, BookOpen, Layers3, Sparkles } from 'lucide-react';
import { Header } from './Header';
import { TabNav } from './TabNav';
import { FileExplorer } from './FileExplorer';
import { CodeEditor } from './CodeEditor';
import { MemoPanel } from './MemoPanel';
import { SettingsModal } from './SettingsModal';
import { DesignIntentSection } from './DesignIntentSection';
import { MissionSection } from './MissionSection';
import { RequirementsSection } from './RequirementsSection';
import { StructureSection } from './StructureSection';
import { InterviewSection } from './InterviewSection';
<<<<<<< HEAD
import type { TemplateDetailApiResponse, TemplatePracticeDetailApiResponse } from '@/api/services/FunctionalTemplateService';
=======
import type { TemplateDetailApiResponse } from '@/api/services/FunctionalTemplateService';

type EditorMode = 'exploration' | 'mission';
>>>>>>> 169f9c7 (♻️ fix: 기능 템플릿 CI 오류 수정)

interface FileTreeItem {
  id?: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileTreeItem[];
  expanded?: boolean;
}

interface FunctionalTemplateLayoutProps {
  templateTitle: string;
  consecutiveDays?: number;
  templateId?: number | null;
  template?: TemplateDetailApiResponse | null;
  practice?: TemplatePracticeDetailApiResponse | null;
}

export function FunctionalTemplateLayout({ templateTitle, templateId, template, practice }: FunctionalTemplateLayoutProps) {
  const [activeTab, setActiveTab] = useState('design-intent');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isShowSettings, setIsShowSettings] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isAiGuruHintMode, setIsAiGuruHintMode] = useState(true);
  const [activeFile, setActiveFile] = useState('main.ts');
  const [contentWidth, setContentWidth] = useState(400);
  const [explorerWidth, setExplorerWidth] = useState(224);

  const resizingRef = useRef<'content' | 'explorer' | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const isDarkMode = themeMode === 'dark';
  const router = useRouter();

  const practiceFiles = useMemo(
    () => [...(practice?.files ?? [])].sort((left, right) => left.orderIndex - right.orderIndex),
    [practice],
  );
  const practiceMissions = useMemo(
    () => [...(practice?.missions ?? [])].sort((left, right) => left.orderIndex - right.orderIndex),
    [practice],
  );
  const practiceFileMap = useMemo(
    () => Object.fromEntries(practiceFiles.map((file) => [file.filePath, file.content])) as Record<string, string>,
    [practiceFiles],
  );
  const hasPracticeFiles = practiceFiles.length > 0;
  const resolvedActiveFile = hasPracticeFiles && !practiceFileMap[activeFile]
    ? practiceFiles[0]?.filePath ?? activeFile
    : activeFile;
  const editorCode = useMemo(() => practiceFileMap[resolvedActiveFile] ?? '', [resolvedActiveFile, practiceFileMap]);
  const currentTabs = useMemo(() => practiceFiles.map((file) => file.filePath), [practiceFiles]);

  const editorFiles: FileTreeItem[] = useMemo(() => {
    if (!hasPracticeFiles) {
      return [];
    }

    return [
      {
        id: 'practice-root',
        name: templateTitle,
        type: 'folder',
        expanded: true,
        children: practiceFiles.map((file) => ({
          id: String(file.id),
          name: file.filePath,
          type: 'file',
        })),
      },
    ];
  }, [hasPracticeFiles, practiceFiles, templateTitle]);

  const renderContent = () => {
    switch (activeTab) {
      case 'design-intent':
        return <DesignIntentSection isDarkMode={isDarkMode} content={template?.designIntent} />;
      case 'structure':
        return <StructureSection isDarkMode={isDarkMode} content={template?.projectStructure} />;
      case 'requirements':
        return <RequirementsSection isDarkMode={isDarkMode} content={template?.requirementsSpec} />;
      case 'mission':
        return (
          <MissionSection
            isDarkMode={isDarkMode}
            onOpenEditor={openMissionEditor}
            missions={practiceMissions.map((mission, index) => ({
              ...mission,
              fileName: practiceFiles[index]?.filePath ?? practiceFiles[0]?.filePath ?? 'auth.ts',
            }))}
          />
        );
      case 'interview':
        return <InterviewSection isDarkMode={isDarkMode} questions={template?.interviewQuestions} />;
      default:
        return <DesignIntentSection isDarkMode={isDarkMode} content={template?.designIntent} />;
    }
  };

  const openMissionEditor = (fileName = 'auth.ts') => {
    setActiveFile(fileName);
    setIsEditorOpen(true);
  };

  const handleEditorFileSelect = (fileName: string) => {
    setActiveFile(fileName);
  };

  const handleContentResizeStart = useCallback((e: React.MouseEvent) => {
    resizingRef.current = 'content';
    startXRef.current = e.clientX;
    startWidthRef.current = contentWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [contentWidth]);

  const handleExplorerResizeStart = useCallback((e: React.MouseEvent) => {
    resizingRef.current = 'explorer';
    startXRef.current = e.clientX;
    startWidthRef.current = explorerWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [explorerWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) {
        return;
      }

      if (resizingRef.current === 'content') {
        setContentWidth(Math.min(Math.max(startWidthRef.current + (e.clientX - startXRef.current), 300), 700));
      } else if (resizingRef.current === 'explorer') {
        setExplorerWidth(Math.min(Math.max(startWidthRef.current + (e.clientX - startXRef.current), 150), 400));
      }
    };

<<<<<<< HEAD
    const handleMouseUp = () => {
      if (resizingRef.current) {
        resizingRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
=======
    interface FunctionalTemplateLayoutProps {
      templateTitle: string;
      consecutiveDays?: number;
      templateId?: number | null;
      template?: TemplateDetailApiResponse | null;
    }
>>>>>>> 169f9c7 (♻️ fix: 기능 템플릿 CI 오류 수정)

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const renderLessonSidebar = () => (
    <aside
      className={`w-72 shrink-0 border-l transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FAFBFC] border-[#F1F5F9]'
      }`}
    >
      <div className="h-full overflow-y-auto px-4 py-4">
        <div className={`rounded-md border p-4 transition-colors duration-300 ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#F1F5F9]'}`}>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#7C3AED]" />
            <h3 className={`text-[15px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
              데이터 없음
            </h3>
          </div>
          <p className={`text-[14px] leading-relaxed ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
            추가로 보여줄 백엔드 데이터가 없으면 이 영역은 비어 있습니다.
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <div
      className={`flex h-screen flex-col transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0F172A]' : 'bg-white'
      }`}
    >
      <Header
        onSettingsClick={() => setIsShowSettings(true)}
        onMemoToggle={() => setIsMemoOpen(!isMemoOpen)}
        isMemoOpen={isMemoOpen}
        isDarkMode={isDarkMode}
      />

      <div className={`border-b px-8 py-4 transition-colors duration-300 ${isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'}`}>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>{templateTitle}</p>
            <p className={`text-xs ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              {template?.category ?? '기능 템플릿'}
              {templateId != null ? ` · ID ${templateId}` : ''}
            </p>
          </div>
          {template && (
            <div className={`text-xs ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
              난이도 {template.difficulty} · 조회 {template.viewCount.toLocaleString()}회
            </div>
          )}
        </div>
      </div>

      <TabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDarkMode={isDarkMode}
        onMarkComplete={() => {}}
      />

      <div className={`relative flex flex-1 min-h-0 overflow-hidden ${isMemoOpen ? 'pr-80' : ''}`}>
        <button
          onClick={() => {
            if (isEditorOpen) {
              setIsEditorOpen(false);
              return;
            }

            if (hasPracticeFiles) {
              setActiveFile(practiceFiles[0]?.filePath ?? 'main.ts');
            }
            setIsEditorOpen(true);
          }}
          className={`absolute top-14 z-20 flex items-center justify-center px-2 py-3 shadow-sm cursor-pointer group transition-colors duration-200 ${
            isDarkMode
              ? 'bg-[#1E293B] text-[#A78BFA] hover:text-[#E9D5FF] hover:bg-[#334155]'
              : 'bg-purple-50 text-purple-500 hover:text-purple-700 hover:bg-purple-100'
          } ${
            isEditorOpen
              ? `${isDarkMode ? 'border border-l-2 border-t-2 border-b-2 border-r-0 border-[#475569]' : 'border border-l-2 border-t-2 border-b-2 border-r-0 border-purple-200'} rounded-l-lg`
              : `${isDarkMode ? 'border border-t-2 border-b-2 border-l-2 border-r-0 border-[#475569]' : 'border border-t-2 border-b-2 border-l-2 border-r-0 border-purple-200'} rounded-l-lg`
          }`}
          style={isEditorOpen ? { right: `${contentWidth + 1}px` } : { right: '0px' }}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform duration-200 ${isEditorOpen ? 'rotate-180' : ''}`} />
          <span className={`absolute whitespace-nowrap text-[11px] font-medium px-2 py-1 rounded-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm ${
            isDarkMode
              ? 'text-[#94A3B8] bg-[#0F172A] border-[#475569]'
              : 'text-purple-600 bg-white border-purple-200'
          } ${
            isEditorOpen ? 'right-full mr-2 top-1/2 -translate-y-1/2' : 'right-full mr-1.5 top-1/2 -translate-y-1/2'
          }`}>
            {isEditorOpen ? '에디터 닫기' : '에디터 열기'}
          </span>
        </button>

<<<<<<< HEAD
        {isEditorOpen ? (
          hasPracticeFiles ? (
            <div className="flex flex-1 min-w-0 overflow-hidden relative">
              <section
                style={{ width: `${contentWidth}px` }}
                className={`min-w-0 overflow-y-auto border-r transition-colors duration-300 ${isDarkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-[#F1F5F9]'}`}
              >
                <div className="mx-auto max-w-200 px-5 py-5 lg:px-6 lg:py-6">
                  {renderContent()}
                </div>
              </section>

              <div
                onMouseDown={handleContentResizeStart}
                className={`w-1 bg-gray-200 hover:bg-purple-500 cursor-col-resize transition-colors duration-150 ${isDarkMode ? 'bg-gray-700 hover:bg-purple-400' : ''}`}
=======
          <div className={`border-b px-8 py-4 transition-colors duration-300 ${isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'}`}>
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
              <div>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>{templateTitle}</p>
                <p className={`text-xs ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                  {template?.category ?? '기능 템플릿'}
                  {templateId != null ? ` · ID ${templateId}` : ''}
                </p>
              </div>
              {template && (
                <div className={`text-xs ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                  난이도 {template.difficulty} · 조회 {template.viewCount.toLocaleString()}회
                </div>
              )}
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <TabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isDarkMode={isDarkMode}
            onMarkComplete={() => {
              // 학습 완료 처리 로직
            }}
          />

          <div className={`relative flex flex-1 min-h-0 overflow-hidden ${isMemoOpen ? 'pr-80' : ''}`}>
            {/* 에디터 토글 버튼 (절대 위치, 문법 템플릿 스타일) */}
            <button
              onClick={() => {
                if (isEditorOpen) {
                  setIsEditorOpen(false);
                  return;
                }

                openExplorationEditor();
              }}
              className={`absolute top-14 z-20 flex items-center justify-center px-2 py-3 shadow-sm cursor-pointer group transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-[#1E293B] text-[#A78BFA] hover:text-[#E9D5FF] hover:bg-[#334155]'
                  : 'bg-purple-50 text-purple-500 hover:text-purple-700 hover:bg-purple-100'
              } ${
                isEditorOpen
                  ? `${isDarkMode ? 'border border-l-2 border-t-2 border-b-2 border-r-0 border-[#475569]' : 'border border-l-2 border-t-2 border-b-2 border-r-0 border-purple-200'} rounded-l-lg`
                  : `${isDarkMode ? 'border border-t-2 border-b-2 border-l-2 border-r-0 border-[#475569]' : 'border border-t-2 border-b-2 border-l-2 border-r-0 border-purple-200'} rounded-l-lg`
              }`}
              style={isEditorOpen ? { right: `${contentWidth + 1}px` } : { right: '0px' }}
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-200 ${isEditorOpen ? 'rotate-180' : ''}`} />
              <span className={`absolute whitespace-nowrap text-[11px] font-medium px-2 py-1 rounded-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm ${
                isDarkMode
                  ? 'text-[#94A3B8] bg-[#0F172A] border-[#475569]'
                  : 'text-purple-600 bg-white border-purple-200'
              } ${
                isEditorOpen ? 'right-full mr-2 top-1/2 -translate-y-1/2' : 'right-full mr-1.5 top-1/2 -translate-y-1/2'
              }`}>
                {isEditorOpen ? '에디터 닫기' : '에디터 열기'}
              </span>
            </button>

            {isEditorOpen ? (
              <div className="flex flex-1 min-w-0 overflow-hidden relative">
                {/* 좌측 콘텐츠 영역 */}
                <section
                  style={{ width: `${contentWidth}px` }}
                  className={`min-w-0 overflow-y-auto border-r transition-colors duration-300 ${isDarkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-[#F1F5F9]'}`}
                >
                  <div className="mx-auto max-w-200 px-5 py-5 lg:px-6 lg:py-6">
                    {renderContent()}
                  </div>
                </section>

                {/* 콘텐츠 리사이즈 핸들 */}
                <div
                  onMouseDown={handleContentResizeStart}
                  className={`w-1 bg-gray-200 hover:bg-purple-500 cursor-col-resize transition-colors duration-150 ${isDarkMode ? 'bg-gray-700 hover:bg-purple-400' : ''}`}
                />

                {/* 우측 에디터 영역 */}
                <section className="flex-1 overflow-hidden">
                  <div className="flex h-full min-w-0 overflow-hidden">
                    {/* 파일 탐색기 */}
                    <div
                      style={{ width: `${explorerWidth}px` }}
                      className={`min-w-0 border-r transition-colors duration-300 ${isDarkMode ? 'border-[#334155]' : 'border-[#F1F5F9]'}`}
                    >
                      <FileExplorer
                        isDarkMode={isDarkMode}
                        activeFile={activeFile}
                        files={editorMode === 'mission' ? missionTree : explorationTree}
                        onFileSelect={handleEditorFileSelect}
                      />
                    </div>

                    {/* 파일 탐색기 리사이즈 핸들 */}
                    <div
                      onMouseDown={handleExplorerResizeStart}
                      className={`w-1 bg-gray-200 hover:bg-purple-500 cursor-col-resize transition-colors duration-150 ${isDarkMode ? 'bg-gray-700 hover:bg-purple-400' : ''}`}
                    />

                    {/* 코드 에디터 */}
                    <div className="flex-1 overflow-hidden">
                      <CodeEditor
                        fileName={activeFile}
                        code={editorCode}
                        onCodeChange={() => {}}
                        fileTabs={currentTabs}
                        activeFile={activeFile}
                        onFileSelect={handleEditorFileSelect}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div className="flex flex-1 min-w-0 overflow-hidden">
                <section className={`flex-1 min-w-0 overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
                  <div className="mx-auto max-w-200 px-5 py-5 lg:px-6 lg:py-6">
                    {renderContent()}
                  </div>
                </section>
                {renderLessonSidebar()}
              </div>
            )}

            {isMemoOpen && (
              <MemoPanel
                isDarkMode={isDarkMode}
                onClose={() => setIsMemoOpen(false)}
>>>>>>> 169f9c7 (♻️ fix: 기능 템플릿 CI 오류 수정)
              />

              <section className="flex-1 overflow-hidden">
                <div className="flex h-full min-w-0 overflow-hidden">
                  <div
                    style={{ width: `${explorerWidth}px` }}
                    className={`min-w-0 border-r transition-colors duration-300 ${isDarkMode ? 'border-[#334155]' : 'border-[#F1F5F9]'}`}
                  >
                    <FileExplorer
                      isDarkMode={isDarkMode}
                      activeFile={resolvedActiveFile}
                      files={editorFiles}
                      onFileSelect={handleEditorFileSelect}
                    />
                  </div>

                  <div
                    onMouseDown={handleExplorerResizeStart}
                    className={`w-1 bg-gray-200 hover:bg-purple-500 cursor-col-resize transition-colors duration-150 ${isDarkMode ? 'bg-gray-700 hover:bg-purple-400' : ''}`}
                  />

                  <div className="flex-1 overflow-hidden">
                    <CodeEditor
                      fileName={resolvedActiveFile}
                      code={editorCode}
                      onCodeChange={() => {}}
                      fileTabs={currentTabs}
                      activeFile={resolvedActiveFile}
                      onFileSelect={handleEditorFileSelect}
                      isDarkMode={isDarkMode}
                      hasContent={editorCode.length > 0}
                    />
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="flex flex-1 min-w-0 items-center justify-center overflow-hidden">
              <div className={`rounded-lg border px-6 py-8 text-center ${isDarkMode ? 'border-[#334155] bg-[#0F172A] text-[#94A3B8]' : 'border-[#E2E8F0] bg-white text-[#64748B]'}`}>
                데이터 없음
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-1 min-w-0 overflow-hidden">
            <section className={`flex-1 min-w-0 overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
              <div className="mx-auto max-w-200 px-5 py-5 lg:px-6 lg:py-6">
                {renderContent()}
              </div>
            </section>
            {renderLessonSidebar()}
          </div>
        )}

        {isMemoOpen && (
          <MemoPanel
            isDarkMode={isDarkMode}
            onClose={() => setIsMemoOpen(false)}
          />
        )}
      </div>

      <div
        className={`h-16 border-t transition-colors duration-300 px-6 flex items-center ${
          isDarkMode
            ? 'bg-[#0F172A] border-[#334155]'
            : 'bg-white border-[#F1F5F9]'
        }`}
      >
        <button
          onClick={() => router.push('/functional-template-hub')}
          className={`flex items-center gap-2 p-2 rounded transition-colors duration-300 ${
            isDarkMode
              ? 'text-[#94A3B8] hover:bg-[#334155]'
              : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            뒤로가기
          </span>
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <button
            aria-label="이전 레슨"
            className={`p-1 rounded transition-colors duration-300 ${
              isDarkMode ? 'text-[#94A3B8] hover:bg-[#334155]' : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            데이터 없음
          </span>

          <span
            className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'
            }`}
          >
            |
          </span>

          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            데이터 없음
          </span>

          <button
            aria-label="다음 레슨"
            className={`p-1 rounded transition-colors duration-300 ${
              isDarkMode ? 'text-[#94A3B8] hover:bg-[#334155]' : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isShowSettings && (
        <SettingsModal
          isDarkMode={isDarkMode}
          themeMode={themeMode}
          onThemeModeChange={setThemeMode}
          isAiGuruHintMode={isAiGuruHintMode}
          onAiGuruHintModeChange={setIsAiGuruHintMode}
          onClose={() => setIsShowSettings(false)}
        />
      )}
    </div>
  );
}
