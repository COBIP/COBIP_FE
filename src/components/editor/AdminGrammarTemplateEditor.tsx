'use client';

import { useCallback, useMemo, useState } from 'react';
import type { JSONContent } from '@tiptap/core';
import {
  Archive,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  GripVertical,
  PanelRightOpen,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import type {
  AdminGrammarContentJson,
  AdminGrammarMediaResponse,
  AdminGrammarMediaType,
  AdminGrammarSection,
  AdminGrammarTemplateMeta,
  AdminGrammarTemplatePayload,
  AdminGrammarTemplateStatus,
} from '@/types/AdminGrammarTemplateTypes';
import {
  createAdminGrammarTemplate,
  createAdminGrammarTemplateMedia,
  updateAdminGrammarTemplate,
  updateAdminGrammarTemplateStatus,
} from '@/api/services/AdminGrammarTemplateService';
import { RichTextEditor } from './RichTextEditor';
import { TemplatePreview } from './TemplatePreview';

interface AdminGrammarTemplateEditorProps {
  initialTemplateId?: string;
}

const statusOptions: AdminGrammarTemplateStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

const defaultContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};

const initialMeta: AdminGrammarTemplateMeta = {
  title: '자바 기본 문법',
  language: 'Java',
  category: '문법',
  difficulty: 'BEGINNER',
  status: 'DRAFT',
};

const initialSections: AdminGrammarSection[] = [
  {
    id: 'section-1',
    heading: '1. 자바란?',
    content: defaultContent,
    isCollapsed: false,
  },
];

function buildClonedContent(content: JSONContent): JSONContent {
  return JSON.parse(JSON.stringify(content)) as JSONContent;
}

function buildEmptyContent(): JSONContent {
  return buildClonedContent(defaultContent);
}

function createSectionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `section-${crypto.randomUUID()}`;
  }

  return `section-${Date.now()}`;
}

function buildContentJson(sections: AdminGrammarSection[]): AdminGrammarContentJson {
  return {
    sections: sections.map((section) => ({
      id: section.id,
      heading: section.heading,
      content: section.content,
    })),
  };
}

function getTemplateIdFromResponse(response: { id?: string | number; templateId?: string | number }) {
  const templateId = response.templateId ?? response.id;

  return templateId === undefined ? '' : String(templateId);
}

function buildMovedSections(
  sections: AdminGrammarSection[],
  sectionId: string,
  direction: 'up' | 'down',
) {
  const currentIndex = sections.findIndex((section) => section.id === sectionId);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sections.length) {
    return sections;
  }

  const nextSections = [...sections];
  const currentSection = nextSections[currentIndex];
  nextSections[currentIndex] = nextSections[targetIndex];
  nextSections[targetIndex] = currentSection;

  return nextSections;
}

export function AdminGrammarTemplateEditor({ initialTemplateId }: AdminGrammarTemplateEditorProps) {
  const [templateId, setTemplateId] = useState(initialTemplateId ?? '');
  const [meta, setMeta] = useState<AdminGrammarTemplateMeta>(initialMeta);
  const [sections, setSections] = useState<AdminGrammarSection[]>(initialSections);
  const [activeSectionId, setActiveSectionId] = useState(initialSections[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? sections[0],
    [activeSectionId, sections],
  );

  const contentJson = useMemo(() => buildContentJson(sections), [sections]);

  const buildPayload = useCallback(
    (nextStatus?: AdminGrammarTemplateStatus): AdminGrammarTemplatePayload => ({
      ...meta,
      status: nextStatus ?? meta.status,
      contentJson,
    }),
    [contentJson, meta],
  );

  const handleMetaChange = (field: keyof AdminGrammarTemplateMeta, value: string) => {
    setMeta((previousMeta) => ({
      ...previousMeta,
      [field]: value,
    }));
  };

  const handleSectionHeadingChange = (sectionId: string, heading: string) => {
    setSections((previousSections) =>
      previousSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              heading,
            }
          : section,
      ),
    );
  };

  const handleSectionContentChange = (sectionId: string, content: JSONContent) => {
    setSections((previousSections) =>
      previousSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              content,
            }
          : section,
      ),
    );
  };

  const handleAddSection = () => {
    const nextSection: AdminGrammarSection = {
      id: createSectionId(),
      heading: `${sections.length + 1}. 새 섹션`,
      content: buildEmptyContent(),
      isCollapsed: false,
    };

    setSections((previousSections) => [...previousSections, nextSection]);
    setActiveSectionId(nextSection.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (sections.length === 1) {
      return;
    }

    const nextSections = sections.filter((section) => section.id !== sectionId);
    setSections(nextSections);

    if (activeSectionId === sectionId) {
      setActiveSectionId(nextSections[0].id);
    }
  };

  const handleDuplicateSection = (sectionId: string) => {
    const sectionIndex = sections.findIndex((section) => section.id === sectionId);

    if (sectionIndex < 0) {
      return;
    }

    const sourceSection = sections[sectionIndex];
    const nextSection: AdminGrammarSection = {
      ...sourceSection,
      id: createSectionId(),
      heading: `${sourceSection.heading} 복사본`,
      content: buildClonedContent(sourceSection.content),
      isCollapsed: false,
    };

    const nextSections = [...sections];
    nextSections.splice(sectionIndex + 1, 0, nextSection);
    setSections(nextSections);
    setActiveSectionId(nextSection.id);
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    setSections((previousSections) => buildMovedSections(previousSections, sectionId, direction));
  };

  const handleToggleSection = (sectionId: string) => {
    setSections((previousSections) =>
      previousSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              isCollapsed: !section.isCollapsed,
            }
          : section,
      ),
    );
  };

  const handleEnsureDraftTemplate = useCallback(async () => {
    if (templateId) {
      return templateId;
    }

    const response = await createAdminGrammarTemplate(buildPayload('DRAFT'));
    const nextTemplateId = getTemplateIdFromResponse(response);

    if (!nextTemplateId) {
      throw new Error('템플릿 생성 응답에서 templateId를 찾을 수 없습니다.');
    }

    setTemplateId(nextTemplateId);
    setMeta((previousMeta) => ({
      ...previousMeta,
      status: response.status ?? 'DRAFT',
    }));

    return nextTemplateId;
  }, [buildPayload, templateId]);

  const handleSaveTemplate = async (nextStatus?: AdminGrammarTemplateStatus) => {
    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');

    try {
      const payload = buildPayload(nextStatus);
      const response = templateId
        ? await updateAdminGrammarTemplate(templateId, payload)
        : await createAdminGrammarTemplate(payload);
      const nextTemplateId = getTemplateIdFromResponse(response);

      if (nextTemplateId) {
        setTemplateId(nextTemplateId);
      }

      setMeta((previousMeta) => ({
        ...previousMeta,
        status: response.status ?? nextStatus ?? previousMeta.status,
      }));
      setSaveMessage(nextStatus === 'PUBLISHED' ? '게시 상태로 저장했습니다.' : '임시저장을 완료했습니다.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishStatus = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');

    try {
      const nextTemplateId = await handleEnsureDraftTemplate();
      await updateAdminGrammarTemplate(nextTemplateId, buildPayload('PUBLISHED'));
      const response = await updateAdminGrammarTemplateStatus(nextTemplateId, 'PUBLISHED');

      setMeta((previousMeta) => ({
        ...previousMeta,
        status: response.status ?? 'PUBLISHED',
      }));
      setSaveMessage('게시 상태로 변경했습니다.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '게시 상태 변경에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveStatus = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');

    try {
      const nextTemplateId = await handleEnsureDraftTemplate();
      await updateAdminGrammarTemplate(nextTemplateId, buildPayload('ARCHIVED'));
      const response = await updateAdminGrammarTemplateStatus(nextTemplateId, 'ARCHIVED');

      setMeta((previousMeta) => ({
        ...previousMeta,
        status: response.status ?? 'ARCHIVED',
      }));
      setSaveMessage('보관 상태로 변경했습니다.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '보관 상태 변경에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaUpload = useCallback(
    async (file: File, mediaType: AdminGrammarMediaType): Promise<AdminGrammarMediaResponse> => {
      const nextTemplateId = await handleEnsureDraftTemplate();

      return createAdminGrammarTemplateMedia(nextTemplateId, file, mediaType);
    },
    [handleEnsureDraftTemplate],
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-emerald-700">관리자 문법 템플릿</p>
          <h1 className="truncate text-2xl font-bold">{meta.title || '제목 없는 템플릿'}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void handleSaveTemplate('DRAFT')}
            disabled={isSaving}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />
            임시저장
          </button>
          <button
            type="button"
            onClick={() => void handlePublishStatus()}
            disabled={isSaving}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UploadCloud size={17} />
            게시
          </button>
          <button
            type="button"
            onClick={() => void handleArchiveStatus()}
            disabled={isSaving}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            title="보관"
          >
            <Archive size={17} />
          </button>
        </div>
      </header>

      <div className="grid h-[calc(100vh-5rem)] grid-cols-[18rem_minmax(0,1fr)_24rem] overflow-hidden">
        <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-900">섹션</h2>
            <button
              type="button"
              onClick={handleAddSection}
              title="섹션 추가"
              className="rounded p-2 text-emerald-700 hover:bg-emerald-50"
            >
              <Plus size={18} />
            </button>
          </div>

          <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {sections.map((section, index) => {
              const isActiveSection = section.id === activeSectionId;

              return (
                <div
                  key={section.id}
                  className={`rounded-md border ${isActiveSection ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSectionId(section.id)}
                    className="flex w-full items-center gap-2 px-3 py-3 text-left"
                  >
                    <GripVertical size={15} className="shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                      {section.heading || `${index + 1}. 제목 없음`}
                    </span>
                  </button>

                  {!section.isCollapsed ? (
                    <div className="flex items-center gap-1 border-t border-slate-200 px-2 py-2">
                      <button
                        type="button"
                        title="위로 이동"
                        onClick={() => handleMoveSection(section.id, 'up')}
                        disabled={index === 0}
                        className="rounded p-1.5 text-slate-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        type="button"
                        title="아래로 이동"
                        onClick={() => handleMoveSection(section.id, 'down')}
                        disabled={index === sections.length - 1}
                        className="rounded p-1.5 text-slate-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        type="button"
                        title="복제"
                        onClick={() => handleDuplicateSection(section.id)}
                        className="rounded p-1.5 text-slate-500 hover:bg-white"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        type="button"
                        title="삭제"
                        onClick={() => handleDeleteSection(section.id)}
                        disabled={sections.length === 1}
                        className="rounded p-1.5 text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={15} />
                      </button>
                      <button
                        type="button"
                        title="접기"
                        onClick={() => handleToggleSection(section.id)}
                        className="ml-auto rounded p-1.5 text-slate-500 hover:bg-white"
                      >
                        <ChevronUp size={15} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleSection(section.id)}
                      className="flex w-full items-center justify-between border-t border-slate-200 px-3 py-2 text-xs font-medium text-slate-500"
                    >
                      접힘
                      <ChevronDown size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="min-h-0 overflow-y-auto px-6 py-5">
          <div className="mx-auto max-w-5xl space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="section-heading">
                섹션 제목
              </label>
              <input
                id="section-heading"
                value={activeSection.heading}
                onChange={(event) => handleSectionHeadingChange(activeSection.id, event.target.value)}
                className="w-full rounded border border-slate-200 px-3 py-2 text-lg font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <RichTextEditor
              key={activeSection.id}
              value={activeSection.content}
              onChange={(content) => handleSectionContentChange(activeSection.id, content)}
              onMediaUpload={handleMediaUpload}
            />
          </div>
        </main>

        <aside className="min-h-0 overflow-y-auto border-l border-slate-200 bg-white">
          <section className="border-b border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText size={18} className="text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900">메타 정보</h2>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                템플릿 제목
                <input
                  value={meta.title}
                  onChange={(event) => handleMetaChange('title', event.target.value)}
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                언어
                <input
                  value={meta.language}
                  onChange={(event) => handleMetaChange('language', event.target.value)}
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                카테고리
                <input
                  value={meta.category}
                  onChange={(event) => handleMetaChange('category', event.target.value)}
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                난이도
                <select
                  value={meta.difficulty}
                  onChange={(event) => handleMetaChange('difficulty', event.target.value)}
                  className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="BEGINNER">BEGINNER</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                  <option value="ADVANCED">ADVANCED</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                상태
                <select
                  value={meta.status}
                  onChange={(event) =>
                    handleMetaChange('status', event.target.value as AdminGrammarTemplateStatus)
                  }
                  className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded bg-slate-50 px-3 py-2 text-xs text-slate-500">
                템플릿 ID: {templateId || '초안 생성 전'}
              </div>
            </div>

            {(saveMessage || saveError) && (
              <div
                className={`mt-4 rounded px-3 py-2 text-sm ${
                  saveError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {saveError || saveMessage}
              </div>
            )}
          </section>

          <section className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <PanelRightOpen size={18} className="text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900">미리보기</h2>
            </div>
            <TemplatePreview sections={sections} />
          </section>
        </aside>
      </div>

      <pre className="sr-only">{JSON.stringify(contentJson)}</pre>
    </div>
  );
}
