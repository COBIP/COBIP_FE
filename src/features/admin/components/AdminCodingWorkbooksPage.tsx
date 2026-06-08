'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Save, Search, Trash2 } from 'lucide-react';
import { adminCodingWorkbookService } from '@/api/services/AdminCodingWorkbookService';
import type { CodingDifficulty } from '@/types/CodingWorkbookTypes';
import type { CodingLanguage } from '@/types/CodingProblemTypes';
import type {
  AdminCodingProblemDetail,
  AdminCodingProblemPayload,
  AdminCodingProblemStarterCode,
  AdminCodingProblemSummary,
  AdminCodingProblemTestCase,
  AdminCodingWorkbookDetail,
  AdminCodingWorkbookPayload,
  AdminCodingWorkbookSummary,
  CodingProblemStatus,
  CodingWorkbookStatus,
  PageResponse,
  TiptapTextDoc,
} from '@/types/AdminCodingWorkbookTypes';
import {
  AdminCard,
  AdminEmpty,
  AdminError,
  AdminPageTitle,
  AdminPagination,
  formatDateTime,
  formatNumber,
} from './AdminShell';

const difficulties: CodingDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];
const statuses: CodingWorkbookStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const problemStatuses: CodingProblemStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const languages: CodingLanguage[] = ['PYTHON', 'JAVA', 'JAVASCRIPT'];

type WorkbookForm = AdminCodingWorkbookPayload;
type ProblemForm = Omit<AdminCodingProblemPayload, 'contentJson' | 'explanationJson'> & {
  contentText: string;
  explanationText: string;
};
type FormMode = 'hidden' | 'create' | 'edit';

const emptyWorkbookForm: WorkbookForm = {
  slug: '',
  title: '',
  category: 'algorithm',
  difficulty: 'EASY',
  summary: '',
  description: '',
  status: 'DRAFT',
  displayOrder: 1,
};

const starterCodeByLanguage: Record<CodingLanguage, string> = {
  PYTHON: "import sys\n\ninput = sys.stdin.readline\n\n# 여기에 풀이를 작성하세요.\n",
  JAVA: 'import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // 여기에 풀이를 작성하세요.\n    }\n}\n',
  JAVASCRIPT: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim();\n\n// 여기에 풀이를 작성하세요.\n",
};

function createStarterCodes(): AdminCodingProblemStarterCode[] {
  return languages.map((language) => ({
    language,
    code: starterCodeByLanguage[language],
  }));
}

function createProblemForm(orderIndex = 1): ProblemForm {
  return {
    title: '',
    category: 'algorithm',
    difficulty: 'EASY',
    contentText: '',
    explanationText: '',
    orderIndex,
    timeLimitMillis: 2000,
    memoryLimitMb: 256,
    status: 'DRAFT',
    testCases: [
      {
        input: '',
        expectedOutput: '',
        sample: true,
        orderIndex: 1,
      },
    ],
    starterCodes: createStarterCodes(),
  };
}

function buildSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildDocFromText(value: string): TiptapTextDoc {
  const lines = value.replace(/\r\n/g, '\n').split('\n');

  return {
    type: 'doc',
    content: lines.map((line) => ({
      type: 'paragraph',
      content: line ? [{ type: 'text', text: line }] : undefined,
    })),
  };
}

function parseTextFromDoc(doc?: TiptapTextDoc | null) {
  if (!doc?.content?.length) {
    return '';
  }

  return doc.content
    .map((paragraph) => paragraph.content?.map((textNode) => textNode.text).join('') ?? '')
    .join('\n');
}

function buildWorkbookForm(workbook: AdminCodingWorkbookDetail | AdminCodingWorkbookSummary): WorkbookForm {
  return {
    slug: workbook.slug,
    title: workbook.title,
    category: workbook.category,
    difficulty: workbook.difficulty,
    summary: workbook.summary,
    description: 'description' in workbook ? workbook.description ?? '' : '',
    status: workbook.status,
    displayOrder: workbook.displayOrder,
  };
}

function buildProblemForm(problem: AdminCodingProblemDetail): ProblemForm {
  return {
    title: problem.title,
    category: problem.category,
    difficulty: problem.difficulty,
    contentText: parseTextFromDoc(problem.contentJson),
    explanationText: parseTextFromDoc(problem.explanationJson),
    orderIndex: problem.orderIndex,
    timeLimitMillis: problem.timeLimitMillis,
    memoryLimitMb: problem.memoryLimitMb,
    status: problem.status,
    testCases: problem.testCases.length ? problem.testCases : createProblemForm().testCases,
    starterCodes: languages.map((language) => (
      problem.starterCodes.find((starterCode) => starterCode.language === language) ?? {
        language,
        code: starterCodeByLanguage[language],
      }
    )),
  };
}

function buildProblemPayload(form: ProblemForm): AdminCodingProblemPayload {
  return {
    title: form.title.trim(),
    category: form.category.trim(),
    difficulty: form.difficulty,
    contentJson: buildDocFromText(form.contentText.trim()),
    explanationJson: buildDocFromText(form.explanationText.trim()),
    orderIndex: form.orderIndex,
    timeLimitMillis: form.timeLimitMillis,
    memoryLimitMb: form.memoryLimitMb,
    status: form.status,
    testCases: form.testCases
      .map((testCase, index) => ({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        sample: testCase.sample,
        orderIndex: testCase.orderIndex || index + 1,
      }))
      .filter((testCase) => testCase.expectedOutput.trim()),
    starterCodes: form.starterCodes
      .map((starterCode) => ({
        language: starterCode.language,
        code: starterCode.code,
      }))
      .filter((starterCode) => starterCode.code.trim()),
  };
}

function validateWorkbook(form: WorkbookForm) {
  if (!form.slug.trim() || !form.title.trim() || !form.category.trim() || !form.summary.trim()) {
    throw new Error('문제집 slug, 제목, 카테고리, 요약은 필수입니다.');
  }
}

function validateProblem(form: ProblemForm) {
  if (!form.title.trim() || !form.category.trim() || !form.contentText.trim()) {
    throw new Error('문제 제목, 카테고리, 문제 설명은 필수입니다.');
  }

  if (!form.testCases.some((testCase) => testCase.expectedOutput.trim())) {
    throw new Error('채점 가능한 테스트케이스를 1개 이상 입력해야 합니다.');
  }

  if (!form.starterCodes.some((starterCode) => starterCode.code.trim())) {
    throw new Error('스타터 코드를 1개 이상 입력해야 합니다.');
  }
}

function getNextProblemOrder(problems: AdminCodingProblemSummary[]) {
  return problems.length ? Math.max(...problems.map((problem) => problem.orderIndex)) + 1 : 1;
}

export function AdminCodingWorkbooksPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<CodingDifficulty | ''>('');
  const [status, setStatus] = useState<CodingWorkbookStatus | ''>('');
  const [page, setPage] = useState(0);
  const [workbooks, setWorkbooks] = useState<PageResponse<AdminCodingWorkbookSummary> | null>(null);
  const [selectedWorkbook, setSelectedWorkbook] = useState<AdminCodingWorkbookDetail | null>(null);
  const [workbookForm, setWorkbookForm] = useState<WorkbookForm>(emptyWorkbookForm);
  const [workbookFormMode, setWorkbookFormMode] = useState<FormMode>('hidden');
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [problemForm, setProblemForm] = useState<ProblemForm>(() => createProblemForm());
  const [problemFormMode, setProblemFormMode] = useState<FormMode>('hidden');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const problems = useMemo(
    () => [...(selectedWorkbook?.problems ?? [])].sort((left, right) => left.orderIndex - right.orderIndex || left.id - right.id),
    [selectedWorkbook?.problems],
  );

  const loadWorkbooks = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      setWorkbooks(
        await adminCodingWorkbookService.getWorkbooks({
          keyword,
          category,
          difficulty: difficulty || undefined,
          status: status || undefined,
          page,
          size: 20,
          sort: 'displayOrder,asc',
        }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '코테집 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [category, difficulty, keyword, page, status]);

  const loadWorkbookDetail = useCallback(async (workbookId: number) => {
    const detail = await adminCodingWorkbookService.getWorkbook(workbookId);

    setSelectedWorkbook(detail);
    setWorkbookForm(buildWorkbookForm(detail));
    setSelectedProblemId(null);
    setProblemForm(createProblemForm(getNextProblemOrder(detail.problems)));
    setWorkbookFormMode('hidden');
    setProblemFormMode('hidden');
  }, []);

  useEffect(() => {
    queueMicrotask(() => void loadWorkbooks());
  }, [loadWorkbooks]);

  const handleNewWorkbook = () => {
    setSelectedWorkbook(null);
    setWorkbookForm(emptyWorkbookForm);
    setWorkbookFormMode('create');
    setSelectedProblemId(null);
    setProblemForm(createProblemForm());
    setProblemFormMode('hidden');
    setMessage('');
    setError('');
  };

  const handleEditWorkbook = async (workbookId: number) => {
    try {
      setError('');
      const detail = await adminCodingWorkbookService.getWorkbook(workbookId);

      setSelectedWorkbook(detail);
      setWorkbookForm(buildWorkbookForm(detail));
      setSelectedProblemId(null);
      setProblemForm(createProblemForm(getNextProblemOrder(detail.problems)));
      setWorkbookFormMode('edit');
      setProblemFormMode('hidden');
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : '코테집을 불러오지 못했습니다.');
    }
  };

  const handleSaveWorkbook = async () => {
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      validateWorkbook(workbookForm);

      const payload = {
        ...workbookForm,
        slug: workbookForm.slug.trim(),
        title: workbookForm.title.trim(),
        category: workbookForm.category.trim(),
        summary: workbookForm.summary.trim(),
        description: workbookForm.description?.trim(),
      };
      const saved = selectedWorkbook
        ? await adminCodingWorkbookService.updateWorkbook(selectedWorkbook.id, payload)
        : await adminCodingWorkbookService.createWorkbook(payload);

      setSelectedWorkbook(saved);
      setWorkbookForm(buildWorkbookForm(saved));
      setProblemForm(createProblemForm(getNextProblemOrder(saved.problems)));
      setWorkbookFormMode('hidden');
      setProblemFormMode('hidden');
      setMessage('코테집을 저장했습니다.');
      await loadWorkbooks();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '코테집 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkbook = async () => {
    if (!selectedWorkbook || !confirm('선택한 코테집과 그 안의 문제를 삭제할까요?')) {
      return;
    }

    try {
      await adminCodingWorkbookService.deleteWorkbook(selectedWorkbook.id);
      setSelectedWorkbook(null);
      setWorkbookForm(emptyWorkbookForm);
      setWorkbookFormMode('hidden');
      setSelectedProblemId(null);
      setProblemForm(createProblemForm());
      setProblemFormMode('hidden');
      setMessage('코테집을 삭제했습니다.');
      await loadWorkbooks();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '코테집 삭제에 실패했습니다.');
    }
  };

  const handleNewProblem = () => {
    setSelectedProblemId(null);
    setProblemForm(createProblemForm(getNextProblemOrder(problems)));
    setProblemFormMode('create');
    setMessage('');
    setError('');
  };

  const handleEditProblem = async (problem: AdminCodingProblemSummary) => {
    if (!selectedWorkbook) {
      return;
    }

    try {
      setError('');
      const detail = await adminCodingWorkbookService.getProblem(selectedWorkbook.id, problem.id);

      setSelectedProblemId(detail.id);
      setProblemForm(buildProblemForm(detail));
      setProblemFormMode('edit');
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : '문제를 불러오지 못했습니다.');
    }
  };

  const handleSaveProblem = async () => {
    if (!selectedWorkbook) {
      setError('문제를 추가할 코테집을 먼저 저장하거나 선택하세요.');
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      validateProblem(problemForm);
      const payload = buildProblemPayload(problemForm);
      const saved = selectedProblemId
        ? await adminCodingWorkbookService.updateProblem(selectedWorkbook.id, selectedProblemId, payload)
        : await adminCodingWorkbookService.createProblem(selectedWorkbook.id, payload);

      setSelectedProblemId(saved.id);
      setProblemForm(buildProblemForm(saved));
      await loadWorkbookDetail(selectedWorkbook.id);
      setProblemFormMode('hidden');
      setMessage('문제를 저장했습니다.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '문제 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProblem = async () => {
    if (!selectedWorkbook || !selectedProblemId || !confirm('선택한 문제를 삭제할까요?')) {
      return;
    }

    try {
      await adminCodingWorkbookService.deleteProblem(selectedWorkbook.id, selectedProblemId);
      await loadWorkbookDetail(selectedWorkbook.id);
      setProblemFormMode('hidden');
      setMessage('문제를 삭제했습니다.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '문제 삭제에 실패했습니다.');
    }
  };

  const updateTestCase = <TKey extends keyof AdminCodingProblemTestCase>(
    index: number,
    key: TKey,
    value: AdminCodingProblemTestCase[TKey],
  ) => {
    setProblemForm((current) => ({
      ...current,
      testCases: current.testCases.map((testCase, testCaseIndex) =>
        testCaseIndex === index ? { ...testCase, [key]: value } : testCase,
      ),
    }));
  };

  const updateStarterCode = (language: CodingLanguage, code: string) => {
    setProblemForm((current) => ({
      ...current,
      starterCodes: current.starterCodes.map((starterCode) =>
        starterCode.language === language ? { ...starterCode, code } : starterCode,
      ),
    }));
  };

  return (
    <div>
      <AdminPageTitle
        title="코테집 관리"
        description="코테집을 만들고, 선택한 문제집 안에 실제 풀이 가능한 문제와 채점 데이터를 등록합니다."
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
        <div className="space-y-4">
          <AdminCard>
            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="제목, 카테고리, 요약 검색"
                  className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="category"
                  className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                />
                <select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value as CodingDifficulty | '')}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="">난이도 전체</option>
                  {difficulties.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as CodingWorkbookStatus | '')}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="">상태 전체</option>
                  {statuses.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setPage(0);
                    void loadWorkbooks();
                  }}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white"
                >
                  <Search size={16} />
                  검색
                </button>
              </div>
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
              <p className="text-sm font-semibold">총 {formatNumber(workbooks?.totalElements ?? 0)}개</p>
              <button
                type="button"
                onClick={handleNewWorkbook}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
              >
                <Plus size={14} />
                새 코테집
              </button>
            </div>

            {isLoading ? (
              <div className="rounded-md bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">불러오는 중입니다.</div>
            ) : !workbooks?.content.length ? (
              <AdminEmpty message="등록된 코테집이 없습니다." />
            ) : (
              <div className="space-y-2">
                {workbooks.content.map((workbook) => (
                  <div
                    key={workbook.id}
                    onClick={() => void loadWorkbookDetail(workbook.id)}
                    className={`w-full cursor-pointer rounded-md border px-3 py-3 text-left ${
                      selectedWorkbook?.id === workbook.id
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-950">{workbook.title}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{workbook.summary}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                          {workbook.status}
                        </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleEditWorkbook(workbook.id);
                          }}
                          className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-white"
                        >
                          수정
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                      <span>{workbook.category}</span>
                      <span>{workbook.difficulty}</span>
                      <span>order {workbook.displayOrder}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <AdminPagination page={page} totalPages={workbooks?.totalPages ?? 1} onPageChange={setPage} />
          </AdminCard>
        </div>

        <div className="space-y-5">
          {workbookFormMode !== 'hidden' && (
          <AdminCard>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {workbookFormMode === 'edit' ? '코테집 수정' : '코테집 생성'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">공개 목록 검색에 쓰이는 카테고리와 난이도까지 함께 저장합니다.</p>
              </div>
              {workbookFormMode === 'edit' && selectedWorkbook && (
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                  ID {selectedWorkbook.id}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={workbookForm.title}
                onChange={(event) =>
                  setWorkbookForm((current) => ({
                    ...current,
                    title: event.target.value,
                    slug: current.slug || buildSlug(event.target.value),
                  }))
                }
                placeholder="문제집 제목"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <input
                value={workbookForm.slug}
                onChange={(event) => setWorkbookForm((current) => ({ ...current, slug: buildSlug(event.target.value) }))}
                placeholder="slug"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <input
                value={workbookForm.category}
                onChange={(event) => setWorkbookForm((current) => ({ ...current, category: event.target.value }))}
                placeholder="algorithm, array, string"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <select
                value={workbookForm.difficulty}
                onChange={(event) =>
                  setWorkbookForm((current) => ({ ...current, difficulty: event.target.value as CodingDifficulty }))
                }
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                {difficulties.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <select
                value={workbookForm.status}
                onChange={(event) =>
                  setWorkbookForm((current) => ({ ...current, status: event.target.value as CodingWorkbookStatus }))
                }
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <input
                type="number"
                value={workbookForm.displayOrder}
                onChange={(event) =>
                  setWorkbookForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))
                }
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <textarea
                value={workbookForm.summary}
                onChange={(event) => setWorkbookForm((current) => ({ ...current, summary: event.target.value }))}
                placeholder="목록에 보이는 짧은 요약"
                rows={3}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
              />
              <textarea
                value={workbookForm.description}
                onChange={(event) => setWorkbookForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="상세 설명"
                rows={4}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleSaveWorkbook()}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Save size={16} />
                코테집 저장
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkbookFormMode('hidden');
                  if (!selectedWorkbook) {
                    setWorkbookForm(emptyWorkbookForm);
                  }
                }}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                취소
              </button>
              {workbookFormMode === 'edit' && selectedWorkbook && (
                <button
                  type="button"
                  onClick={() => void handleDeleteWorkbook()}
                  className="inline-flex items-center gap-2 rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
                >
                  <Trash2 size={16} />
                  삭제
                </button>
              )}
            </div>
          </AdminCard>
          )}

          <AdminCard>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">문제 목록</h3>
                <p className="mt-1 text-sm text-slate-500">코테집을 저장한 뒤 문제를 여러 개 추가할 수 있습니다.</p>
              </div>
              <button
                type="button"
                onClick={handleNewProblem}
                disabled={!selectedWorkbook}
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={14} />
                새 문제
              </button>
            </div>

            {!selectedWorkbook ? (
              <AdminEmpty message="먼저 코테집을 저장하거나 왼쪽 목록에서 선택하세요." />
            ) : problems.length === 0 ? (
              <AdminEmpty message="아직 등록된 문제가 없습니다." />
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className={`rounded-md border px-3 py-3 text-left ${
                      selectedProblemId === problem.id
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <BookOpen size={15} className="shrink-0 text-slate-400" />
                        <p className="truncate text-sm font-bold text-slate-950">{problem.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleEditProblem(problem)}
                        className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-white"
                      >
                        수정
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                      <span>#{problem.orderIndex}</span>
                      <span>{problem.category}</span>
                      <span>{problem.difficulty}</span>
                      <span>{problem.status}</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">{formatDateTime(problem.updatedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>

          {problemFormMode !== 'hidden' && (
          <AdminCard>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {problemFormMode === 'edit' ? '문제 수정' : '문제 추가'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">문제 설명, 테스트케이스, 언어별 스타터코드를 함께 저장합니다.</p>
              </div>
              {problemFormMode === 'edit' && selectedProblemId && (
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                  ID {selectedProblemId}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={problemForm.title}
                onChange={(event) => setProblemForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="문제 제목"
                disabled={!selectedWorkbook}
                className="h-10 rounded-md border border-slate-300 px-3 text-sm disabled:bg-slate-50"
              />
              <input
                value={problemForm.category}
                onChange={(event) => setProblemForm((current) => ({ ...current, category: event.target.value }))}
                placeholder="algorithm, array, string"
                disabled={!selectedWorkbook}
                className="h-10 rounded-md border border-slate-300 px-3 text-sm disabled:bg-slate-50"
              />
              <select
                value={problemForm.difficulty}
                onChange={(event) =>
                  setProblemForm((current) => ({ ...current, difficulty: event.target.value as CodingDifficulty }))
                }
                disabled={!selectedWorkbook}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm disabled:bg-slate-50"
              >
                {difficulties.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <select
                value={problemForm.status}
                onChange={(event) =>
                  setProblemForm((current) => ({ ...current, status: event.target.value as CodingProblemStatus }))
                }
                disabled={!selectedWorkbook}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm disabled:bg-slate-50"
              >
                {problemStatuses.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <input
                type="number"
                value={problemForm.orderIndex}
                onChange={(event) => setProblemForm((current) => ({ ...current, orderIndex: Number(event.target.value) }))}
                disabled={!selectedWorkbook}
                className="h-10 rounded-md border border-slate-300 px-3 text-sm disabled:bg-slate-50"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={problemForm.timeLimitMillis}
                  onChange={(event) =>
                    setProblemForm((current) => ({ ...current, timeLimitMillis: Number(event.target.value) }))
                  }
                  disabled={!selectedWorkbook}
                  className="h-10 rounded-md border border-slate-300 px-3 text-sm disabled:bg-slate-50"
                />
                <input
                  type="number"
                  value={problemForm.memoryLimitMb}
                  onChange={(event) =>
                    setProblemForm((current) => ({ ...current, memoryLimitMb: Number(event.target.value) }))
                  }
                  disabled={!selectedWorkbook}
                  className="h-10 rounded-md border border-slate-300 px-3 text-sm disabled:bg-slate-50"
                />
              </div>
              <textarea
                value={problemForm.contentText}
                onChange={(event) => setProblemForm((current) => ({ ...current, contentText: event.target.value }))}
                placeholder="문제 설명"
                rows={8}
                disabled={!selectedWorkbook}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 md:col-span-2"
              />
              <textarea
                value={problemForm.explanationText}
                onChange={(event) => setProblemForm((current) => ({ ...current, explanationText: event.target.value }))}
                placeholder="해설"
                rows={5}
                disabled={!selectedWorkbook}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 md:col-span-2"
              />
            </div>

            <section className="mt-5 rounded-md border border-slate-200 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-950">테스트케이스</h4>
                <button
                  type="button"
                  onClick={() =>
                    setProblemForm((current) => ({
                      ...current,
                      testCases: [
                        ...current.testCases,
                        {
                          input: '',
                          expectedOutput: '',
                          sample: false,
                          orderIndex: current.testCases.length + 1,
                        },
                      ],
                    }))
                  }
                  disabled={!selectedWorkbook}
                  className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                >
                  추가
                </button>
              </div>
              <div className="space-y-3">
                {problemForm.testCases.map((testCase, index) => (
                  <div key={index} className="rounded-md border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <input
                          type="checkbox"
                          checked={testCase.sample}
                          onChange={(event) => updateTestCase(index, 'sample', event.target.checked)}
                          disabled={!selectedWorkbook}
                        />
                        예제로 노출
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProblemForm((current) => ({
                            ...current,
                            testCases: current.testCases.filter((_, testCaseIndex) => testCaseIndex !== index),
                          }))
                        }
                        disabled={!selectedWorkbook || problemForm.testCases.length <= 1}
                        className="rounded-md border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 disabled:opacity-40"
                      >
                        삭제
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)]">
                      <input
                        type="number"
                        value={testCase.orderIndex}
                        onChange={(event) => updateTestCase(index, 'orderIndex', Number(event.target.value))}
                        disabled={!selectedWorkbook}
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm disabled:bg-slate-50"
                      />
                      <textarea
                        value={testCase.input}
                        onChange={(event) => updateTestCase(index, 'input', event.target.value)}
                        placeholder="입력"
                        rows={4}
                        disabled={!selectedWorkbook}
                        className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm disabled:bg-slate-50"
                      />
                      <textarea
                        value={testCase.expectedOutput}
                        onChange={(event) => updateTestCase(index, 'expectedOutput', event.target.value)}
                        placeholder="기대 출력"
                        rows={4}
                        disabled={!selectedWorkbook}
                        className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm disabled:bg-slate-50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-5 rounded-md border border-slate-200 p-3">
              <h4 className="mb-3 text-sm font-bold text-slate-950">스타터 코드</h4>
              <div className="space-y-3">
                {problemForm.starterCodes.map((starterCode) => (
                  <div key={starterCode.language}>
                    <div className="mb-1 text-xs font-bold text-slate-500">{starterCode.language}</div>
                    <textarea
                      value={starterCode.code}
                      onChange={(event) => updateStarterCode(starterCode.language, event.target.value)}
                      rows={starterCode.language === 'JAVA' ? 10 : 6}
                      disabled={!selectedWorkbook}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm disabled:bg-slate-50"
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleSaveProblem()}
                disabled={!selectedWorkbook || isSaving}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save size={16} />
                문제 저장
              </button>
              <button
                type="button"
                onClick={() => {
                  setProblemFormMode('hidden');
                  setSelectedProblemId(null);
                }}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                취소
              </button>
              {problemFormMode === 'edit' && selectedProblemId && (
                <button
                  type="button"
                  onClick={() => void handleDeleteProblem()}
                  className="inline-flex items-center gap-2 rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
                >
                  <Trash2 size={16} />
                  문제 삭제
                </button>
              )}
            </div>
          </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}
