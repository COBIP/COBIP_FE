'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Layers3, Play, Sparkles } from 'lucide-react';
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
  getTemplatePractice,
  submitTemplatePracticeCode,
  submitTemplatePracticeProject,
  type TemplateDetailApiResponse,
  type TemplatePracticeDetailApiResponse,
  type TemplatePracticeFileApiResponse,
  type TemplatePracticeMissionApiResponse,
  type TemplatePracticeMissionType,
  type TemplatePracticeProgressApiResponse,
  type TemplatePracticeSubmissionResponse,
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
  template?: TemplateDetailViewModel | null;
  practice?: TemplatePracticeDetailApiResponse | null;
}

type TemplateDetailViewModel = TemplateDetailApiResponse & {
  summary?: string | null;
  tags?: string[];
  source?: string | null;
  license?: string | null;
};

type PracticeMissionViewModel = TemplatePracticeMissionApiResponse & {
  type?: TemplatePracticeMissionType;
};

function checkProblemMissionType(missionType?: string) {
  return missionType === 'DEBUGGING' || missionType === 'TEST';
}

function getPracticeMissionType(mission: PracticeMissionViewModel) {
  return mission.missionType ?? mission.type;
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

function getStringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getArrayFirstString(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const first = value.find((item) => typeof item === 'string' && item.trim());
  return getStringValue(first);
}

function getNestedFilePath(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  return (
    getStringValue(record.filePath) ??
    getStringValue(record.path) ??
    getStringValue(record.targetFilePath) ??
    getStringValue(record.targetFile)
  );
}

function getMissionFilePath(
  mission: TemplatePracticeMissionApiResponse,
  files: TemplatePracticeFileApiResponse[],
  fallbackIndex: number,
) {
  const validation = mission.validationJson ?? {};
  const directPath =
    getStringValue(validation.filePath) ??
    getStringValue(validation.path) ??
    getStringValue(validation.targetFilePath) ??
    getStringValue(validation.targetFile) ??
    getStringValue(validation.mainFile) ??
    getStringValue(validation.entryFile) ??
    getArrayFirstString(validation.files) ??
    getNestedFilePath(Array.isArray(validation.files) ? validation.files[0] : null);

  if (directPath && files.some((file) => file.filePath === directPath)) {
    return directPath;
  }

  const mentionedFile = files.find((file) => {
    const text = `${mission.title}\n${mission.description}\n${mission.guideContent}`;
    return text.includes(file.filePath) || text.includes(file.filePath.split('/').at(-1) ?? file.filePath);
  });

  return mentionedFile?.filePath ?? files[fallbackIndex]?.filePath ?? files[0]?.filePath ?? 'main.java';
}

function getReferenceSource(value?: string | null) {
  const source = value?.trim();

  if (!source) return null;

  return /^https?:\/\//i.test(source) ? source : null;
}

function checkStalePracticeProgress(
  progress: TemplatePracticeProgressApiResponse | null,
  totalMissionCount: number,
) {
  return Boolean(progress && totalMissionCount > 0 && progress.completedMissionCount > totalMissionCount);
}

function checkCodeValidationMission(mission?: TemplatePracticeMissionApiResponse | null) {
  const validationJson = mission?.validationJson;

  if (!validationJson) return false;
  if (Array.isArray(validationJson.testCases) && validationJson.testCases.length > 0) return true;

  return typeof validationJson.expectedOutput === 'string' && validationJson.expectedOutput.length > 0;
}

function checkProjectValidationMission(mission?: TemplatePracticeMissionApiResponse | null) {
  const validationJson = mission?.validationJson;

  if (!validationJson) return false;

  return (
    typeof validationJson.testCommand === 'string' && validationJson.testCommand.trim().length > 0
  ) || (
    typeof validationJson.runCommand === 'string' && validationJson.runCommand.trim().length > 0
  );
}

function getCodingLanguageByFilePath(filePath: string) {
  const extension = filePath.split('.').pop()?.toLowerCase();

  if (extension === 'py') return 'PYTHON';
  if (extension === 'js' || extension === 'jsx' || extension === 'ts' || extension === 'tsx') return 'JAVASCRIPT';

  return 'JAVA';
}

function getPracticeCodeStorageKey(templateId?: number | null) {
  return templateId ? `cobip:template:${templateId}:practice-code` : null;
}

function getPracticeCompletedStorageKey(templateId?: number | null) {
  return templateId ? `cobip:template:${templateId}:completed-missions` : null;
}

function getJsonFromStorage<T>(key: string | null, fallback: T): T {
  if (!key || typeof window === 'undefined') return fallback;

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setJsonToStorage(key: string | null, value: unknown) {
  if (!key || typeof window === 'undefined') return;

  window.localStorage.setItem(key, JSON.stringify(value));
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
  const [localPractice, setLocalPractice] = useState<TemplatePracticeDetailApiResponse | null>(practice ?? null);
  const [contentWidth, setContentWidth] = useState(760);
  const [explorerWidth, setExplorerWidth] = useState(260);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [completedMissionIds, setCompletedMissionIds] = useState<Set<number>>(() => new Set());
  const [runOutput, setRunOutput] = useState('');
  const [submissionResult, setSubmissionResult] = useState<TemplatePracticeSubmissionResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [practiceProgress, setPracticeProgress] = useState<TemplatePracticeProgressApiResponse | null>(
    practice?.progress ?? null,
  );
  const [isFavorite, setIsFavorite] = useState(Boolean(template?.favorited));
  const [isFavoriteSaving, setIsFavoriteSaving] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');

  const resizingRef = useRef<'content' | 'explorer' | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const isDarkMode = themeMode === 'dark';

  const practiceFiles = useMemo(
    () => [...(localPractice?.files ?? [])].sort((left, right) => left.orderIndex - right.orderIndex || left.filePath.localeCompare(right.filePath)),
    [localPractice?.files],
  );
  const practiceMissions = useMemo(
    () => [...(localPractice?.missions ?? [])].sort((left, right) => left.orderIndex - right.orderIndex),
    [localPractice?.missions],
  );
  const missionItems = useMemo(
    () => practiceMissions.filter((mission) => !checkProblemMissionType(getPracticeMissionType(mission))),
    [practiceMissions],
  );
  const problemItems = useMemo(
    () => practiceMissions.filter((mission) => checkProblemMissionType(getPracticeMissionType(mission))),
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
  const activeMission = useMemo(
    () => practiceMissions.find((mission) => mission.id === activeMissionId) ?? practiceMissions[0] ?? null,
    [activeMissionId, practiceMissions],
  );
  const progressPercent = useMemo(() => {
    if (!practiceProgress) return 0;

    if (practiceMissions.length > 0) {
      if (checkStalePracticeProgress(practiceProgress, practiceMissions.length)) {
        return 0;
      }

      return Math.min(
        100,
        Math.max(0, Math.round((practiceProgress.completedMissionCount / practiceMissions.length) * 100)),
      );
    }

    return Math.min(100, Math.max(0, practiceProgress.progressPercent));
  }, [practiceMissions.length, practiceProgress]);
  const hasStalePracticeProgress = checkStalePracticeProgress(practiceProgress, practiceMissions.length);
  const isCompleted = !hasStalePracticeProgress && practiceProgress?.status === 'COMPLETED' && progressPercent >= 100;
  const visibleTags = (template?.tags && template.tags.length > 0 ? template.tags : template?.techStacks ?? []).slice(0, 3);

  const learningPoint = useMemo(() => {
    return template?.summary || template?.description || TEXT.defaultLearningPoint;
  }, [template?.description, template?.summary]);
  const conceptKeywords = useMemo(() => {
    const keywords = template?.tags && template.tags.length > 0 ? [...template.tags] : [...(template?.techStacks ?? [])];
    if (template?.category) keywords.unshift(template.category);
    return Array.from(new Set(keywords.filter(Boolean))).slice(0, 4);
  }, [template?.category, template?.tags, template?.techStacks]);
  const references = useMemo(() => {
    const refs = [
      getReferenceSource(template?.source),
      template?.license ? `License: ${template.license}` : null,
    ].filter((reference): reference is string => Boolean(reference));

    return Array.from(new Set(refs)).slice(0, 3);
  }, [template?.license, template?.source]);

  useEffect(() => {
    setLocalPractice(practice ?? null);
    setPracticeProgress(practice?.progress ?? null);
  }, [practice]);

  useEffect(() => {
    setIsFavorite(Boolean(template?.favorited));
  }, [template?.favorited]);

  useEffect(() => {
    const storedCode = getJsonFromStorage<Record<string, string>>(getPracticeCodeStorageKey(templateId), {});
    const nextFileContents = Object.fromEntries(
      practiceFiles.map((file) => [file.filePath, storedCode[file.filePath] ?? file.content]),
    );

    setFileContents(nextFileContents);
    if (practiceFiles[0]) setActiveFile(practiceFiles[0].filePath);
    if (practiceMissions[0]) setActiveMissionId(practiceMissions[0].id);

    const missionIds = new Set(practiceMissions.map((mission) => mission.id));
    const storedCompletedIds = getJsonFromStorage<number[]>(getPracticeCompletedStorageKey(templateId), []);
    setCompletedMissionIds(new Set(storedCompletedIds.filter((missionId) => missionIds.has(missionId))));
  }, [practiceFiles, practiceMissions, templateId]);

  const refreshPractice = async () => {
    if (!templateId) return;
    const nextPractice = await getTemplatePractice(templateId);
    setLocalPractice(nextPractice);
    setPracticeProgress(nextPractice.progress ?? null);
    if (nextPractice.progress?.currentMissionId) {
      setActiveMissionId(nextPractice.progress.currentMissionId);
    }
  };

  const openEditor = async (filePath?: string, missionId?: number) => {
    if (filePath) setActiveFile(filePath);
    else if (practiceFiles[0]) setActiveFile(practiceFiles[0].filePath);
    const nextMissionId = missionId ?? activeMissionId ?? practiceMissions[0]?.id ?? null;
    setActiveMissionId(nextMissionId);
    setIsEditorOpen(true);

    if (templateId) {
      try {
        const progress = await createTemplatePracticeStart(templateId);
        setPracticeProgress(progress);
        setSubmissionResult(null);
      } catch {
        // 에디터 열기는 진행되어야 하므로 시작 기록 실패는 조용히 무시합니다.
      }
    }
  };

  const buildProjectFiles = () =>
    practiceFiles.map((file) => ({
      filePath: file.filePath,
      content: fileContents[file.filePath] ?? file.content,
    }));

  const persistFileContents = (nextFileContents: Record<string, string>) => {
    setJsonToStorage(getPracticeCodeStorageKey(templateId), nextFileContents);
  };

  const persistCompletedMissionIds = (nextCompletedMissionIds: Set<number>) => {
    setJsonToStorage(getPracticeCompletedStorageKey(templateId), [...nextCompletedMissionIds]);
  };

  const updateEditorCode = (filePath: string, value: string) => {
    setFileContents((current) => {
      const nextFileContents = {
        ...current,
        [filePath]: value,
      };
      persistFileContents(nextFileContents);
      return nextFileContents;
    });
  };

  const markMissionCompleted = (missionId: number) => {
    setCompletedMissionIds((current) => {
      const nextCompletedMissionIds = new Set(current);
      nextCompletedMissionIds.add(missionId);
      persistCompletedMissionIds(nextCompletedMissionIds);
      return nextCompletedMissionIds;
    });
  };

  const handleRunProject = async () => {
    if (!templateId || isRunning) return;
    const missionId = activeMissionId ?? practiceMissions[0]?.id;

    if (!missionId) {
      setRunOutput('실행할 미션이나 문제를 먼저 선택해주세요.');
      return;
    }

    setIsRunning(true);
    setRunOutput('실행 중...');
    setSubmissionResult(null);

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

  const handleSubmitProject = async () => {
    if (!templateId || isSubmitting) return;
    const missionId = activeMission?.id;

    if (!missionId) {
      setRunOutput('제출할 미션이나 문제를 먼저 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setRunOutput('제출 중...');
    setSubmissionResult(null);

    try {
      const result = checkCodeValidationMission(activeMission) && !checkProjectValidationMission(activeMission)
        ? await submitTemplatePracticeCode(templateId, missionId, {
            language: getCodingLanguageByFilePath(resolvedActiveFile),
            sourceCode: editorCode,
          })
        : await submitTemplatePracticeProject(templateId, missionId, buildProjectFiles());
      setSubmissionResult(result);
      persistFileContents(fileContents);
      if (result.status === 'ACCEPTED') {
        markMissionCompleted(missionId);
      }
      setRunOutput(
        [
          `status: ${result.status}`,
          `passed: ${result.passedCount}/${result.totalCount}`,
          result.stdout ? `stdout:\n${result.stdout}` : '',
          result.stderr ? `stderr:\n${result.stderr}` : '',
          result.compileOutput ? `compile:\n${result.compileOutput}` : '',
          result.message ? `message:\n${result.message}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      );
      await refreshPractice();
    } catch (error) {
      setRunOutput(error instanceof Error ? error.message : '제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
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
            activeMissionId={activeMissionId}
            completedMissionIds={completedMissionIds}
            onOpenEditor={openEditor}
            missions={missionItems.map((mission, index) => ({
              ...mission,
              fileName: getMissionFilePath(mission, practiceFiles, index),
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
            activeMissionId={activeMissionId}
            completedMissionIds={completedMissionIds}
            onOpenEditor={openEditor}
            missions={problemItems.map((mission, index) => ({
              ...mission,
              fileName: getMissionFilePath(mission, practiceFiles, index),
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

        {references.length > 0 && (
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
        )}
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
            <div
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold ${
                isCompleted
                  ? isDarkMode
                    ? 'bg-[#064E3B] text-[#A7F3D0]'
                    : 'bg-[#ECFDF5] text-[#047857]'
                  : isDarkMode
                    ? 'bg-[#1E293B] text-[#CBD5E1]'
                    : 'bg-[#F1F5F9] text-[#475569]'
              }`}
              title="실행이 아니라 제출 채점에 통과하면 자동으로 진행률이 올라갑니다."
            >
              <CheckCircle2 className="h-4 w-4" />
              {isCompleted ? TEXT.completed : '제출 완료 시 반영'}
            </div>
          </div>
        </div>
        {favoriteError && (
          <p className="mx-auto mt-2 max-w-[1440px] text-xs text-rose-500">
            {favoriteError}
          </p>
        )}
      </div>

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} isDarkMode={isDarkMode} />

      <div className={`relative flex min-h-0 flex-1 overflow-hidden ${isMemoOpen ? 'pr-80' : ''}`}>
        {isEditorOpen ? (
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
                    onCodeChange={(value) => updateEditorCode(resolvedActiveFile, value)}
                    fileTabs={currentTabs}
                    activeFile={resolvedActiveFile}
                    onFileSelect={setActiveFile}
                    isDarkMode={isDarkMode}
                    hasContent={hasPracticeFiles}
                    onRun={() => void handleRunProject()}
                    onSubmit={() => void handleSubmitProject()}
                    isRunning={isRunning}
                    isSubmitting={isSubmitting}
                    runOutput={runOutput}
                    submissionResult={submissionResult}
                  />
                </div>
              </div>
            </section>
          </div>
        ) : (
          <>
            <button
              type="button"
              aria-label={TEXT.editorOpen}
              title={TEXT.editorOpen}
              onClick={() => void openEditor()}
              className={`absolute right-0 top-8 z-20 flex h-12 w-8 items-center justify-center rounded-l-lg border-2 border-r-0 text-[#7C3AED] shadow-md transition-colors ${
                isDarkMode
                  ? 'border-[#7C3AED] bg-[#1E293B] hover:bg-[#334155]'
                  : 'border-[#D8B4FE] bg-[#F3E8FF] hover:bg-[#EDE9FE]'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
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
