'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Layers3, Loader2, Play, Sparkles } from 'lucide-react';
import { useUserStore } from '@/store/UseUserStore';
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
import { MarkdownTextView } from './MarkdownTextView';
import {
  createTemplateFavorite,
  createTemplatePracticeStart,
  deleteTemplateFavorite,
  fetchTemplatePracticeProjectRun,
  updateTemplatePracticeComplete,
  type TemplateDetailApiResponse,
  type TemplatePracticeDetailApiResponse,
  type TemplatePracticeFileApiResponse,
  type TemplatePracticeProgressApiResponse,
} from '@/api/services/FunctionalTemplateService';

const TEXT = {
  headerTitle: '기능 템플릿 학습',
  functionalTemplate: '기능 템플릿',
  difficulty: '난이도',
  views: '조회',
  public: '공개',
  progress: '학습 진행률',
  completed: '완료됨',
  saving: '저장 중',
  complete: '학습 완료',
  completeSaved: '학습 완료가 저장되었습니다.',
  progressSaved: '학습 진행 상태가 저장되었습니다.',
  completeFailed: '학습 완료 처리에 실패했습니다.',
  favoriteFailed: '북마크 처리에 실패했습니다.',
  noPracticeFiles: '실습 파일이 없습니다. 관리자 실습 관리에서 파일과 코드를 추가해주세요.',
  list: '목록으로',
  previousLesson: '이전 레슨',
  nextLesson: '다음 레슨',
  editorOpen: '코드 실행기 열기',
  editorClose: '코드 실행기 닫기',
  learningPoint: '학습 포인트',
  conceptKeywords: '관련 개념 키워드',
  references: '참고 레퍼런스',
  defaultLearningPoint: '미션을 따라가며 핵심 구현 흐름과 검증 로직을 함께 확인해보세요.',
};

interface FileTreeItem {
  id?: string;
  name: string;
  path?: string;
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

function checkProblemMissionType(missionType?: string) {
  return missionType === 'DEBUGGING' || missionType === 'TEST';
}

function buildEditorFileTree(files: TemplatePracticeFileApiResponse[], templateTitle: string): FileTreeItem[] {
  const root: FileTreeItem = {
    id: 'practice-root',
    name: templateTitle,
    type: 'folder',
    expanded: true,
    children: [],
  };

  files.forEach((file) => {
    const parts = file.filePath.split('/').filter(Boolean);
    let currentChildren = root.children;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = index === parts.length - 1;

      if (isFile) {
        currentChildren?.push({
          id: String(file.id),
          name: part,
          path: file.filePath,
          type: 'file',
        });
        return;
      }

      let folder = currentChildren?.find((node) => node.type === 'folder' && node.name === part);

      if (!folder) {
        folder = {
          id: currentPath,
          name: part,
          path: currentPath,
          type: 'folder',
          expanded: true,
          children: [],
        };
        currentChildren?.push(folder);
      }

      currentChildren = folder.children;
    });
  });

  return [root];
}

export function FunctionalTemplateLayout({
  templateTitle,
  templateId,
  template,
  practice,
}: FunctionalTemplateLayoutProps) {
  const router = useRouter();
  const nickname = useUserStore((state) => state.nickname);
  const profileImage = useUserStore((state) => state.profileImage);

  const [activeTab, setActiveTab] = useState('design-intent');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isShowSettings, setIsShowSettings] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isAiGuruHintMode, setIsAiGuruHintMode] = useState(true);
  const [activeFile, setActiveFile] = useState('main.java');
  const [activeMissionId, setActiveMissionId] = useState<number | null>(null);
  const [contentWidth, setContentWidth] = useState(760);
  const [explorerWidth, setExplorerWidth] = useState(260);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [runOutput, setRunOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [practiceProgress, setPracticeProgress] = useState<TemplatePracticeProgressApiResponse | null>(
    practice?.progress ?? null,
  );
  const [isFavorite, setIsFavorite] = useState(Boolean(template?.favorited));
  const [isFavoriteSaving, setIsFavoriteSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeMessage, setCompleteMessage] = useState('');
  const [completeError, setCompleteError] = useState('');
  const [favoriteError, setFavoriteError] = useState('');

  const resizingRef = useRef<'content' | 'explorer' | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const isDarkMode = themeMode === 'dark';

  const practiceFiles = useMemo(
    () => [...(practice?.files ?? [])].sort((left, right) => left.orderIndex - right.orderIndex || left.filePath.localeCompare(right.filePath)),
    [practice?.files],
  );
  const practiceMissions = useMemo(
    () => [...(practice?.missions ?? [])].sort((left, right) => left.orderIndex - right.orderIndex),
    [practice?.missions],
  );
  const missionItems = useMemo(
    () => practiceMissions.filter((mission) => !checkProblemMissionType(mission.missionType)),
    [practiceMissions],
  );
  const problemItems = useMemo(
    () => practiceMissions.filter((mission) => checkProblemMissionType(mission.missionType)),
    [practiceMissions],
  );
  const hasPracticeFiles = practiceFiles.length > 0;
  const practiceFileMap = useMemo(
    () =>
      Object.fromEntries(
        practiceFiles.map((file) => [file.filePath, fileContents[file.filePath] ?? file.content]),
      ) as Record<string, string>,
    [fileContents, practiceFiles],
  );
  const resolvedActiveFile = hasPracticeFiles && !practiceFileMap[activeFile]
    ? practiceFiles[0]?.filePath ?? activeFile
    : activeFile;
  const editorCode = practiceFileMap[resolvedActiveFile] ?? '';
  const currentTabs = practiceFiles.map((file) => file.filePath);
  const editorFiles = useMemo(
    () => (hasPracticeFiles ? buildEditorFileTree(practiceFiles, templateTitle) : []),
    [hasPracticeFiles, practiceFiles, templateTitle],
  );
  const progressPercent = practiceProgress?.progressPercent ?? 0;
  const isCompleted = practiceProgress?.status === 'COMPLETED' || progressPercent >= 100;
  const visibleTags = (template?.techStacks ?? []).slice(0, 3);

  const learningPoint = useMemo(() => {
    const firstMissionGuide = practiceMissions[0]?.guideContent || practiceMissions[0]?.description;
    return firstMissionGuide || template?.description || TEXT.defaultLearningPoint;
  }, [practiceMissions, template?.description]);
  const conceptKeywords = useMemo(() => {
    const keywords = [...(template?.techStacks ?? [])];
    if (template?.category) keywords.unshift(template.category);
    return keywords.filter(Boolean).slice(0, 4);
  }, [template?.category, template?.techStacks]);
  const references = useMemo(() => {
    const fileRefs = practiceFiles.map((file) => file.filePath).slice(0, 3);
    const missionRefs = practiceMissions.map((mission) => mission.title).slice(0, 3);
    return fileRefs.length > 0 ? fileRefs : missionRefs;
  }, [practiceFiles, practiceMissions]);

  useEffect(() => {
    setPracticeProgress(practice?.progress ?? null);
  }, [practice?.progress]);

  useEffect(() => {
    setIsFavorite(Boolean(template?.favorited));
  }, [template?.favorited]);

  useEffect(() => {
    setFileContents(Object.fromEntries(practiceFiles.map((file) => [file.filePath, file.content])));
    if (practiceFiles[0]) setActiveFile(practiceFiles[0].filePath);
    if (practiceMissions[0]) setActiveMissionId(practiceMissions[0].id);
  }, [practiceFiles, practiceMissions]);

  const openEditor = (filePath?: string, missionId?: number) => {
    if (filePath) setActiveFile(filePath);
    else if (practiceFiles[0]) setActiveFile(practiceFiles[0].filePath);
    setActiveMissionId(missionId ?? activeMissionId ?? practiceMissions[0]?.id ?? null);
    setIsEditorOpen(true);
  };

  const buildProjectFiles = () =>
    practiceFiles.map((file) => ({
      filePath: file.filePath,
      content: fileContents[file.filePath] ?? file.content,
    }));

  const handleRunProject = async () => {
    if (!templateId || isRunning) return;
    const missionId = activeMissionId ?? practiceMissions[0]?.id;

    if (!missionId) {
      setRunOutput('실행할 미션이나 문제를 먼저 선택해주세요.');
      return;
    }

    setIsRunning(true);
    setRunOutput('실행 중...');

    try {
      const result = await fetchTemplatePracticeProjectRun(templateId, missionId, buildProjectFiles());
      setRunOutput(
        [
          `status: ${result.status}`,
          `exitCode: ${result.exitCode}`,
          result.stdout ? `stdout:\n${result.stdout}` : '',
          result.stderr ? `stderr:\n${result.stderr}` : '',
          result.message ? `message:\n${result.message}` : '',
          `duration: ${result.durationMillis}ms`,
        ]
          .filter(Boolean)
          .join('\n\n'),
      );
    } catch (error) {
      setRunOutput(error instanceof Error ? error.message : '실행에 실패했습니다.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!templateId || isFavoriteSaving) return;

    const shouldBeFavorite = !isFavorite;
    setIsFavorite(shouldBeFavorite);
    setIsFavoriteSaving(true);
    setFavoriteError('');

    try {
      if (shouldBeFavorite) await createTemplateFavorite(templateId);
      else await deleteTemplateFavorite(templateId);
    } catch (error) {
      setIsFavorite(!shouldBeFavorite);
      setFavoriteError(error instanceof Error ? error.message : TEXT.favoriteFailed);
    } finally {
      setIsFavoriteSaving(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!templateId || isCompleting || isCompleted) return;

    setIsCompleting(true);
    setCompleteMessage('');
    setCompleteError('');

    try {
      const missionIds = practiceMissions.map((mission) => mission.id);
      const nextProgress = missionIds.length > 0
        ? await updateTemplatePracticeComplete(templateId, missionIds)
        : await createTemplatePracticeStart(templateId);

      setPracticeProgress(nextProgress);
      setCompleteMessage(nextProgress.progressPercent >= 100 ? TEXT.completeSaved : TEXT.progressSaved);
    } catch (error) {
      setCompleteError(error instanceof Error ? error.message : TEXT.completeFailed);
    } finally {
      setIsCompleting(false);
    }
  };

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
            title="미션"
            isDarkMode={isDarkMode}
            onOpenEditor={openEditor}
            missions={missionItems.map((mission, index) => ({
              ...mission,
              fileName: practiceFiles[index]?.filePath ?? practiceFiles[0]?.filePath ?? 'main.java',
            }))}
          />
        );
      case 'problem':
        return (
          <MissionSection
            title="문제"
            emptyText="아직 연결된 문제가 없습니다."
            actionLabel="문제 풀기"
            isDarkMode={isDarkMode}
            onOpenEditor={openEditor}
            missions={problemItems.map((mission, index) => ({
              ...mission,
              fileName: practiceFiles[index]?.filePath ?? practiceFiles[0]?.filePath ?? 'main.java',
            }))}
          />
        );
      case 'interview':
        return <InterviewSection isDarkMode={isDarkMode} questions={template?.interviewQuestions} />;
      default:
        return <DesignIntentSection isDarkMode={isDarkMode} content={template?.designIntent} />;
    }
  };

  const handleContentResizeStart = useCallback((event: React.MouseEvent) => {
    resizingRef.current = 'content';
    startXRef.current = event.clientX;
    startWidthRef.current = contentWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [contentWidth]);

  const handleExplorerResizeStart = useCallback((event: React.MouseEvent) => {
    resizingRef.current = 'explorer';
    startXRef.current = event.clientX;
    startWidthRef.current = explorerWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [explorerWidth]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!resizingRef.current) return;

      if (resizingRef.current === 'content') {
        setContentWidth(Math.min(Math.max(startWidthRef.current + event.clientX - startXRef.current, 420), 920));
      } else {
        setExplorerWidth(Math.min(Math.max(startWidthRef.current + event.clientX - startXRef.current, 180), 420));
      }
    };

    const handleMouseUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = null;
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

  const renderLearningSidebar = () => (
    <aside
      className={`w-[22rem] shrink-0 border-l px-4 py-4 transition-colors duration-300 ${
        isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#F1F5F9] bg-[#FAFBFC]'
      }`}
    >
      <div className="space-y-3">
        <section className={`rounded-lg border p-4 ${isDarkMode ? 'border-[#334155] bg-[#1E293B]' : 'border-[#E2E8F0] bg-white'}`}>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#7C3AED]" />
            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>{TEXT.learningPoint}</h3>
          </div>
          <MarkdownTextView
            content={learningPoint}
            isDarkMode={isDarkMode}
            compact
            maxBlocks={3}
            maxListItems={3}
            className={`line-clamp-7 text-[13px] ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}
          />
        </section>

        <section className={`rounded-lg border p-4 ${isDarkMode ? 'border-[#334155] bg-[#1E293B]' : 'border-[#E2E8F0] bg-white'}`}>
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#7C3AED]" />
            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>{TEXT.conceptKeywords}</h3>
          </div>
          <ul className={`space-y-1.5 text-[13px] ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
            {conceptKeywords.map((keyword) => (
              <li key={keyword} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C3AED]" />
                <span className="truncate">{keyword}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`rounded-lg border p-4 ${isDarkMode ? 'border-[#334155] bg-[#1E293B]' : 'border-[#E2E8F0] bg-white'}`}>
          <div className="mb-2 flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-[#7C3AED]" />
            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>{TEXT.references}</h3>
          </div>
          <ul className={`space-y-1.5 text-[13px] ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
            {references.map((reference) => (
              <li key={reference} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C3AED]" />
                <span className="min-w-0 truncate">{reference}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );

  return (
    <div className={`flex h-screen flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
      <Header
        title={TEXT.headerTitle}
        isFavorite={isFavorite}
        isFavoriteSaving={isFavoriteSaving}
        profileImage={profileImage}
        nickname={nickname}
        onFavoriteToggle={() => void handleFavoriteToggle()}
        onProfileClick={() => router.push('/my-page/profile')}
        onSettingsClick={() => setIsShowSettings(true)}
        onMemoToggle={() => setIsMemoOpen(!isMemoOpen)}
        isMemoOpen={isMemoOpen}
        isDarkMode={isDarkMode}
      />

      <div className={`border-b px-6 py-3 transition-colors duration-300 ${isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'}`}>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-3">
              <h2 className={`min-w-0 truncate text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
                {templateTitle}
              </h2>
              {template?.category && (
                <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ${isDarkMode ? 'bg-[#1E293B] text-[#CBD5E1]' : 'bg-[#F1F5F9] text-[#475569]'}`}>
                  {template.category}
                </span>
              )}
            </div>
            <div className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              <span>{TEXT.functionalTemplate}{templateId != null ? ` · ID ${templateId}` : ''}</span>
              {template && <span>{TEXT.difficulty} {template.difficulty}</span>}
              {template && <span>{TEXT.views} {template.viewCount.toLocaleString()}</span>}
              {visibleTags.map((tag) => (
                <span key={tag} className={`rounded-md px-2 py-0.5 ${isDarkMode ? 'bg-[#0B1220]' : 'bg-[#F1F5F9]'}`}>
                  {tag}
                </span>
              ))}
              {template?.visibility && (
                <span className={`rounded-md px-2 py-0.5 ${isDarkMode ? 'bg-[#05202E] text-[#A7F3D0]' : 'bg-[#ECFDF5] text-[#047857]'}`}>
                  {template.visibility === 'PUBLIC' ? TEXT.public : template.visibility}
                </span>
              )}
            </div>
          </div>

          <div className="flex w-[30rem] shrink-0 items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className={isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}>{TEXT.progress}</span>
                <span className={`font-semibold ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#334155]'}`}>{progressPercent}%</span>
              </div>
              <div className={`h-2 overflow-hidden rounded-full ${isDarkMode ? 'bg-[#334155]' : 'bg-[#E2E8F0]'}`}>
                <div className="h-full rounded-full bg-[#7C3AED] transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleMarkComplete()}
              disabled={isCompleting || isCompleted}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
                isCompleted
                  ? isDarkMode
                    ? 'bg-[#064E3B] text-[#A7F3D0]'
                    : 'bg-[#ECFDF5] text-[#047857]'
                  : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-70'
              }`}
            >
              {isCompleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isCompleted ? TEXT.completed : isCompleting ? TEXT.saving : TEXT.complete}
            </button>
          </div>
        </div>
        {(completeMessage || completeError || favoriteError) && (
          <p className={`mx-auto mt-2 max-w-[1440px] text-xs ${completeError || favoriteError ? 'text-rose-500' : isDarkMode ? 'text-[#A7F3D0]' : 'text-[#047857]'}`}>
            {completeError || favoriteError || completeMessage}
          </p>
        )}
      </div>

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} isDarkMode={isDarkMode} />

      <div className={`relative flex min-h-0 flex-1 overflow-hidden ${isMemoOpen ? 'pr-80' : ''}`}>
        {isEditorOpen && hasPracticeFiles ? (
          <div className="flex min-w-0 flex-1 overflow-hidden">
            <section
              style={{ width: `${contentWidth}px` }}
              className={`min-w-0 overflow-y-auto border-r ${isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#F1F5F9] bg-white'}`}
            >
              <div className="mx-auto max-w-[880px] px-5 py-5 lg:px-6 lg:py-6">{renderContent()}</div>
            </section>

            <div
              onMouseDown={handleContentResizeStart}
              className={`relative w-1 cursor-col-resize transition-colors hover:bg-[#7C3AED] ${isDarkMode ? 'bg-[#334155]' : 'bg-[#CBD5E1]'}`}
            >
              <button
                type="button"
                aria-label={TEXT.editorClose}
                title={TEXT.editorClose}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={() => setIsEditorOpen(false)}
                className={`absolute left-1/2 top-8 z-20 flex h-12 w-8 -translate-x-1/2 items-center justify-center rounded-l-lg border-2 text-[#7C3AED] shadow-md transition-colors ${
                  isDarkMode
                    ? 'border-[#7C3AED] bg-[#1E293B] hover:bg-[#334155]'
                    : 'border-[#D8B4FE] bg-[#F3E8FF] hover:bg-[#EDE9FE]'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <div className={`flex h-14 items-center justify-between border-b px-4 ${isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'}`}>
                <div className="inline-flex items-center gap-2 font-semibold text-[#1E293B]">
                  <Play className="h-5 w-5 text-[#7C3AED]" />
                  <span className={isDarkMode ? 'text-white' : 'text-[#1E293B]'}>코드 실행기</span>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 overflow-hidden">
                <div
                  style={{ width: `${explorerWidth}px` }}
                  className={`min-w-0 border-r ${isDarkMode ? 'border-[#334155]' : 'border-[#E2E8F0]'}`}
                >
                  <FileExplorer
                    isDarkMode={isDarkMode}
                    activeFile={resolvedActiveFile}
                    files={editorFiles}
                    onFileSelect={setActiveFile}
                  />
                </div>

                <div
                  onMouseDown={handleExplorerResizeStart}
                  className={`w-1 cursor-col-resize transition-colors hover:bg-[#7C3AED] ${isDarkMode ? 'bg-[#334155]' : 'bg-[#E2E8F0]'}`}
                />

                <div className="min-w-0 flex-1 overflow-hidden">
                  <CodeEditor
                    fileName={resolvedActiveFile}
                    code={editorCode}
                    onCodeChange={(value) =>
                      setFileContents((current) => ({
                        ...current,
                        [resolvedActiveFile]: value,
                      }))
                    }
                    fileTabs={currentTabs}
                    activeFile={resolvedActiveFile}
                    onFileSelect={setActiveFile}
                    isDarkMode={isDarkMode}
                    hasContent={editorCode.length > 0}
                    onRun={() => void handleRunProject()}
                    isRunning={isRunning}
                    runOutput={runOutput}
                  />
                </div>
              </div>
            </section>
          </div>
        ) : (
          <>
            {hasPracticeFiles && (
              <button
                type="button"
                aria-label={TEXT.editorOpen}
                title={TEXT.editorOpen}
                onClick={() => openEditor()}
                className={`absolute right-0 top-8 z-20 flex h-12 w-8 items-center justify-center rounded-l-lg border-2 border-r-0 text-[#7C3AED] shadow-md transition-colors ${
                  isDarkMode
                    ? 'border-[#7C3AED] bg-[#1E293B] hover:bg-[#334155]'
                    : 'border-[#D8B4FE] bg-[#F3E8FF] hover:bg-[#EDE9FE]'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <section className={`min-w-0 flex-1 overflow-y-auto ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
              <div className="mx-auto max-w-[1040px] px-5 py-5 lg:px-6 lg:py-6">{renderContent()}</div>
            </section>
            {renderLearningSidebar()}
          </>
        )}

        {isMemoOpen && <MemoPanel isDarkMode={isDarkMode} onClose={() => setIsMemoOpen(false)} />}
      </div>

      <div className={`flex h-14 items-center border-t px-6 ${isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#F1F5F9] bg-white'}`}>
        <button
          type="button"
          onClick={() => router.push('/functional-template-hub')}
          className={`flex items-center gap-2 rounded p-2 ${isDarkMode ? 'text-[#94A3B8] hover:bg-[#334155]' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">{TEXT.list}</span>
        </button>

        <div className="flex-1" />

        <div className={`flex items-center gap-3 text-sm ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
          <ChevronLeft className="h-4 w-4" />
          <span>{TEXT.previousLesson}</span>
          <span className={isDarkMode ? 'text-[#64748B]' : 'text-[#CBD5E1]'}>|</span>
          <span>{TEXT.nextLesson}</span>
          <ChevronRight className="h-4 w-4" />
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
