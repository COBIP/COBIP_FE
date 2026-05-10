'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/api/services/AdminService';
import type {
  AdminAccessLevel,
  AdminDifficulty,
  AdminTemplateDetail,
  AdminTemplatePayload,
  AdminTemplateSummary,
  AdminVisibility,
  PageResponse,
} from '@/types/AdminTypes';
import {
  AdminCard,
  AdminEmpty,
  AdminError,
  AdminPageTitle,
  AdminPagination,
  formatDateTime,
  formatNumber,
} from './AdminShell';

const difficulties: AdminDifficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const visibilities: AdminVisibility[] = ['PUBLIC', 'PRIVATE'];
const accessLevels: AdminAccessLevel[] = ['FREE', 'PREMIUM'];

type TemplateFormState = Omit<AdminTemplatePayload, 'techStacks' | 'interviewQuestions'> & {
  techStacksText: string;
  interviewQuestionsText: string;
};

const emptyForm: TemplateFormState = {
  title: '',
  description: '',
  category: '',
  difficulty: 'BEGINNER',
  techStacksText: '',
  designIntent: '',
  requirementsSpec: '',
  erd: '',
  apiSpec: '',
  projectStructure: '',
  interviewQuestionsText: '',
  visibility: 'PRIVATE',
  accessLevel: 'FREE',
};

function parseTextList(value: string) {
  return value
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatTextList(values?: string[]) {
  return values?.join('\n') ?? '';
}

function buildFormFromTemplate(template: AdminTemplateDetail): TemplateFormState {
  return {
    title: template.title ?? '',
    description: template.description ?? '',
    category: template.category ?? '',
    difficulty: template.difficulty,
    techStacksText: formatTextList(template.techStacks),
    designIntent: template.designIntent ?? '',
    requirementsSpec: template.requirementsSpec ?? '',
    erd: template.erd ?? '',
    apiSpec: template.apiSpec ?? '',
    projectStructure: template.projectStructure ?? '',
    interviewQuestionsText: formatTextList(template.interviewQuestions),
    visibility: template.visibility,
    accessLevel: template.accessLevel,
  };
}

function buildTemplatePayload(form: TemplateFormState): AdminTemplatePayload {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    difficulty: form.difficulty,
    techStacks: parseTextList(form.techStacksText),
    designIntent: form.designIntent.trim(),
    requirementsSpec: form.requirementsSpec.trim(),
    erd: form.erd.trim(),
    apiSpec: form.apiSpec.trim(),
    projectStructure: form.projectStructure.trim(),
    interviewQuestions: parseTextList(form.interviewQuestionsText),
    visibility: form.visibility,
    accessLevel: form.accessLevel,
  };
}

function checkSameList(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function buildTemplateUpdatePayload(template: AdminTemplateDetail, form: TemplateFormState) {
  const current = buildTemplatePayload(buildFormFromTemplate(template));
  const next = buildTemplatePayload(form);
  const payload: Partial<AdminTemplatePayload> = {};

  if (next.title !== current.title) payload.title = next.title;
  if (next.description !== current.description) payload.description = next.description;
  if (next.category !== current.category) payload.category = next.category;
  if (next.difficulty !== current.difficulty) payload.difficulty = next.difficulty;
  if (!checkSameList(next.techStacks, current.techStacks)) payload.techStacks = next.techStacks;
  if (next.designIntent !== current.designIntent) payload.designIntent = next.designIntent;
  if (next.requirementsSpec !== current.requirementsSpec) payload.requirementsSpec = next.requirementsSpec;
  if (next.erd !== current.erd) payload.erd = next.erd;
  if (next.apiSpec !== current.apiSpec) payload.apiSpec = next.apiSpec;
  if (next.projectStructure !== current.projectStructure) payload.projectStructure = next.projectStructure;
  if (!checkSameList(next.interviewQuestions, current.interviewQuestions)) {
    payload.interviewQuestions = next.interviewQuestions;
  }
  if (next.visibility !== current.visibility) payload.visibility = next.visibility;
  if (next.accessLevel !== current.accessLevel) payload.accessLevel = next.accessLevel;

  return payload;
}

function parseOwnerId(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function AdminTemplatesPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<AdminDifficulty | ''>('');
  const [visibility, setVisibility] = useState<AdminVisibility | ''>('');
  const [accessLevel, setAccessLevel] = useState<AdminAccessLevel | ''>('');
  const [ownerId, setOwnerId] = useState('');
  const [page, setPage] = useState(0);
  const [templates, setTemplates] = useState<PageResponse<AdminTemplateSummary> | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AdminTemplateDetail | null>(null);
  const [form, setForm] = useState<TemplateFormState>(emptyForm);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [adminMemo, setAdminMemo] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      setTemplates(
        await adminService.getTemplates({
          keyword,
          category,
          difficulty: difficulty || undefined,
          visibility: visibility || undefined,
          accessLevel: accessLevel || undefined,
          ownerId: parseOwnerId(ownerId),
          page,
          size: 20,
          sort: 'createdAt,desc',
        }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '기능 템플릿 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [accessLevel, category, difficulty, keyword, ownerId, page, visibility]);

  useEffect(() => {
    queueMicrotask(() => void loadTemplates());
  }, [loadTemplates]);

  const updateForm = <TKey extends keyof TemplateFormState>(key: TKey, value: TemplateFormState[TKey]) => {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    if (page === 0) {
      void loadTemplates();
      return;
    }

    setPage(0);
  };

  const handleNew = () => {
    setSelectedTemplate(null);
    setForm(emptyForm);
    setFormMode('create');
    setAdminMemo('');
    setError('');
    setMessage('');
  };

  const handleSelect = async (templateId: number) => {
    setError('');
    setMessage('');

    try {
      const detail = await adminService.getTemplate(templateId);
      setSelectedTemplate(detail);
      setForm(buildFormFromTemplate(detail));
      setFormMode('edit');
      setAdminMemo('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '기능 템플릿 상세를 불러오지 못했습니다.');
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = buildTemplatePayload(form);

      if (!payload.title || !payload.description || !payload.category) {
        throw new Error('제목, 설명, 카테고리는 필수입니다.');
      }

      const saved =
        formMode === 'create'
          ? await adminService.createTemplate(payload)
          : selectedTemplate
            ? await adminService.updateTemplate(selectedTemplate.id, buildTemplateUpdatePayload(selectedTemplate, form))
            : null;

      if (!saved) {
        throw new Error('수정할 템플릿을 선택해주세요.');
      }

      setSelectedTemplate(saved);
      setForm(buildFormFromTemplate(saved));
      setFormMode('edit');
      setMessage(formMode === 'create' ? '기능 템플릿을 생성했습니다.' : '기능 템플릿을 수정했습니다.');
      await loadTemplates();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '기능 템플릿 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExposureChange = async (
    template: AdminTemplateSummary | AdminTemplateDetail,
    nextVisibility: AdminVisibility,
    nextAccessLevel: AdminAccessLevel,
  ) => {
    setError('');

    try {
      const updated = await adminService.updateTemplateExposure(template.id, {
        visibility: nextVisibility,
        accessLevel: nextAccessLevel,
      });

      setMessage('기능 템플릿 노출 정보를 변경했습니다.');

      if (selectedTemplate?.id === updated.id) {
        setSelectedTemplate(updated);
        setForm(buildFormFromTemplate(updated));
      }

      await loadTemplates();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : '노출 정보 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (template: AdminTemplateSummary | AdminTemplateDetail) => {
    if (!confirm(`"${template.title}" 기능 템플릿을 삭제할까요?`)) {
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      await adminService.deleteTemplate(template.id);

      if (selectedTemplate?.id === template.id) {
        handleNew();
      }

      setMessage('기능 템플릿을 삭제했습니다.');
      await loadTemplates();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '기능 템플릿 삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleModeration = async (action: 'BLIND' | 'DELETE') => {
    if (!selectedTemplate || !confirm(`${action} 제재를 적용할까요?`)) {
      return;
    }

    setError('');

    try {
      await adminService.moderateContent({
        targetType: 'TEMPLATE',
        targetId: selectedTemplate.id,
        action,
        adminMemo,
      });
      setMessage('콘텐츠 제재를 적용했습니다.');
    } catch (moderationError) {
      setError(moderationError instanceof Error ? moderationError.message : '콘텐츠 제재에 실패했습니다.');
    }
  };

  return (
    <div>
      <AdminPageTitle title="기능 템플릿 관리" description="기능 템플릿 본문, 공개 상태, 접근 등급을 관리합니다." />

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.35fr)_minmax(28rem,0.9fr)]">
        <div className="space-y-4">
          <AdminCard>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_9rem_10rem_10rem_10rem_8rem_auto]">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="템플릿 검색"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="category"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as AdminDifficulty | '')}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">난이도 전체</option>
                {difficulties.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value as AdminVisibility | '')}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">공개 전체</option>
                {visibilities.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={accessLevel}
                onChange={(event) => setAccessLevel(event.target.value as AdminAccessLevel | '')}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">등급 전체</option>
                {accessLevels.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                value={ownerId}
                onChange={(event) => setOwnerId(event.target.value)}
                placeholder="ownerId"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white"
              >
                검색
              </button>
            </div>
          </AdminCard>

          <AdminError message={error} />
          {message && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <AdminCard>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">총 {formatNumber(templates?.totalElements ?? 0)}개</p>
              <div className="flex items-center gap-3">
                {isLoading && <p className="text-sm text-slate-500">불러오는 중</p>}
                <button
                  type="button"
                  onClick={handleNew}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  새 템플릿
                </button>
              </div>
            </div>

            {!templates?.content.length ? (
              <AdminEmpty message="기능 템플릿이 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-3">템플릿</th>
                      <th className="py-3">분류</th>
                      <th className="py-3">노출</th>
                      <th className="py-3">등급</th>
                      <th className="py-3">소유자</th>
                      <th className="py-3">지표</th>
                      <th className="py-3">생성일</th>
                      <th className="py-3 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {templates.content.map((template) => (
                      <tr key={template.id} className="hover:bg-slate-50">
                        <td className="py-3">
                          <p className="font-semibold">{template.title}</p>
                          <p className="text-xs text-slate-500">#{template.id}</p>
                        </td>
                        <td className="py-3">
                          {template.category} · {template.difficulty}
                        </td>
                        <td className="py-3">
                          <select
                            value={template.visibility}
                            onChange={(event) =>
                              void handleExposureChange(
                                template,
                                event.target.value as AdminVisibility,
                                template.accessLevel,
                              )
                            }
                            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs"
                          >
                            {visibilities.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3">
                          <select
                            value={template.accessLevel}
                            onChange={(event) =>
                              void handleExposureChange(
                                template,
                                template.visibility,
                                event.target.value as AdminAccessLevel,
                              )
                            }
                            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs"
                          >
                            {accessLevels.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3">
                          {template.ownerNickname}
                          <span className="ml-1 text-xs text-slate-400">({template.ownerId})</span>
                        </td>
                        <td className="py-3 text-xs text-slate-500">
                          조회 {formatNumber(template.viewCount)} · 즐겨찾기 {formatNumber(template.favoriteCount)}
                        </td>
                        <td className="py-3">{formatDateTime(template.createdAt)}</td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/templates/${template.id}/practice`}
                              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                            >
                              실습
                            </Link>
                            <button
                              type="button"
                              onClick={() => void handleSelect(template.id)}
                              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(template)}
                              className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <AdminPagination page={page} totalPages={templates?.totalPages ?? 1} onPageChange={setPage} />
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {formMode === 'create' ? '기능 템플릿 생성' : '기능 템플릿 수정'}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedTemplate ? `#${selectedTemplate.id} · ${formatDateTime(selectedTemplate.updatedAt)}` : '새 템플릿'}
                </p>
              </div>
              {selectedTemplate && (
                <Link
                  href={`/admin/templates/${selectedTemplate.id}/practice`}
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  실습 관리
                </Link>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
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
                  공개 상태
                  <select
                    value={form.visibility}
                    onChange={(event) => updateForm('visibility', event.target.value as AdminVisibility)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    {visibilities.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  접근 등급
                  <select
                    value={form.accessLevel}
                    onChange={(event) => updateForm('accessLevel', event.target.value as AdminAccessLevel)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    {accessLevels.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  기술 스택
                  <textarea
                    value={form.techStacksText}
                    onChange={(event) => updateForm('techStacksText', event.target.value)}
                    placeholder="Spring, JWT, Redis"
                    rows={3}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                  설명
                  <textarea
                    value={form.description}
                    onChange={(event) => updateForm('description', event.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                  설계 의도
                  <textarea
                    value={form.designIntent}
                    onChange={(event) => updateForm('designIntent', event.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                  요구사항
                  <textarea
                    value={form.requirementsSpec}
                    onChange={(event) => updateForm('requirementsSpec', event.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  ERD
                  <textarea
                    value={form.erd}
                    onChange={(event) => updateForm('erd', event.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  API 명세
                  <textarea
                    value={form.apiSpec}
                    onChange={(event) => updateForm('apiSpec', event.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                  프로젝트 구조
                  <textarea
                    value={form.projectStructure}
                    onChange={(event) => updateForm('projectStructure', event.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                  면접 질문
                  <textarea
                    value={form.interviewQuestionsText}
                    onChange={(event) => updateForm('interviewQuestionsText', event.target.value)}
                    placeholder="질문을 줄바꿈 또는 쉼표로 구분"
                    rows={4}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {formMode === 'create' ? '생성' : '수정'}
                </button>
                <button
                  type="button"
                  onClick={handleNew}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  새로 작성
                </button>
                {selectedTemplate && (
                  <button
                    type="button"
                    onClick={() => void handleDelete(selectedTemplate)}
                    className="ml-auto rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
                  >
                    삭제
                  </button>
                )}
              </div>
            </form>
          </AdminCard>

          {selectedTemplate && (
            <AdminCard>
              <h3 className="text-sm font-bold text-slate-950">콘텐츠 제재</h3>
              <textarea
                value={adminMemo}
                onChange={(event) => setAdminMemo(event.target.value)}
                placeholder="관리자 메모"
                rows={3}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleModeration('BLIND')}
                  className="rounded-md border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700"
                >
                  BLIND
                </button>
                <button
                  type="button"
                  onClick={() => void handleModeration('DELETE')}
                  className="rounded-md border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700"
                >
                  DELETE
                </button>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}
