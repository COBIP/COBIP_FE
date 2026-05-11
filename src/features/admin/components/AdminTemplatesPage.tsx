'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/api/services/AdminService';
import type {
  AdminAccessLevel,
  AdminDifficulty,
  AdminTemplateDetail,
  AdminTemplateInterviewQuestion,
  AdminTemplateMissionDraft,
  AdminTemplatePayload,
  AdminTemplateRequirement,
  AdminTemplateSummary,
  AdminTemplateTestCase,
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
const runtimes = ['node', 'python', 'java', 'browser', 'none'];

type TemplateFormState = {
  title: string;
  summary: string;
  description: string;
  category: string;
  difficulty: AdminDifficulty;
  techStacksText: string;
  designIntent: string;
  structure: string;
  requirements: AdminTemplateRequirement[];
  missions: AdminTemplateMissionDraft[];
  erd: string;
  apiSpec: string;
  interviewQuestions: AdminTemplateInterviewQuestion[];
  runtime: string;
  testCases: AdminTemplateTestCase[];
  tagsText: string;
  previewImage: string;
  visibility: AdminVisibility;
  accessLevel: AdminAccessLevel;
  published: boolean;
  license: string;
  source: string;
};

const emptyForm: TemplateFormState = {
  title: '',
  summary: '',
  description: '',
  category: '',
  difficulty: 'BEGINNER',
  techStacksText: '',
  designIntent: '',
  structure: '',
  requirements: [],
  missions: [],
  erd: '',
  apiSpec: '',
  interviewQuestions: [],
  runtime: 'node',
  testCases: [],
  tagsText: '',
  previewImage: '',
  visibility: 'PRIVATE',
  accessLevel: 'FREE',
  published: false,
  license: '',
  source: '',
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

function buildInterviewQuestions(
  values?: Array<string | AdminTemplateInterviewQuestion>,
): AdminTemplateInterviewQuestion[] {
  return (
    values?.map((value) =>
      typeof value === 'string'
        ? {
            question: value,
            answerHint: '',
          }
        : {
            question: value.question ?? '',
            answerHint: value.answerHint ?? '',
          },
    ) ?? []
  );
}

function buildRequirementSpec(requirements: AdminTemplateRequirement[]) {
  return requirements
    .map((requirement) => {
      const optionalText = requirement.optionalFlag ? 'optional' : 'required';

      return `[${requirement.type || 'general'}:${optionalText}] ${requirement.description}`;
    })
    .join('\n');
}

function buildFormFromTemplate(template: AdminTemplateDetail): TemplateFormState {
  return {
    title: template.title ?? '',
    summary: template.summary ?? '',
    description: template.description ?? '',
    category: template.category ?? '',
    difficulty: template.difficulty,
    techStacksText: formatTextList(template.techStacks),
    designIntent: template.designIntent ?? '',
    structure: template.structure ?? template.projectStructure ?? '',
    requirements: template.requirements ?? [],
    missions: template.missions ?? [],
    erd: template.erd ?? '',
    apiSpec: template.apiSpec ?? '',
    interviewQuestions: buildInterviewQuestions(template.interviewQuestions),
    runtime: template.runtime ?? 'node',
    testCases: template.testCases ?? [],
    tagsText: formatTextList(template.tags),
    previewImage: template.previewImage ?? template.thumbnailUrl ?? '',
    visibility: template.visibility,
    accessLevel: template.accessLevel,
    published: template.published ?? template.visibility === 'PUBLIC',
    license: template.license ?? '',
    source: template.source ?? '',
  };
}

function buildTemplatePayload(form: TemplateFormState): AdminTemplatePayload {
  const requirements = form.requirements
    .map((requirement) => ({
      type: requirement.type.trim(),
      description: requirement.description.trim(),
      optionalFlag: requirement.optionalFlag,
    }))
    .filter((requirement) => requirement.type || requirement.description);
  const missions = form.missions
    .map((mission) => ({
      id: mission.id.trim(),
      title: mission.title.trim(),
      steps: mission.steps.map((step) => step.trim()).filter(Boolean),
    }))
    .filter((mission) => mission.id || mission.title || mission.steps.length);
  const interviewQuestions = form.interviewQuestions
    .map((question) => ({
      question: question.question.trim(),
      answerHint: question.answerHint.trim(),
    }))
    .filter((question) => question.question || question.answerHint);
  const testCases = form.testCases
    .map((testCase) => ({
      input: testCase.input.trim(),
      expectedOutput: testCase.expectedOutput.trim(),
      validationScript: testCase.validationScript?.trim() || undefined,
    }))
    .filter((testCase) => testCase.input || testCase.expectedOutput || testCase.validationScript);
  const structure = form.structure.trim();

  return {
    title: form.title.trim(),
    summary: form.summary.trim() || undefined,
    description: form.description.trim(),
    category: form.category.trim(),
    difficulty: form.difficulty,
    techStacks: parseTextList(form.techStacksText),
    designIntent: form.designIntent.trim(),
    structure,
    requirements,
    requirementsSpec: buildRequirementSpec(requirements),
    missions,
    erd: form.erd.trim(),
    apiSpec: form.apiSpec.trim(),
    projectStructure: structure,
    interviewQuestions,
    runtime: form.runtime,
    testCases,
    tags: parseTextList(form.tagsText),
    previewImage: form.previewImage.trim() || undefined,
    visibility: form.visibility,
    accessLevel: form.accessLevel,
    published: form.published,
    license: form.license.trim() || undefined,
    source: form.source.trim() || undefined,
  };
}

function checkSameValue(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function buildTemplateUpdatePayload(template: AdminTemplateDetail, form: TemplateFormState) {
  const current = buildTemplatePayload(buildFormFromTemplate(template));
  const next = buildTemplatePayload(form);
  const payload: Partial<AdminTemplatePayload> = {};

  (Object.keys(next) as Array<keyof AdminTemplatePayload>).forEach((key) => {
    if (!checkSameValue(next[key], current[key])) {
      Object.assign(payload, { [key]: next[key] });
    }
  });

  return payload;
}

function parseOwnerId(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function validateTemplatePayload(payload: AdminTemplatePayload) {
  if (!payload.title) {
    throw new Error('제목은 필수입니다.');
  }

  if (!payload.category) {
    throw new Error('카테고리는 필수입니다.');
  }

  const hasInvalidRequirement = payload.requirements?.some(
    (requirement) => !requirement.type || !requirement.description,
  );

  if (hasInvalidRequirement) {
    throw new Error('요구사항은 type과 description을 모두 입력해야 합니다.');
  }

  const hasInvalidMission = payload.missions?.some(
    (mission) => !mission.id || !mission.title || !mission.steps.length,
  );

  if (hasInvalidMission) {
    throw new Error('미션은 id, title, steps를 모두 입력해야 합니다.');
  }

  const hasInvalidQuestion = payload.interviewQuestions.some((question) => !question.question);

  if (hasInvalidQuestion) {
    throw new Error('면접질문은 question을 입력해야 합니다.');
  }

  const hasInvalidTestCase = payload.testCases?.some((testCase) => !testCase.input || !testCase.expectedOutput);

  if (hasInvalidTestCase) {
    throw new Error('테스트케이스는 입력과 기대 출력을 모두 입력해야 합니다.');
  }

  if (payload.previewImage) {
    try {
      new URL(payload.previewImage);
    } catch {
      throw new Error('미리보기 이미지는 올바른 URL이어야 합니다.');
    }
  }
}

function createRequirement(): AdminTemplateRequirement {
  return { type: '', description: '', optionalFlag: false };
}

function createTemplateMission(): AdminTemplateMissionDraft {
  return { id: '', title: '', steps: [''] };
}

function createInterviewQuestion(): AdminTemplateInterviewQuestion {
  return { question: '', answerHint: '' };
}

function createTestCase(): AdminTemplateTestCase {
  return { input: '', expectedOutput: '', validationScript: '' };
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

      validateTemplatePayload(payload);

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

  const updateRequirement = <TKey extends keyof AdminTemplateRequirement>(
    index: number,
    key: TKey,
    value: AdminTemplateRequirement[TKey],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      requirements: currentForm.requirements.map((requirement, requirementIndex) =>
        requirementIndex === index ? { ...requirement, [key]: value } : requirement,
      ),
    }));
  };

  const deleteRequirement = (index: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      requirements: currentForm.requirements.filter((_, requirementIndex) => requirementIndex !== index),
    }));
  };

  const updateTemplateMission = <TKey extends keyof AdminTemplateMissionDraft>(
    index: number,
    key: TKey,
    value: AdminTemplateMissionDraft[TKey],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      missions: currentForm.missions.map((mission, missionIndex) =>
        missionIndex === index ? { ...mission, [key]: value } : mission,
      ),
    }));
  };

  const updateTemplateMissionSteps = (index: number, value: string) => {
    updateTemplateMission(index, 'steps', value.split(/\r?\n/g));
  };

  const deleteTemplateMission = (index: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      missions: currentForm.missions.filter((_, missionIndex) => missionIndex !== index),
    }));
  };

  const updateInterviewQuestion = <TKey extends keyof AdminTemplateInterviewQuestion>(
    index: number,
    key: TKey,
    value: AdminTemplateInterviewQuestion[TKey],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      interviewQuestions: currentForm.interviewQuestions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [key]: value } : question,
      ),
    }));
  };

  const deleteInterviewQuestion = (index: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      interviewQuestions: currentForm.interviewQuestions.filter((_, questionIndex) => questionIndex !== index),
    }));
  };

  const updateTestCase = <TKey extends keyof AdminTemplateTestCase>(
    index: number,
    key: TKey,
    value: AdminTemplateTestCase[TKey],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      testCases: currentForm.testCases.map((testCase, testCaseIndex) =>
        testCaseIndex === index ? { ...testCase, [key]: value } : testCase,
      ),
    }));
  };

  const deleteTestCase = (index: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      testCases: currentForm.testCases.filter((_, testCaseIndex) => testCaseIndex !== index),
    }));
  };

  return (
    <div>
      <AdminPageTitle title="기능 템플릿 관리" description="기능 템플릿 본문, 실습 메타데이터, 공개 상태를 관리합니다." />

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.2fr)_minmax(32rem,1fr)]">
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
                          <p className="text-xs text-slate-500">{template.summary || `#${template.id}`}</p>
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

            <form onSubmit={handleSave} className="space-y-5">
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
                  요약
                  <input
                    value={form.summary}
                    onChange={(event) => updateForm('summary', event.target.value)}
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
                  런타임
                  <select
                    value={form.runtime}
                    onChange={(event) => updateForm('runtime', event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    {runtimes.map((runtime) => (
                      <option key={runtime} value={runtime}>
                        {runtime}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  태그
                  <input
                    value={form.tagsText}
                    onChange={(event) => updateForm('tagsText', event.target.value)}
                    placeholder="auth, jwt, backend"
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
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
                <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(event) => updateForm('published', event.target.checked)}
                  />
                  published
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  미리보기 이미지 URL
                  <input
                    value={form.previewImage}
                    onChange={(event) => updateForm('previewImage', event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  라이선스
                  <input
                    value={form.license}
                    onChange={(event) => updateForm('license', event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  출처
                  <input
                    value={form.source}
                    onChange={(event) => updateForm('source', event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-slate-700">
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
                  상세설명
                  <textarea
                    value={form.description}
                    onChange={(event) => updateForm('description', event.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                  설계 의도
                  <textarea
                    value={form.designIntent}
                    onChange={(event) => updateForm('designIntent', event.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                  구조
                  <textarea
                    value={form.structure}
                    onChange={(event) => updateForm('structure', event.target.value)}
                    rows={5}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
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
              </div>

              <section className="rounded-md border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-950">요구사항</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        requirements: [...currentForm.requirements, createRequirement()],
                      }))
                    }
                    className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                  >
                    추가
                  </button>
                </div>
                <div className="space-y-2">
                  {form.requirements.map((requirement, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2 md:grid-cols-[8rem_minmax(0,1fr)_6rem_auto]">
                      <input
                        value={requirement.type}
                        onChange={(event) => updateRequirement(index, 'type', event.target.value)}
                        placeholder="type"
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                      />
                      <input
                        value={requirement.description}
                        onChange={(event) => updateRequirement(index, 'description', event.target.value)}
                        placeholder="description"
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                      />
                      <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm">
                        <input
                          type="checkbox"
                          checked={requirement.optionalFlag}
                          onChange={(event) => updateRequirement(index, 'optionalFlag', event.target.checked)}
                        />
                        optional
                      </label>
                      <button
                        type="button"
                        onClick={() => deleteRequirement(index)}
                        className="rounded-md border border-rose-300 px-3 text-xs font-semibold text-rose-700"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-950">미션</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        missions: [...currentForm.missions, createTemplateMission()],
                      }))
                    }
                    className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                  >
                    추가
                  </button>
                </div>
                <div className="space-y-3">
                  {form.missions.map((mission, index) => (
                    <div key={index} className="rounded-md bg-slate-50 p-3">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-[8rem_minmax(0,1fr)_auto]">
                        <input
                          value={mission.id}
                          onChange={(event) => updateTemplateMission(index, 'id', event.target.value)}
                          placeholder="id"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                        <input
                          value={mission.title}
                          onChange={(event) => updateTemplateMission(index, 'title', event.target.value)}
                          placeholder="title"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => deleteTemplateMission(index)}
                          className="rounded-md border border-rose-300 px-3 text-xs font-semibold text-rose-700"
                        >
                          삭제
                        </button>
                      </div>
                      <textarea
                        value={mission.steps.join('\n')}
                        onChange={(event) => updateTemplateMissionSteps(index, event.target.value)}
                        placeholder="steps"
                        rows={4}
                        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-950">면접질문</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        interviewQuestions: [...currentForm.interviewQuestions, createInterviewQuestion()],
                      }))
                    }
                    className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                  >
                    추가
                  </button>
                </div>
                <div className="space-y-2">
                  {form.interviewQuestions.map((question, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                      <input
                        value={question.question}
                        onChange={(event) => updateInterviewQuestion(index, 'question', event.target.value)}
                        placeholder="question"
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                      />
                      <input
                        value={question.answerHint}
                        onChange={(event) => updateInterviewQuestion(index, 'answerHint', event.target.value)}
                        placeholder="answerHint"
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => deleteInterviewQuestion(index)}
                        className="rounded-md border border-rose-300 px-3 text-xs font-semibold text-rose-700"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-950">테스트케이스</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        testCases: [...currentForm.testCases, createTestCase()],
                      }))
                    }
                    className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                  >
                    추가
                  </button>
                </div>
                <div className="space-y-3">
                  {form.testCases.map((testCase, index) => (
                    <div key={index} className="rounded-md bg-slate-50 p-3">
                      <div className="mb-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => deleteTestCase(index)}
                          className="rounded-md border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700"
                        >
                          삭제
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <textarea
                          value={testCase.input}
                          onChange={(event) => updateTestCase(index, 'input', event.target.value)}
                          placeholder="input"
                          rows={4}
                          className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
                        />
                        <textarea
                          value={testCase.expectedOutput}
                          onChange={(event) => updateTestCase(index, 'expectedOutput', event.target.value)}
                          placeholder="expectedOutput"
                          rows={4}
                          className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
                        />
                        <textarea
                          value={testCase.validationScript ?? ''}
                          onChange={(event) => updateTestCase(index, 'validationScript', event.target.value)}
                          placeholder="validationScript"
                          rows={4}
                          className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

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
