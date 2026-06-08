import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Menu, Bookmark, Bot, Settings, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { grammarTemplateService } from '@/api/services/GrammarTemplateService';
import { syncLearningActivityHeartbeat } from '@/api/services/DashboardService';
import { AiChatPanel, type ChatMessage } from '@/components/ai/AiChatPanel';
import type {
  GrammarTemplateDetail,
  GrammarTemplateMissionSubmissionResponse,
  GrammarTemplatePracticeFile,
} from '@/features/grammar-template/Constants';
import { CodeRunner } from './CodeRunner';
import { TiptapRenderer } from './TiptapRenderer';

interface GrammarDetailViewProps {
  templateId: number;
  onBack: () => void;
}

const STUDY_HEARTBEAT_INTERVAL_MS = 15000;
const STUDY_HEARTBEAT_MAX_SECONDS = 60;
const STUDY_HEARTBEAT_MIN_SECONDS = 1;

// ===== 탐색기 트리 타입 (CodeRunner와 공유) =====
export interface ExplorerFile { name: string; type: 'file'; }
export interface ExplorerFolder { name: string; type: 'folder'; isOpen: boolean; children: ExplorerNode[]; }
export type ExplorerNode = ExplorerFile | ExplorerFolder;

function buildDefaultPracticeFile(language?: string) {
  if (language === 'JAVA') {
    return {
      filePath: 'src/Main.java',
      content: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, COBIP");\n    }\n}',
    };
  }
  if (language === 'JAVASCRIPT') {
    return {
      filePath: 'src/main.js',
      content: 'console.log("Hello, COBIP");',
    };
  }
  return {
    filePath: 'src/main.py',
    content: 'print("Hello, COBIP")',
  };
}

function findOrCreateFolder(nodes: ExplorerNode[], name: string): ExplorerFolder {
  const existing = nodes.find((node): node is ExplorerFolder => node.type === 'folder' && node.name === name);
  if (existing) {
    existing.isOpen = true;
    return existing;
  }
  const folder: ExplorerFolder = { name, type: 'folder', isOpen: true, children: [] };
  nodes.push(folder);
  return folder;
}

function applyFileToTree(nodes: ExplorerNode[], filePath: string) {
  const parts = filePath.split('/').filter(Boolean);
  if (!parts.length) return;

  let children = nodes;
  for (const folderName of parts.slice(0, -1)) {
    children = findOrCreateFolder(children, folderName).children;
  }

  const fileName = parts[parts.length - 1];
  if (!children.some((node) => node.type === 'file' && node.name === fileName)) {
    children.push({ name: fileName, type: 'file' });
  }
}

function applyFolderToTree(nodes: ExplorerNode[], folderPath: string) {
  const parts = folderPath.split('/').filter(Boolean);
  let children = nodes;
  for (const folderName of parts) {
    children = findOrCreateFolder(children, folderName).children;
  }
}

function buildPracticeWorkspace(practiceFiles: GrammarTemplatePracticeFile[], language?: string) {
  const files = practiceFiles.length
    ? [...practiceFiles].sort((a, b) => a.orderIndex - b.orderIndex || a.filePath.localeCompare(b.filePath))
    : [{ ...buildDefaultPracticeFile(language), nodeType: 'FILE' as const, orderIndex: 0 }];
  const tree: ExplorerNode[] = [];
  const contents: Record<string, string> = {};

  for (const file of files) {
    if (file.nodeType === 'FOLDER') {
      applyFolderToTree(tree, file.filePath);
      continue;
    }
    applyFileToTree(tree, file.filePath);
    contents[file.filePath] = file.content ?? '';
  }

  const firstFilePath = files.find((file) => file.nodeType === 'FILE')?.filePath ?? '';
  return { tree, contents, firstFilePath };
}

function formatTextPreview(value: string, maxLength = 3000) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}\n...` : value;
}

function parseChapterNumber(title: string) {
  const trimmedTitle = title.trim();
  const subchapterMatch = trimmedTitle.match(/^(\d+)\.(\d+)(?=\s|$)/);

  if (subchapterMatch) {
    return {
      major: Number(subchapterMatch[1]),
      minor: Number(subchapterMatch[2]),
      isSubchapter: true,
    };
  }

  const chapterMatch = trimmedTitle.match(/^(\d+)\.(?=\s|$)/);

  if (chapterMatch) {
    return {
      major: Number(chapterMatch[1]),
      minor: null,
      isSubchapter: false,
    };
  }

  return null;
}

type ChapterListItem = {
  chapter: GrammarTemplateDetail['chapters'][number];
  index: number;
};

type ChapterGroup = {
  main: ChapterListItem;
  subchapters: ChapterListItem[];
};

type ChapterContentTab = 'theory' | 'problems' | 'missions';

type ActiveSubmissionTarget = {
  id: number;
  type: 'problem' | 'mission';
  typeLabel: '문제' | '미션';
  title: string;
};

function getSubmissionStatusLabel(status?: string) {
  switch (status) {
    case 'ACCEPTED':
      return '정답';
    case 'WRONG_ANSWER':
      return '오답';
    case 'COMPILE_ERROR':
      return '컴파일 오류';
    case 'RUNTIME_ERROR':
      return '채점 실패';
    case 'TIME_LIMIT_EXCEEDED':
      return '시간 초과';
    case 'INTERNAL_ERROR':
      return '서버 오류';
    default:
      return status ?? '결과 확인 필요';
  }
}

function getSubmissionSummaryMessage(status?: string, message?: string | null) {
  switch (status) {
    case 'ACCEPTED':
      return message || '제출한 코드가 채점 기준을 통과했습니다.';
    case 'WRONG_ANSWER':
      return '제출한 코드가 문제의 정답 조건을 만족하지 않았습니다.';
    case 'COMPILE_ERROR':
      return '코드가 컴파일되지 않아 채점을 진행할 수 없습니다.';
    case 'RUNTIME_ERROR':
      return '제출한 코드가 정답 조건을 만족하지 않았거나 채점 명령 실행에 실패했습니다.';
    case 'TIME_LIMIT_EXCEEDED':
      return '채점 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.';
    case 'INTERNAL_ERROR':
      return '채점 중 서버 오류가 발생했습니다.';
    default:
      return message || '';
  }
}

function checkSubmissionStderrHidden(status?: string, stderr?: string | null) {
  if (!stderr?.trim()) return true;
  if (status === 'ACCEPTED' && stderr.includes("Unable to find image '")) {
    return true;
  }

  return false;
}

function buildChapterGroups(chapters: GrammarTemplateDetail['chapters'] = []): ChapterGroup[] {
  const groups: ChapterGroup[] = [];
  let currentGroup: ChapterGroup | null = null;

  for (const [index, chapter] of chapters.entries()) {
    const item = { chapter, index };
    const chapterNumber = parseChapterNumber(chapter.title);

    if (!chapterNumber || !chapterNumber.isSubchapter) {
      currentGroup = {
        main: item,
        subchapters: [],
      };
      groups.push(currentGroup);
      continue;
    }

    if (currentGroup && parseChapterNumber(currentGroup.main.chapter.title)?.major === chapterNumber.major) {
      currentGroup.subchapters.push(item);
      continue;
    }

    currentGroup = {
      main: item,
      subchapters: [],
    };
    groups.push(currentGroup);
  }

  return groups;
}

export function GrammarDetailView({ templateId, onBack }: GrammarDetailViewProps) {
  const [template, setTemplate] = useState<GrammarTemplateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>([]);
  const [aiChatPanelWidth, setAiChatPanelWidth] = useState(416);
  const [runnerWidth, setRunnerWidth] = useState(760);
  const [explorerWidth, setExplorerWidth] = useState(200);
  const [outputHeight, setOutputHeight] = useState(140);
    const [activeFilePath, setActiveFilePath] = useState('');
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [explorerTree, setExplorerTree] = useState<ExplorerNode[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [activeContentTab, setActiveContentTab] = useState<ChapterContentTab>('theory');
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [selectedProblemTitle, setSelectedProblemTitle] = useState('');
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [selectedMissionTitle, setSelectedMissionTitle] = useState('');
  const [isSubmittingMission, setIsSubmittingMission] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<GrammarTemplateMissionSubmissionResponse | null>(null);
  const [submissionError, setSubmissionError] = useState('');
  const currentChapter = template?.chapters?.[currentChapterIndex] ?? null;
  const currentChapterId = currentChapter?.id ?? null;
  const chapterGroups = useMemo(() => buildChapterGroups(template?.chapters), [template?.chapters]);
  const problemItems = useMemo(
    () => (currentChapter?.missions ?? []).filter((mission) => mission.missionType === 'PROBLEM'),
    [currentChapter?.missions],
  );
  const missionItems = useMemo(
    () => (currentChapter?.missions ?? []).filter((mission) => mission.missionType === 'MISSION'),
    [currentChapter?.missions],
  );
  const activeSubmissionTarget = useMemo<ActiveSubmissionTarget | null>(() => {
    if (selectedProblemId) {
      return {
        id: selectedProblemId,
        type: 'problem',
        typeLabel: '문제',
        title: selectedProblemTitle,
      };
    }

    if (selectedMissionId) {
      return {
        id: selectedMissionId,
        type: 'mission',
        typeLabel: '미션',
        title: selectedMissionTitle,
      };
    }

    return null;
  }, [selectedMissionId, selectedMissionTitle, selectedProblemId, selectedProblemTitle]);
  const aiChatContext = useMemo(() => {
    const activeCode = fileContents[activeFilePath] ?? '';
    const parts = [
      '화면: 문법 템플릿 학습',
      template?.title ? `템플릿: ${template.title}` : '',
      template?.category ? `카테고리: ${template.category}` : '',
      template?.difficulty ? `난이도: ${template.difficulty}` : '',
      currentChapter ? `현재 챕터: ${currentChapter.title}` : '',
      activeFilePath ? `현재 파일: ${activeFilePath}` : '',
      activeCode ? `현재 코드:\n${formatTextPreview(activeCode)}` : '',
    ];

    return parts.filter(Boolean).join('\n\n');
  }, [activeFilePath, currentChapter, fileContents, template?.category, template?.difficulty, template?.title]);
  const studyHeartbeatPendingSecondsRef = useRef(0);
  const studyHeartbeatLastTickRef = useRef<number | null>(null);

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

  useEffect(() => {
    const chapter = template?.chapters?.[currentChapterIndex];
    if (!chapter) {
      const fallback = buildPracticeWorkspace([], template?.language);
      setExplorerTree(fallback.tree);
      setFileContents(fallback.contents);
      setActiveFilePath(fallback.firstFilePath);
      return;
    }

    const workspace = buildPracticeWorkspace(chapter.practiceFiles ?? [], template?.language);
    setExplorerTree(workspace.tree);
    setFileContents(workspace.contents);
    setActiveFilePath(workspace.firstFilePath);
  }, [template, currentChapterIndex]);

  useEffect(() => {
    setActiveContentTab('theory');
    setSelectedProblemId(null);
    setSelectedProblemTitle('');
    setSelectedMissionId(null);
    setSelectedMissionTitle('');
    setSubmissionResult(null);
    setSubmissionError('');
  }, [currentChapterId]);

  useEffect(() => {
    if (!template) return;

    void syncLearningActivityHeartbeat(templateId, 1, 'GRAMMAR_TEMPLATE', currentChapterId)
      .catch(() => undefined);
  }, [template, templateId, currentChapterId]);

  useEffect(() => {
    if (!template || typeof window === 'undefined') return undefined;

    let isDisposed = false;
    let isVisible = document.visibilityState === 'visible';

    studyHeartbeatPendingSecondsRef.current = 0;
    studyHeartbeatLastTickRef.current = Date.now();

    const updatePendingStudySeconds = () => {
      const now = Date.now();
      const lastTick = studyHeartbeatLastTickRef.current ?? now;
      studyHeartbeatLastTickRef.current = now;

      if (!isVisible) return;

      const elapsedSeconds = Math.floor((now - lastTick) / 1000);
      if (elapsedSeconds <= 0) return;

      studyHeartbeatPendingSecondsRef.current += elapsedSeconds;
    };

    const syncStudyHeartbeat = (force = false) => {
      const secondsToRecord = Math.min(
        STUDY_HEARTBEAT_MAX_SECONDS,
        Math.floor(studyHeartbeatPendingSecondsRef.current),
      );
      const minimumSeconds = force ? STUDY_HEARTBEAT_MIN_SECONDS : STUDY_HEARTBEAT_INTERVAL_MS / 1000;

      if (secondsToRecord < minimumSeconds) return;

      studyHeartbeatPendingSecondsRef.current -= secondsToRecord;

      void syncLearningActivityHeartbeat(templateId, secondsToRecord, 'GRAMMAR_TEMPLATE', currentChapterId)
        .catch(() => {
          if (!isDisposed) {
            studyHeartbeatPendingSecondsRef.current += secondsToRecord;
          }
        });
    };

    const handleStudyHeartbeatTick = () => {
      updatePendingStudySeconds();
      syncStudyHeartbeat();
    };

    const handleVisibilityChange = () => {
      updatePendingStudySeconds();
      isVisible = document.visibilityState === 'visible';
      studyHeartbeatLastTickRef.current = Date.now();

      if (!isVisible) {
        syncStudyHeartbeat(true);
      }
    };

    const intervalId = window.setInterval(handleStudyHeartbeatTick, STUDY_HEARTBEAT_INTERVAL_MS);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      updatePendingStudySeconds();
      syncStudyHeartbeat(true);
      isDisposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [template, templateId, currentChapterId]);

  const resizingRef = useRef<'runner' | 'explorer' | 'output' | 'aiChat' | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(760);
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

  const handleOpenAiChat = useCallback(() => {
    setIsRunnerOpen(true);
    setIsAiChatOpen(true);
  }, []);

  const handleToggleRunner = useCallback(() => {
    const isNextRunnerOpen = !isRunnerOpen;
    setIsRunnerOpen(isNextRunnerOpen);
    if (!isNextRunnerOpen) {
      setIsAiChatOpen(false);
    }
  }, [isRunnerOpen]);

  const handleStartProblemSolving = useCallback((problemId: number, problemTitle: string) => {
    setSelectedProblemId(problemId);
    setSelectedProblemTitle(problemTitle);
    setSelectedMissionId(null);
    setSelectedMissionTitle('');
    setActiveContentTab('problems');
    setSubmissionResult(null);
    setSubmissionError('');
    setIsRunnerOpen(true);
  }, []);

  const handleStartMission = useCallback((missionId: number, missionTitle: string) => {
    setSelectedMissionId(missionId);
    setSelectedMissionTitle(missionTitle);
    setSelectedProblemId(null);
    setSelectedProblemTitle('');
    setActiveContentTab('missions');
    setSubmissionResult(null);
    setSubmissionError('');
    setIsRunnerOpen(true);
  }, []);

  const handleSubmitMission = useCallback(async () => {
    if (!template?.language || !currentChapterId || !activeSubmissionTarget || isSubmittingMission) {
      return;
    }

    setIsSubmittingMission(true);
    setSubmissionError('');

    try {
      const submittedCode = Object.entries(fileContents)
        .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
        .map(([filePath, content]) => ({ filePath, content }));

      const result = await grammarTemplateService.submitMission(templateId, currentChapterId, activeSubmissionTarget.id, {
        language: template.language,
        submittedCode,
      });

      setSubmissionResult(result);
    } catch (submitError) {
      if (submitError && typeof submitError === 'object') {
        const axiosError = submitError as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setSubmissionError(
          axiosError.response?.data?.message ??
            axiosError.message ??
            '제출 결과를 확인하지 못했습니다.',
        );
      } else {
        setSubmissionError('제출 결과를 확인하지 못했습니다.');
      }
      setSubmissionResult(null);
    } finally {
      setIsSubmittingMission(false);
    }
  }, [activeSubmissionTarget, currentChapterId, fileContents, isSubmittingMission, template?.language, templateId]);

  const isSubmissionAccepted = submissionResult?.status === 'ACCEPTED';
  const hasSubmissionFeedback = Boolean(submissionResult || submissionError);
  const submissionStatusLabel = getSubmissionStatusLabel(submissionResult?.status);
  const submissionSummaryMessage = submissionError
    ? submissionError
    : getSubmissionSummaryMessage(submissionResult?.status, submissionResult?.message);
  const visibleSubmissionStderr = checkSubmissionStderrHidden(submissionResult?.status, submissionResult?.stderr)
    ? ''
    : submissionResult?.stderr ?? '';

  const handleRetrySubmission = useCallback(() => {
    setSubmissionResult(null);
    setSubmissionError('');
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

  const handleAiChatResizeStart = useCallback((e: React.MouseEvent) => {
    resizingRef.current = 'aiChat'; startXRef.current = e.clientX; startWidthRef.current = aiChatPanelWidth;
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
  }, [aiChatPanelWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      if (resizingRef.current === 'runner') {
        setRunnerWidth(Math.min(Math.max(startWidthRef.current + (startXRef.current - e.clientX), 520), 960));
      } else if (resizingRef.current === 'explorer') {
        setExplorerWidth(Math.min(Math.max(startWidthRef.current + (e.clientX - startXRef.current), 100), 300));
      } else if (resizingRef.current === 'output') {
        setOutputHeight(Math.min(Math.max(startHeightRef.current + (startYRef.current - e.clientY), 60), 400));
      } else if (resizingRef.current === 'aiChat') {
        setAiChatPanelWidth(Math.min(Math.max(startWidthRef.current + (startXRef.current - e.clientX), 320), 720));
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
          <div className="mr-2 flex items-center gap-2">
            {activeSubmissionTarget ? (
              <span className="hidden h-10 rounded-lg border border-purple-200 bg-purple-50 px-3 text-xs font-semibold text-purple-700 lg:inline-flex items-center">
                현재 {activeSubmissionTarget.typeLabel}: {activeSubmissionTarget.title}
              </span>
            ) : (
              <span className="hidden h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-400 lg:inline-flex items-center">
                문제 또는 미션 선택 후 제출 가능
              </span>
            )}
            <button
              type="button"
              onClick={() => void handleSubmitMission()}
              disabled={!activeSubmissionTarget}
              className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition ${
                activeSubmissionTarget
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
              }`}
            >
              {isSubmittingMission ? '제출 중' : '제출'}
            </button>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer group relative">
            <Bookmark className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
          </button>
          <button
            type="button"
            onClick={handleOpenAiChat}
            className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer group relative"
            title="AI 채팅"
            aria-label="AI 채팅"
          >
            <Bot className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer group relative">
            <Settings className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
          </button>
          <div className="w-7 h-7 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">U</div>
          <button onClick={onBack} className="ml-2 inline-flex h-10 items-center gap-1 rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700 cursor-pointer">
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
                  {chapterGroups.map((group) => (
                    <li key={group.main.chapter.id} className="space-y-0.5">
                      <button
                        onClick={() => setCurrentChapterIndex(group.main.index)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                          group.main.index === currentChapterIndex
                            ? 'bg-purple-100 text-purple-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="truncate">{group.main.chapter.title}</span>
                      </button>

                      {group.subchapters.length > 0 && (
                        <ul className="space-y-0.5 pl-3">
                          {group.subchapters.map((item) => (
                            <li key={item.chapter.id}>
                              <button
                                onClick={() => setCurrentChapterIndex(item.index)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                                  item.index === currentChapterIndex
                                    ? 'bg-purple-100 text-purple-700 font-semibold'
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                              >
                                <span className="truncate">{item.chapter.title}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
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
            {!isRunnerOpen && (
              <button
                onClick={handleToggleRunner}
                className="absolute right-0 top-14 z-20 flex w-10 items-center justify-center rounded-l-lg border border-t-2 border-b-2 border-l-2 border-r-0 border-purple-200 bg-purple-50 px-2 py-3 text-purple-500 shadow-sm transition hover:border-purple-300 hover:bg-purple-100 hover:text-purple-700 cursor-pointer group"
              >
                <ChevronLeft className="w-5 h-5 transition-transform duration-200" />
                <span className="absolute right-full mr-1.5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-purple-200 bg-white px-2 py-1 text-[11px] font-medium text-purple-600 opacity-0 shadow-sm transition-opacity pointer-events-none group-hover:opacity-100">
                  실행기 열기
                </span>
              </button>
            )}

                    <main className="overflow-y-auto flex-1">
            <div className="max-w-4xl mx-auto px-8 py-10">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{template?.title}</h1>
              {template?.chapters && template.chapters.length > 0 && currentChapterIndex < template.chapters.length && (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">{template.chapters[currentChapterIndex].title}</h2>
                  <div className="mb-6 flex flex-wrap gap-3 border-b border-gray-200">
                    {([
                      ['theory', '이론'],
                      ['problems', '문제'],
                      ['missions', '미션'],
                    ] as const).map(([tab, label]) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveContentTab(tab)}
                        className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                          activeContentTab === tab
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {activeContentTab === 'theory' ? (
                    <TiptapRenderer content={template.chapters[currentChapterIndex].contentJson} />
                  ) : null}

                  {activeContentTab === 'problems' ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-purple-50 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
                            Q
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-purple-700">문제 안내</h3>
                            <p className="mt-2 text-sm leading-6 text-gray-700">
                              이 챕터의 문제 목록입니다. 문제를 선택하거나 풀이하는 인터랙션은 다음 단계에서 더 확장할 수 있습니다.
                            </p>
                          </div>
                        </div>
                      </div>

                      {problemItems.length > 0 ? (
                        <div className="space-y-3">
                          {problemItems.map((mission, index) => {
                            const isSelected = selectedProblemId === mission.id;
                            const hasSolved = isSelected && hasSubmissionFeedback && isSubmissionAccepted;
                            const hasFailed = isSelected && hasSubmissionFeedback && !isSubmissionAccepted;

                            return (
                            <div
                              key={mission.id}
                              className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                                hasSolved
                                  ? 'border-emerald-200 bg-emerald-50/60 shadow-emerald-100'
                                  : hasFailed
                                    ? 'border-amber-200 bg-amber-50/60 shadow-amber-100'
                                    : isSelected
                                      ? 'border-purple-200 bg-purple-50/50 shadow-purple-100 hover:border-purple-300'
                                      : 'border-gray-200 hover:border-purple-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white shadow-sm">
                                      {index + 1}
                                    </span>
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                                      문제
                                    </span>
                                    <p className="text-base font-bold text-gray-900">{mission.title}</p>
                                  </div>
                                  {mission.description ? (
                                    <p className="mt-4 text-sm leading-7 text-gray-700">{mission.description}</p>
                                  ) : null}
                                  {mission.guideContent ? (
                                    <div className="mt-4 rounded-lg border border-purple-100 bg-purple-50 px-4 py-4">
                                      <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">가이드</p>
                                      <p className="mt-2 text-sm leading-6 text-purple-700">{mission.guideContent}</p>
                                    </div>
                                  ) : null}
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-3">
                                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                                    순서 {mission.orderIndex}
                                  </span>
                                  {isSelected && hasSubmissionFeedback ? (
                                    <>
                                      <span
                                        className={`inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold ${
                                          hasSolved
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-amber-500 text-white'
                                        }`}
                                      >
                                        {hasSolved ? '정답' : '다시 시도'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={handleRetrySubmission}
                                        className="inline-flex h-10 items-center rounded-lg border border-purple-200 bg-white px-4 text-sm font-semibold text-purple-600 transition hover:bg-purple-50"
                                      >
                                        다시풀기
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleStartProblemSolving(mission.id, mission.title)}
                                      className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition ${
                                        isSelected
                                          ? 'border-purple-200 bg-purple-600 text-white hover:bg-purple-700'
                                          : 'border-purple-200 bg-white text-purple-600 hover:bg-purple-50'
                                      }`}
                                    >
                                      {isSelected ? '풀이 중' : '문제 풀기'}
                                    </button>
                                  )}
                                </div>
                              </div>
                              {isSelected && hasSubmissionFeedback ? (
                                <div
                                  className={`mt-4 rounded-lg border px-4 py-4 ${
                                    hasSolved
                                      ? 'border-emerald-200 bg-white/90'
                                      : 'border-amber-200 bg-white/90'
                                  }`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm font-bold text-slate-900">문제 제출 결과</p>
                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        hasSolved
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : 'bg-amber-100 text-amber-700'
                                      }`}
                                    >
                                      {submissionStatusLabel}
                                    </span>
                                  </div>
                                  {submissionSummaryMessage ? (
                                    <p className="mt-3 text-sm leading-6 text-slate-700">{submissionSummaryMessage}</p>
                                  ) : null}
                                  {submissionResult ? (
                                    <p className="mt-2 text-xs font-medium text-slate-500">
                                      통과 개수 {submissionResult.passedCount} / {submissionResult.totalCount}
                                    </p>
                                  ) : null}
                                  {submissionResult?.stdout ? (
                                    <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                                      {submissionResult.stdout}
                                    </pre>
                                  ) : null}
                                  {visibleSubmissionStderr ? (
                                    <pre className="mt-3 overflow-x-auto rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
                                      {visibleSubmissionStderr}
                                    </pre>
                                  ) : null}
                                  {submissionResult?.compileOutput ? (
                                    <pre className="mt-3 overflow-x-auto rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                                      {submissionResult.compileOutput}
                                    </pre>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          )})}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-white to-gray-50 p-10 text-center shadow-sm">
                          <p className="text-sm font-semibold text-gray-700">등록된 문제가 없습니다.</p>
                          <p className="mt-2 text-sm text-gray-500">어드민에서 문제를 추가하면 이 영역에 카드 형태로 표시됩니다.</p>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {activeContentTab === 'missions' ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-purple-50 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
                            M
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-purple-700">미션 안내</h3>
                            <p className="mt-2 text-sm leading-6 text-gray-700">
                              이 챕터의 미션 목록입니다. 현재는 콘텐츠 확인 중심으로 연결했고, 추후 진행 상태/제출 흐름을 확장할 수 있습니다.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold text-slate-900">미션 진행 현황</p>
                                <p className="mt-1 text-xs text-slate-500">0 / {missionItems.length} 완료</p>
                              </div>
                              <span className="shrink-0 text-sm font-bold text-purple-600">0%</span>
                            </div>
                            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
                                style={{ width: '0%' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {missionItems.length > 0 ? (
                        <div className="space-y-3">
                          {missionItems.map((mission, index) => {
                            const isSelected = selectedMissionId === mission.id;
                            const hasSolved = isSelected && hasSubmissionFeedback && isSubmissionAccepted;
                            const hasFailed = isSelected && hasSubmissionFeedback && !isSubmissionAccepted;

                            return (
                            <div
                              key={mission.id}
                              className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                                hasSolved
                                  ? 'border-emerald-200 bg-emerald-50/60 shadow-emerald-100'
                                  : hasFailed
                                    ? 'border-amber-200 bg-amber-50/60 shadow-amber-100'
                                    : isSelected
                                      ? 'border-purple-200 bg-purple-50/50 shadow-purple-100 hover:border-purple-300'
                                      : 'border-gray-200 hover:border-purple-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white">
                                      미션 {index + 1}
                                    </span>
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                                      실습
                                    </span>
                                    <p className="text-base font-bold text-gray-900">{mission.title}</p>
                                  </div>
                                  {mission.description ? (
                                    <p className="mt-4 text-sm leading-7 text-gray-700">{mission.description}</p>
                                  ) : null}
                                  {mission.guideContent ? (
                                    <div className="mt-4 rounded-lg border border-purple-100 bg-purple-50 px-4 py-4">
                                      <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">가이드</p>
                                      <p className="mt-2 text-sm leading-6 text-purple-700">{mission.guideContent}</p>
                                    </div>
                                  ) : null}
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-3">
                                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                                    순서 {mission.orderIndex}
                                  </span>
                                  {isSelected && hasSubmissionFeedback ? (
                                    <>
                                      <span
                                        className={`inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold ${
                                          hasSolved
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-amber-500 text-white'
                                        }`}
                                      >
                                        {hasSolved ? '정답' : '다시 시도'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={handleRetrySubmission}
                                        className="inline-flex h-10 items-center rounded-lg border border-purple-200 bg-white px-4 text-sm font-semibold text-purple-600 transition hover:bg-purple-50"
                                      >
                                        다시풀기
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleStartMission(mission.id, mission.title)}
                                      className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition ${
                                        isSelected
                                          ? 'border-purple-200 bg-purple-600 text-white hover:bg-purple-700'
                                          : 'border-purple-200 bg-white text-purple-600 hover:bg-purple-50'
                                      }`}
                                    >
                                      {isSelected ? '진행 중' : '미션 시작하기'}
                                    </button>
                                  )}
                                </div>
                              </div>
                              {isSelected && hasSubmissionFeedback ? (
                                <div
                                  className={`mt-4 rounded-lg border px-4 py-4 ${
                                    hasSolved
                                      ? 'border-emerald-200 bg-white/90'
                                      : 'border-amber-200 bg-white/90'
                                  }`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm font-bold text-slate-900">미션 제출 결과</p>
                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        hasSolved
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : 'bg-amber-100 text-amber-700'
                                      }`}
                                    >
                                      {submissionStatusLabel}
                                    </span>
                                  </div>
                                  {submissionSummaryMessage ? (
                                    <p className="mt-3 text-sm leading-6 text-slate-700">{submissionSummaryMessage}</p>
                                  ) : null}
                                  {submissionResult ? (
                                    <p className="mt-2 text-xs font-medium text-slate-500">
                                      통과 개수 {submissionResult.passedCount} / {submissionResult.totalCount}
                                    </p>
                                  ) : null}
                                  {submissionResult?.stdout ? (
                                    <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                                      {submissionResult.stdout}
                                    </pre>
                                  ) : null}
                                  {visibleSubmissionStderr ? (
                                    <pre className="mt-3 overflow-x-auto rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
                                      {visibleSubmissionStderr}
                                    </pre>
                                  ) : null}
                                  {submissionResult?.compileOutput ? (
                                    <pre className="mt-3 overflow-x-auto rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                                      {submissionResult.compileOutput}
                                    </pre>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          )})}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-white to-gray-50 p-10 text-center shadow-sm">
                          <p className="text-sm font-semibold text-gray-700">등록된 미션이 없습니다.</p>
                          <p className="mt-2 text-sm text-gray-500">어드민에서 미션을 추가하면 이 영역에 카드 형태로 표시됩니다.</p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </>
              )}
              {(!template?.chapters || template.chapters.length === 0) && template?.summary && (
                <p className="text-gray-500 text-sm mb-8">{template.summary}</p>
              )}
              {(!template?.chapters || template.chapters.length === 0) && <TiptapRenderer content={template?.contentJson} />}
            </div>
          </main>
                                        {/* 실행 환경 패널 */}
                    {isRunnerOpen && (
                      <div className="relative flex shrink-0 overflow-visible">
                        <button
                          onClick={handleToggleRunner}
                          className="absolute left-0 top-14 z-40 flex w-10 -translate-x-full items-center justify-center rounded-l-lg border border-l-2 border-t-2 border-b-2 border-r-0 border-purple-200 bg-purple-50 px-2 py-3 text-purple-500 shadow-sm transition hover:border-purple-300 hover:bg-purple-100 hover:text-purple-700 cursor-pointer group"
                        >
                          <ChevronLeft className="w-5 h-5 rotate-180 transition-transform duration-200" />
                          <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-purple-200 bg-white px-2 py-1 text-[11px] font-medium text-purple-600 opacity-0 shadow-sm transition-opacity pointer-events-none group-hover:opacity-100">
                            실행기 닫기
                          </span>
                        </button>
                        <CodeRunner
                          templateId={templateId}
                          chapterId={template?.chapters?.[currentChapterIndex]?.id}
                          language={template?.language}
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
                        {isAiChatOpen && (
                          <div className="relative h-full shrink-0" style={{ width: `${aiChatPanelWidth}px` }}>
                            <div
                              onMouseDown={handleAiChatResizeStart}
                              className="absolute inset-y-0 left-0 z-30 w-1 cursor-col-resize bg-slate-200 transition-colors hover:bg-[#7C3AED]"
                            />
                            <AiChatPanel
                          isOpen={isAiChatOpen}
                          title="AI 채팅"
                          context={aiChatContext}
                          variant="sidecar"
                          className="h-full"
                          messages={aiChatMessages}
                          onMessagesChange={setAiChatMessages}
                          onClose={() => setIsAiChatOpen(false)}
                            />
                          </div>
                        )}
                      </div>
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

