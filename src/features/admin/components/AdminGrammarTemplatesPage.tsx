'use client';

import { useCallback, useEffect, useState } from 'react';
import type { JSONContent } from '@tiptap/core';
import { adminService } from '@/api/services/AdminService';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import type {
  AdminDifficulty,
  GrammarTemplateDetail,
  GrammarTemplateLanguage,
  GrammarTemplatePayload,
  GrammarTemplateStatus,
  PageResponse,
} from '@/types/AdminTypes';
import type { AdminGrammarMediaResponse, AdminGrammarMediaType } from '@/types/AdminGrammarTemplateTypes';
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
  content: [{ type: 'paragraph' }],
};

const emptyForm: GrammarTemplatePayload = {
  slug: '',
  title: '',
  language: 'JAVA',
  category: '',
  difficulty: 'BEGINNER',
  summary: '',
  status: 'DRAFT',
  contentJson: defaultContent,
};

function buildSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminGrammarTemplatesPage() {
  const [keyword, setKeyword] = useState('');
  const [language, setLanguage] = useState<GrammarTemplateLanguage | ''>('');
  const [status, setStatus] = useState<GrammarTemplateStatus | ''>('');
  const [page, setPage] = useState(0);
  const [templates, setTemplates] = useState<PageResponse<GrammarTemplateDetail> | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<GrammarTemplatePayload>(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      setTemplates(
        await adminService.getGrammarTemplates({
          keyword,
          language: language || undefined,
          status: status || undefined,
          page,
          size: 20,
          sort: 'createdAt,desc',
        }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '문법 템플릿 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, language, page, status]);

  useEffect(() => {
    queueMicrotask(() => void loadTemplates());
  }, [loadTemplates]);

  const updateForm = <TKey extends keyof GrammarTemplatePayload>(key: TKey, value: GrammarTemplatePayload[TKey]) => {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  };

  const handleNew = () => {
    setSelectedId(null);
    setForm(emptyForm);
    setMessage('');
    setError('');
  };

  const handleSelect = async (templateId: number) => {
    setError('');
    setMessage('');

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
        contentJson: detail.contentJson ?? defaultContent,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '문법 템플릿 상세를 불러오지 못했습니다.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        ...form,
        slug: form.slug || buildSlug(form.title),
      };
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
        contentJson: saved.contentJson ?? payload.contentJson,
      });
      setMessage('문법 템플릿을 저장했습니다.');
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

    try {
      const updated = await adminService.updateGrammarTemplateStatus(selectedId, nextStatus);
      updateForm('status', updated.status);
      setMessage(`${nextStatus} 상태로 변경했습니다.`);
      await loadTemplates();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : '상태 변경에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
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

  const handleMediaUpload = async (
    file: File,
    mediaType: AdminGrammarMediaType,
  ): Promise<AdminGrammarMediaResponse> => {
    if (!selectedId) {
      throw new Error('이미지/영상 업로드는 템플릿 저장 후 사용할 수 있습니다.');
    }

    return adminService.uploadGrammarTemplateMedia(selectedId, file, mediaType);
  };

  return (
    <div>
      <AdminPageTitle title="문법 템플릿 관리" description="문법 템플릿을 검색하고 리치 에디터로 작성합니다." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
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
                className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
              >
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
                    <span className="mt-1 block text-xs text-slate-400">{formatDateTime(template.updatedAt)}</span>
                  </button>
                ))}
              </div>
            )}

            <AdminPagination page={page} totalPages={templates?.totalPages ?? 1} onPageChange={setPage} />
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminError message={error} />
          {message && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <AdminCard>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
              <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                요약
                <textarea
                  value={form.summary}
                  onChange={(event) => updateForm('summary', event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                저장
              </button>
              {selectedId &&
                statuses.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => void handleStatusUpdate(option)}
                    disabled={form.status === option || isSaving}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                  >
                    {option}
                  </button>
                ))}
              {selectedId && (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  className="ml-auto rounded-md border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700"
                >
                  삭제
                </button>
              )}
            </div>
          </AdminCard>

          <RichTextEditor
            key={selectedId ?? 'new'}
            value={form.contentJson}
            onChange={(content) => updateForm('contentJson', content)}
            onMediaUpload={handleMediaUpload}
          />
        </div>
      </div>
    </div>
  );
}
