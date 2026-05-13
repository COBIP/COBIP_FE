'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSONContent } from '@tiptap/core';
import {
  Archive,
  ChevronDown,
  ChevronUp,
  Eye,
  FileCode2,
  FilePlus2,
  FolderPlus,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { adminService } from '@/api/services/AdminService';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { TemplatePreview } from '@/components/editor/TemplatePreview';
import type {
  AdminDifficulty,
  GrammarTemplateChapter,
  GrammarTemplateLanguage,
  GrammarTemplatePayload,
  GrammarTemplatePracticeFile,
  GrammarTemplatePracticeFileNodeType,
  GrammarTemplatePracticeFilePayload,
  GrammarTemplateStatus,
  PageResponse,
} from '@/types/AdminTypes';
import type {
  AdminGrammarMediaResponse,
  AdminGrammarMediaType,
  AdminGrammarSection,
} from '@/types/AdminGrammarTemplateTypes';
import {
  AdminCard,
  AdminEmpty,
  AdminError,
  AdminPageTitle,
  AdminPagination,
  formatDateTime,
  formatNumber,
} from './AdminShell';

const languages: GrammarTemplateLanguage[] = ['JAVA', 'PYTHON', 'JAVASCRIPT'];
const difficulties: AdminDifficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const statuses: GrammarTemplateStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

const defaultContent: JSONContent = {
  type: 'doc',
  content: [],
};

const emptyForm: GrammarTemplatePayload = {
  slug: '',
  title: '',
  language: 'PYTHON',
  category: '',
  difficulty: 'BEGINNER',
  summary: '',
  status: 'DRAFT',
  contentJson: defaultContent,
};

function buildClonedContent(content: JSONContent = defaultContent) {
  return JSON.parse(JSON.stringify(content)) as JSONContent;
}

function buildNormalizedContent(content?: JSONContent | null) {
  return content?.type === 'doc' ? content : buildClonedContent();
}

function buildSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildSortedChapters(chapters: GrammarTemplateChapter[]) {
  return [...chapters].sort((left, right) => left.orderIndex - right.orderIndex || left.id - right.id);
}

function buildSortedPracticeFiles(files: GrammarTemplatePracticeFile[]) {
  return [...files].sort(
    (left, right) => left.orderIndex - right.orderIndex || left.filePath.localeCompare(right.filePath),
  );
}

function createFilePayload(
  nodeType: GrammarTemplatePracticeFileNodeType,
  orderIndex: number,
): GrammarTemplatePracticeFilePayload {
  return {
    nodeType,
    filePath: '',
    language: nodeType === 'FILE' ? 'python' : null,
    content: nodeType === 'FILE' ? '' : null,
    readOnly: nodeType === 'FOLDER',
    orderIndex,
  };
}

function convertFileToPayload(file: GrammarTemplatePracticeFile): GrammarTemplatePracticeFilePayload {
  return {
    nodeType: file.nodeType,
    filePath: file.filePath,
    language: file.language,
    content: file.content,
    readOnly: file.readOnly,
    orderIndex: file.orderIndex,
  };
}

function buildSanitizedFilePayload(payload: GrammarTemplatePracticeFilePayload): GrammarTemplatePracticeFilePayload {
  const filePath = payload.filePath.trim();

  if (payload.nodeType === 'FOLDER') {
    return {
      nodeType: 'FOLDER',
      filePath,
      language: null,
      content: null,
      readOnly: true,
      orderIndex: payload.orderIndex,
    };
  }

  return {
    nodeType: 'FILE',
    filePath,
    language: payload.language?.trim() || 'text',
    content: payload.content ?? '',
    readOnly: payload.readOnly,
    orderIndex: payload.orderIndex,
  };
}

function getNextOrderIndex(items: Array<{ orderIndex: number }>) {
  return items.length ? Math.max(...items.map((item) => item.orderIndex)) + 1 : 1;
}

function getIndentLevel(filePath: string) {
  return Math.max(0, filePath.split('/').filter(Boolean).length - 1);
}

function buildPreviewSections(chapter: GrammarTemplateChapter | null): AdminGrammarSection[] {
  if (!chapter) {
    return [];
  }

  return [
    {
      id: String(chapter.id),
      heading: chapter.title,
      content: buildNormalizedContent(chapter.contentJson),
      isCollapsed: false,
    },
  ];
}

export function AdminGrammarTemplatesPage() {
  const [keyword, setKeyword] = useState('');
  const [language, setLanguage] = useState<GrammarTemplateLanguage | ''>('');
  const [status, setStatus] = useState<GrammarTemplateStatus | ''>('');
  const [page, setPage] = useState(0);
  const [templates, setTemplates] = useState<PageResponse<GrammarTemplatePayload & { id: number; updatedAt?: string }> | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<GrammarTemplatePayload>(emptyForm);
  const [chapters, setChapters] = useState<GrammarTemplateChapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [practiceFiles, setPracticeFiles] = useState<GrammarTemplatePracticeFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [fileForm, setFileForm] = useState<GrammarTemplatePracticeFilePayload>(() => createFilePayload('FILE', 1));
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isTemplateDirty, setIsTemplateDirty] = useState(false);
  const [isChapterDirty, setIsChapterDirty] = useState(false);
  const [isFileDirty, setIsFileDirty] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activeChapter = useMemo(
    () => chapters.find((chapter) => chapter.id === activeChapterId) ?? null,
    [activeChapterId, chapters],
  );

  const selectedFile = useMemo(
    () => practiceFiles.find((file) => file.id === selectedFileId) ?? null,
    [practiceFiles, selectedFileId],
  );

  const previewSections = useMemo<AdminGrammarSection[]>(() => {
    if (activeChapter) {
      return buildPreviewSections(activeChapter);
    }

    return [
      {
        id: 'template-content',
        heading: form.title || '?쒗뵆由?蹂몃Ц',
        content: buildNormalizedContent(form.contentJson),
        isCollapsed: false,
      },
    ];
  }, [activeChapter, form.contentJson, form.title]);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await adminService.getGrammarTemplates({
        keyword,
        language: language || undefined,
        status: status || undefined,
        page,
        size: 20,
        sort: 'createdAt,desc',
      });
      setTemplates(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '문법 템플릿 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, language, page, status]);

  useEffect(() => {
    queueMicrotask(() => void loadTemplates());
  }, [loadTemplates]);

  const confirmDiscardDirty = useCallback(() => {
    if (!isTemplateDirty && !isChapterDirty && !isFileDirty) {
      return true;
    }

    return confirm('저장되지 않은 변경사항이 있습니다. 계속 진행할까요?');
  }, [isChapterDirty, isFileDirty, isTemplateDirty]);

  const updateForm = <TKey extends keyof GrammarTemplatePayload>(
    key: TKey,
    value: GrammarTemplatePayload[TKey],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
    setIsTemplateDirty(true);
  };

  const updateActiveChapter = (patch: Partial<Pick<GrammarTemplateChapter, 'title' | 'contentJson'>>) => {
    if (!activeChapterId) {
      return;
    }

    setChapters((currentChapters) =>
      currentChapters.map((chapter) =>
        chapter.id === activeChapterId
          ? {
              ...chapter,
              ...patch,
            }
          : chapter,
      ),
    );
    setIsChapterDirty(true);
  };

  const updateFileForm = <TKey extends keyof GrammarTemplatePracticeFilePayload>(
    key: TKey,
    value: GrammarTemplatePracticeFilePayload[TKey],
  ) => {
    setFileForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
    setIsFileDirty(true);
  };

  const resetFileEditor = useCallback((files: GrammarTemplatePracticeFile[] = practiceFiles) => {
    setSelectedFileId(null);
    setIsCreatingFile(false);
    setIsFileDirty(false);
    setFileForm(createFilePayload('FILE', getNextOrderIndex(files)));
  }, [practiceFiles]);

  const loadPracticeFiles = useCallback(
    async (templateId: number, chapterId: number, fallbackFiles?: GrammarTemplatePracticeFile[]) => {
      setError('');

      try {
        const files = fallbackFiles ?? (await adminService.getGrammarTemplatePracticeFiles(templateId, chapterId));
        const sortedFiles = buildSortedPracticeFiles(files);
        setPracticeFiles(sortedFiles);
        setSelectedFileId(null);
        setIsCreatingFile(false);
        setIsFileDirty(false);
        setFileForm(createFilePayload('FILE', getNextOrderIndex(sortedFiles)));
      } catch (loadError) {
        setPracticeFiles([]);
        setError(loadError instanceof Error ? loadError.message : '실습 파일 목록을 불러오지 못했습니다.');
      }
    },
    [],
  );

  const loadChapters = useCallback(
    async (templateId: number, detailChapters?: GrammarTemplateChapter[]) => {
      const nextChapters = buildSortedChapters(
        detailChapters ?? (await adminService.getGrammarTemplateChapters(templateId)),
      );
      setChapters(nextChapters);
      const nextActiveChapter = nextChapters[0] ?? null;
      setActiveChapterId(nextActiveChapter?.id ?? null);
      setIsChapterDirty(false);

      if (nextActiveChapter) {
        await loadPracticeFiles(templateId, nextActiveChapter.id, nextActiveChapter.practiceFiles);
      } else {
        setPracticeFiles([]);
        resetFileEditor([]);
      }
    },
    [loadPracticeFiles, resetFileEditor],
  );

  const handleNew = () => {
    if (!confirmDiscardDirty()) {
      return;
    }

    setSelectedId(null);
    setForm(emptyForm);
    setChapters([]);
    setActiveChapterId(null);
    setPracticeFiles([]);
    setSelectedFileId(null);
    setFileForm(createFilePayload('FILE', 1));
    setIsCreatingFile(false);
    setIsTemplateDirty(false);
    setIsChapterDirty(false);
    setIsFileDirty(false);
    setMessage('');
    setError('');
  };

  const handleSelect = async (templateId: number) => {
    if (!confirmDiscardDirty()) {
      return;
    }

    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const detail = await adminService.getGrammarTemplate(templateId);
      setSelectedId(detail.id);
      setForm({
        slug: detail.slug,
        title: detail.title,
        language: detail.language,
        category: detail.category,
        difficulty: detail.difficulty,
        summary: detail.summary,
        status: detail.status,
        contentJson: buildNormalizedContent(detail.contentJson),
      });
      setIsTemplateDirty(false);
      await loadChapters(detail.id, detail.chapters);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '문법 템플릿 상세를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePublish = () => {
    if (!chapters.length) {
      return '게시 전 챕터를 1개 이상 추가해야 합니다.';
    }

    if (chapters.some((chapter) => !chapter.title.trim())) {
      return '게시 전 모든 챕터 제목을 입력해야 합니다.';
    }

    if (chapters.some((chapter) => buildNormalizedContent(chapter.contentJson).type !== 'doc')) {
      return '게시 전 모든 챕터 본문이 올바른 문서 형식이어야 합니다.';
    }

    return '';
  };

  const handleSaveTemplate = async (nextStatus?: GrammarTemplateStatus) => {
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const payload: GrammarTemplatePayload = {
        ...form,
        slug: form.slug || buildSlug(form.title),
        status: nextStatus ?? form.status,
        contentJson: buildNormalizedContent(form.contentJson),
      };

      if (payload.status === 'PUBLISHED') {
        const publishError = validatePublish();

        if (publishError) {
          throw new Error(publishError);
        }
      }

      const saved = selectedId
        ? await adminService.updateGrammarTemplate(selectedId, payload)
        : await adminService.createGrammarTemplate(payload);

      setSelectedId(saved.id);
      setForm({
        slug: saved.slug,
        title: saved.title,
        language: saved.language,
        category: saved.category,
        difficulty: saved.difficulty,
        summary: saved.summary,
        status: saved.status,
        contentJson: buildNormalizedContent(saved.contentJson ?? payload.contentJson),
      });
      setIsTemplateDirty(false);
      setMessage('템플릿 정보를 저장했습니다.');

      if (!selectedId) {
        setChapters([]);
        setActiveChapterId(null);
        setPracticeFiles([]);
        resetFileEditor([]);
      }

      await loadTemplates();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '문법 템플릿 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusUpdate = async (nextStatus: GrammarTemplateStatus) => {
    if (!selectedId) {
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      if (nextStatus === 'PUBLISHED') {
        const publishError = validatePublish();

        if (publishError) {
          throw new Error(publishError);
        }
      }

      const updated = await adminService.updateGrammarTemplateStatus(selectedId, nextStatus);
      setForm((currentForm) => ({
        ...currentForm,
        status: updated.status,
      }));
      setIsTemplateDirty(false);
      setMessage(`${nextStatus} 상태로 변경했습니다.`);
      await loadTemplates();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : '상태 변경에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedId || !confirm('선택한 문법 템플릿을 삭제할까요?')) {
      return;
    }

    setError('');

    try {
      await adminService.deleteGrammarTemplate(selectedId);
      handleNew();
      await loadTemplates();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '문법 템플릿 삭제에 실패했습니다.');
    }
  };

  const handleAddChapter = async () => {
    if (!selectedId) {
      setError('챕터를 추가하려면 먼저 템플릿을 저장해야 합니다.');
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const orderIndex = getNextOrderIndex(chapters);
      const chapter = await adminService.createGrammarTemplateChapter(selectedId, {
        title: `${orderIndex}. 새 챕터`,
        orderIndex,
        contentJson: chapters.length
          ? buildClonedContent()
          : buildClonedContent(buildNormalizedContent(form.contentJson)),
      });
      const nextChapters = buildSortedChapters([...chapters, chapter]);
      setChapters(nextChapters);
      setActiveChapterId(chapter.id);
      setIsChapterDirty(false);
      setMessage('챕터를 추가했습니다.');
      await loadPracticeFiles(selectedId, chapter.id, chapter.practiceFiles ?? []);
    } catch (chapterError) {
      setError(chapterError instanceof Error ? chapterError.message : '챕터 추가에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectChapter = async (chapterId: number) => {
    if (!selectedId || chapterId === activeChapterId) {
      return;
    }

    if (isChapterDirty && !confirm('현재 챕터의 저장되지 않은 변경사항이 있습니다. 이동할까요?')) {
      return;
    }

    if (isFileDirty && !confirm('현재 파일의 저장되지 않은 변경사항이 있습니다. 이동할까요?')) {
      return;
    }

    const nextChapter = chapters.find((chapter) => chapter.id === chapterId);
    setActiveChapterId(chapterId);
    setIsChapterDirty(false);
    await loadPracticeFiles(selectedId, chapterId, nextChapter?.practiceFiles);
  };

  const handleSaveChapter = async () => {
    if (!selectedId || !activeChapter) {
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        title: activeChapter.title.trim(),
        orderIndex: activeChapter.orderIndex,
        contentJson: buildNormalizedContent(activeChapter.contentJson),
      };

      if (!payload.title) {
        throw new Error('챕터 제목을 입력해야 합니다.');
      }

      const saved = await adminService.updateGrammarTemplateChapter(selectedId, activeChapter.id, payload);
      setChapters((currentChapters) =>
        buildSortedChapters(currentChapters.map((chapter) => (chapter.id === saved.id ? saved : chapter))),
      );
      setIsChapterDirty(false);
      setMessage('챕터를 저장했습니다.');
    } catch (chapterError) {
      setError(chapterError instanceof Error ? chapterError.message : '챕터 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveChapter = async (chapterId: number, direction: 'up' | 'down') => {
    if (!selectedId) {
      return;
    }

    const currentIndex = chapters.findIndex((chapter) => chapter.id === chapterId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= chapters.length) {
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const nextChapters = [...chapters];
      [nextChapters[currentIndex], nextChapters[targetIndex]] = [
        nextChapters[targetIndex],
        nextChapters[currentIndex],
      ];

      const reorderedChapters = nextChapters.map((chapter, index) => ({
        ...chapter,
        orderIndex: index + 1,
      }));

      await Promise.all(
        reorderedChapters
          .filter((chapter) => {
            const previousChapter = chapters.find((item) => item.id === chapter.id);
            return previousChapter?.orderIndex !== chapter.orderIndex;
          })
          .map((chapter) =>
            adminService.updateGrammarTemplateChapter(selectedId, chapter.id, {
              title: chapter.title,
              orderIndex: chapter.orderIndex,
              contentJson: buildNormalizedContent(chapter.contentJson),
            }),
          ),
      );

      setChapters(buildSortedChapters(reorderedChapters));
      setIsChapterDirty(false);
      setMessage('챕터 순서를 저장했습니다.');
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : '챕터 순서 변경에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (!selectedId || !confirm('선택한 챕터를 삭제할까요?')) {
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      await adminService.deleteGrammarTemplateChapter(selectedId, chapterId);
      const nextChapters = chapters.filter((chapter) => chapter.id !== chapterId);
      setChapters(nextChapters);
      setIsChapterDirty(false);
      setMessage('챕터를 삭제했습니다.');

      const nextActiveChapter = nextChapters[0] ?? null;
      setActiveChapterId(nextActiveChapter?.id ?? null);

      if (nextActiveChapter) {
        await loadPracticeFiles(selectedId, nextActiveChapter.id, nextActiveChapter.practiceFiles);
      } else {
        setPracticeFiles([]);
        resetFileEditor([]);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '챕터 삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartCreateFile = (nodeType: GrammarTemplatePracticeFileNodeType) => {
    if (!activeChapter) {
      return;
    }

    if (isFileDirty && !confirm('현재 파일의 저장되지 않은 변경사항이 있습니다. 계속할까요?')) {
      return;
    }

    setSelectedFileId(null);
    setIsCreatingFile(true);
    setIsFileDirty(true);
    setFileForm(createFilePayload(nodeType, getNextOrderIndex(practiceFiles)));
  };

  const handleSelectFile = (file: GrammarTemplatePracticeFile) => {
    if (isFileDirty && !confirm('현재 파일의 저장되지 않은 변경사항이 있습니다. 이동할까요?')) {
      return;
    }

    setSelectedFileId(file.id);
    setIsCreatingFile(false);
    setIsFileDirty(false);
    setFileForm(convertFileToPayload(file));
  };

  const handleSaveFile = async () => {
    if (!selectedId || !activeChapter || (!selectedFileId && !isCreatingFile)) {
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = buildSanitizedFilePayload(fileForm);

      if (!payload.filePath) {
        throw new Error('파일 또는 폴더 경로를 입력해야 합니다.');
      }

      const hasDuplicatedPath = practiceFiles.some(
        (file) => file.filePath === payload.filePath && file.id !== selectedFileId,
      );

      if (hasDuplicatedPath) {
        throw new Error('같은 챕터 안에서 이미 사용 중인 경로입니다.');
      }

      const saved = selectedFileId
        ? await adminService.updateGrammarTemplatePracticeFile(selectedId, activeChapter.id, selectedFileId, payload)
        : await adminService.createGrammarTemplatePracticeFile(selectedId, activeChapter.id, payload);

      setPracticeFiles((currentFiles) =>
        buildSortedPracticeFiles(
          selectedFileId
            ? currentFiles.map((file) => (file.id === saved.id ? saved : file))
            : [...currentFiles, saved],
        ),
      );
      setSelectedFileId(saved.id);
      setIsCreatingFile(false);
      setIsFileDirty(false);
      setFileForm(convertFileToPayload(saved));
      setMessage('실습 파일을 저장했습니다.');
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : '실습 파일 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveFile = async (fileId: number, direction: 'up' | 'down') => {
    if (!selectedId || !activeChapter) {
      return;
    }

    const currentIndex = practiceFiles.findIndex((file) => file.id === fileId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= practiceFiles.length) {
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const nextFiles = [...practiceFiles];
      [nextFiles[currentIndex], nextFiles[targetIndex]] = [nextFiles[targetIndex], nextFiles[currentIndex]];

      const reorderedFiles = nextFiles.map((file, index) => ({
        ...file,
        orderIndex: index + 1,
      }));

      await Promise.all(
        reorderedFiles
          .filter((file) => {
            const previousFile = practiceFiles.find((item) => item.id === file.id);
            return previousFile?.orderIndex !== file.orderIndex;
          })
          .map((file) =>
            adminService.updateGrammarTemplatePracticeFile(
              selectedId,
              activeChapter.id,
              file.id,
              buildSanitizedFilePayload(convertFileToPayload(file)),
            ),
          ),
      );

      setPracticeFiles(buildSortedPracticeFiles(reorderedFiles));
      setIsFileDirty(false);
      setMessage('실습 파일 순서를 저장했습니다.');
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : '실습 파일 순서 변경에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!selectedId || !activeChapter || !confirm('선택한 파일 또는 폴더를 삭제할까요?')) {
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      await adminService.deleteGrammarTemplatePracticeFile(selectedId, activeChapter.id, fileId);
      const nextFiles = practiceFiles.filter((file) => file.id !== fileId);
      setPracticeFiles(nextFiles);

      if (selectedFileId === fileId) {
        setSelectedFileId(null);
        setIsCreatingFile(false);
        setIsFileDirty(false);
        setFileForm(createFilePayload('FILE', getNextOrderIndex(nextFiles)));
      }

      setMessage('실습 파일을 삭제했습니다.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '실습 파일 삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaUpload = async (
    file: File,
    mediaType: AdminGrammarMediaType,
  ): Promise<AdminGrammarMediaResponse> => {
    if (!selectedId) {
      throw new Error('미디어 업로드는 템플릿 저장 후 사용할 수 있습니다.');
    }

    return adminService.uploadGrammarTemplateMedia(selectedId, file, mediaType);
  };

  return (
    <div>
      <AdminPageTitle
        title="문법 템플릿 관리"
        description="템플릿 메타 정보, 챕터 본문, 챕터별 실습 파일을 관리합니다."
      />

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <AdminCard>
            <div className="space-y-3">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="제목, 요약 검색"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as GrammarTemplateLanguage | '')}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="">전체 언어</option>
                  {languages.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as GrammarTemplateStatus | '')}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="">전체 상태</option>
                  {statuses.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPage(0);
                  void loadTemplates();
                }}
                className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white"
              >
                검색
              </button>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">총 {formatNumber(templates?.totalElements ?? 0)}개</p>
              <button
                type="button"
                onClick={handleNew}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                새 템플릿
              </button>
            </div>

            {isLoading ? (
              <p className="text-sm text-slate-500">목록을 불러오는 중입니다.</p>
            ) : !templates?.content.length ? (
              <AdminEmpty message="문법 템플릿이 없습니다." />
            ) : (
              <div className="space-y-2">
                {templates.content.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => void handleSelect(template.id)}
                    className={`w-full rounded-md border px-3 py-3 text-left ${
                      selectedId === template.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="block truncate text-sm font-bold text-slate-900">{template.title}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {template.language} · {template.difficulty} · {template.status}
                    </span>
                    {template.updatedAt && (
                      <span className="mt-1 block text-xs text-slate-400">{formatDateTime(template.updatedAt)}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <AdminPagination page={page} totalPages={templates?.totalPages ?? 1} onPageChange={setPage} />
          </AdminCard>
        </div>

        <div className="min-w-0 space-y-4">
          <AdminError message={error} />
          {message && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <AdminCard>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-950">템플릿 메타 정보</h2>
                {(isTemplateDirty || isChapterDirty || isFileDirty) && (
                  <p className="mt-1 text-xs font-medium text-amber-600">
                    저장되지 않은 변경사항이 있습니다.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleSaveTemplate()}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  템플릿 저장
                </button>
                {selectedId && (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleStatusUpdate('PUBLISHED')}
                      disabled={form.status === 'PUBLISHED' || isSaving}
                      className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                    >
                      <UploadCloud className="h-4 w-4" />
                      게시
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleStatusUpdate('ARCHIVED')}
                      disabled={form.status === 'ARCHIVED' || isSaving}
                      className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                    >
                      <Archive className="h-4 w-4" />
                      보관
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteTemplate()}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-md border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="text-sm font-semibold text-slate-700">
                제목
                <input
                  value={form.title}
                  onChange={(event) => updateForm('title', event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Slug
                <input
                  value={form.slug}
                  onChange={(event) => updateForm('slug', event.target.value)}
                  placeholder="비우면 제목으로 자동 생성"
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                언어
                <select
                  value={form.language}
                  onChange={(event) => updateForm('language', event.target.value as GrammarTemplateLanguage)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  {languages.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                카테고리
                <input
                  value={form.category}
                  onChange={(event) => updateForm('category', event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                난이도
                <select
                  value={form.difficulty}
                  onChange={(event) => updateForm('difficulty', event.target.value as AdminDifficulty)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  {difficulties.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                상태
                <select
                  value={form.status}
                  onChange={(event) => updateForm('status', event.target.value as GrammarTemplateStatus)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  {statuses.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700 md:col-span-2 xl:col-span-3">
                요약
                <textarea
                  value={form.summary}
                  onChange={(event) => updateForm('summary', event.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
          </AdminCard>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_24rem]">
            <AdminCard className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-950">챕터</h2>
                <button
                  type="button"
                  onClick={() => void handleAddChapter()}
                  disabled={!selectedId || isSaving}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                  추가
                </button>
              </div>

              {!selectedId ? (
                <AdminEmpty message="템플릿 저장 후 챕터를 추가할 수 있습니다." />
              ) : !chapters.length ? (
                <AdminEmpty message="챕터가 없습니다." />
              ) : (
                <div className="space-y-2">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className={`rounded-md border ${
                        chapter.id === activeChapterId ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void handleSelectChapter(chapter.id)}
                        className="w-full px-3 py-3 text-left"
                      >
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {chapter.title || `${index + 1}. 제목 없음`}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">order {chapter.orderIndex}</span>
                      </button>
                      <div className="flex items-center gap-1 border-t border-slate-200 px-2 py-2">
                        <button
                          type="button"
                          title="위로"
                          onClick={() => void handleMoveChapter(chapter.id, 'up')}
                          disabled={index === 0 || isSaving}
                          className="rounded p-1.5 text-slate-500 hover:bg-white disabled:opacity-40"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="아래로"
                          onClick={() => void handleMoveChapter(chapter.id, 'down')}
                          disabled={index === chapters.length - 1 || isSaving}
                          className="rounded p-1.5 text-slate-500 hover:bg-white disabled:opacity-40"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="삭제"
                          onClick={() => void handleDeleteChapter(chapter.id)}
                          disabled={isSaving}
                          className="ml-auto rounded p-1.5 text-rose-500 hover:bg-rose-50 disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>

            <div className="min-w-0 space-y-3">
              <AdminCard>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-slate-950">{activeChapter ? '챕터 본문' : '템플릿 본문'}</h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen((current) => !current)}
                      className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                    >
                      <Eye className="h-4 w-4" />
                      {isPreviewOpen ? '편집' : '미리보기'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeChapter) {
                          void handleSaveChapter();
                          return;
                        }

                        void handleSaveTemplate();
                      }}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      <Save className="h-4 w-4" />
                      {activeChapter ? '챕터 저장' : '템플릿 저장'}
                    </button>
                  </div>
                </div>

                {activeChapter ? (
                  <label className="block text-sm font-semibold text-slate-700">
                    챕터 제목
                    <input
                      value={activeChapter.title}
                      onChange={(event) => updateActiveChapter({ title: event.target.value })}
                      className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                    />
                  </label>
                ) : null}
              </AdminCard>

              {isPreviewOpen ? (
                <AdminCard>
                  <TemplatePreview sections={previewSections} />
                </AdminCard>
              ) : (
                <RichTextEditor
                  key={activeChapter?.id ?? `template-${selectedId ?? 'new'}`}
                  value={buildNormalizedContent(activeChapter?.contentJson ?? form.contentJson)}
                  onChange={(content) =>
                    activeChapter ? updateActiveChapter({ contentJson: content }) : updateForm('contentJson', content)
                  }
                  onMediaUpload={handleMediaUpload}
                />
              )}
            </div>

            <AdminCard className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-950">실습 파일</h2>
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="폴더 추가"
                    onClick={() => handleStartCreateFile('FOLDER')}
                    disabled={!activeChapter}
                    className="rounded-md border border-slate-300 p-2 text-slate-600 disabled:opacity-40"
                  >
                    <FolderPlus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="파일 추가"
                    onClick={() => handleStartCreateFile('FILE')}
                    disabled={!activeChapter}
                    className="rounded-md border border-slate-300 p-2 text-slate-600 disabled:opacity-40"
                  >
                    <FilePlus2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!activeChapter ? (
                <AdminEmpty message="챕터를 선택하면 실습 파일을 관리할 수 있습니다." />
              ) : !practiceFiles.length ? (
                <AdminEmpty message="실습 파일이 없습니다." />
              ) : (
                <div className="mb-4 space-y-1">
                  {practiceFiles.map((file, index) => (
                    <div
                      key={file.id}
                      className={`rounded-md border ${
                        selectedFileId === file.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectFile(file)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left"
                        style={{ paddingLeft: `${12 + getIndentLevel(file.filePath) * 16}px` }}
                      >
                        <FileCode2 className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                          {file.filePath}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          {file.nodeType}
                        </span>
                      </button>
                      <div className="flex items-center gap-1 border-t border-slate-200 px-2 py-1.5">
                        <button
                          type="button"
                          title="위로"
                          onClick={() => void handleMoveFile(file.id, 'up')}
                          disabled={index === 0 || isSaving}
                          className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-40"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="아래로"
                          onClick={() => void handleMoveFile(file.id, 'down')}
                          disabled={index === practiceFiles.length - 1 || isSaving}
                          className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-40"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="삭제"
                          onClick={() => void handleDeleteFile(file.id)}
                          disabled={isSaving}
                          className="ml-auto rounded p-1 text-rose-500 hover:bg-rose-50 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(selectedFile || isCreatingFile) && (
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-950">
                      {isCreatingFile ? '새 항목' : '선택 항목'}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleSaveFile()}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      <Save className="h-4 w-4" />
                      파일 저장
                    </button>
                  </div>

                  <label className="block text-xs font-semibold text-slate-700">
                    타입
                    <select
                      value={fileForm.nodeType}
                      onChange={(event) =>
                        updateFileForm('nodeType', event.target.value as GrammarTemplatePracticeFileNodeType)
                      }
                      className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option value="FILE">FILE</option>
                      <option value="FOLDER">FOLDER</option>
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    경로
                    <input
                      value={fileForm.filePath}
                      onChange={(event) => updateFileForm('filePath', event.target.value)}
                      placeholder={fileForm.nodeType === 'FILE' ? 'src/main.py' : 'src'}
                      className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      언어
                      <input
                        value={fileForm.language ?? ''}
                        onChange={(event) => updateFileForm('language', event.target.value)}
                        disabled={fileForm.nodeType === 'FOLDER'}
                        className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm disabled:bg-slate-100"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-slate-700">
                      순서
                      <input
                        type="number"
                        value={fileForm.orderIndex}
                        onChange={(event) => updateFileForm('orderIndex', Number(event.target.value))}
                        className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
                      />
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={fileForm.readOnly}
                      onChange={(event) => updateFileForm('readOnly', event.target.checked)}
                      disabled={fileForm.nodeType === 'FOLDER'}
                    />
                    읽기 전용
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    내용
                    <textarea
                      value={fileForm.content ?? ''}
                      onChange={(event) => updateFileForm('content', event.target.value)}
                      disabled={fileForm.nodeType === 'FOLDER'}
                      rows={12}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs disabled:bg-slate-100"
                    />
                  </label>
                </div>
              )}
            </AdminCard>
          </div>
        </div>
      </div>
    </div>
  );
}
