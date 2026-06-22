'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';
import ProblemGrid from '@/features/coding-test/components/ProblemGrid';
import CodingTestFilter, { type CodingTestFilterState } from '@/features/coding-test/components/CodingTestFilter';
import { getWorkbookDetail } from '@/api/services/CodingWorkbookService';
import { useCodingWorkbooks } from '@/hooks/useCodingWorkbooks';
import { Header } from '@/features/main-home/components/Header';
import {
    checkCodingProblemStoredSolved,
    getCodingSolvedProblemIdsSnapshot,
    syncCodingSolvedProblemIds,
} from '@/features/coding-test/utils/CodingSolvedProblemStorage';
import type {
    CodingDifficulty,
    CodingWorkbookDetailResponse,
    CodingWorkbookSummaryResponse,
} from '@/types/CodingWorkbookTypes';

const DEFAULT_FILTERS: CodingTestFilterState = {};
const DEFAULT_PARAMS = { page: 0, size: 16, sort: 'createdAt,desc' };
const EMPTY_WORKBOOKS: CodingWorkbookSummaryResponse[] = [];

const difficultyLabel: Record<CodingDifficulty, string> = {
    EASY: '초급',
    MEDIUM: '중급',
    HARD: '고급',
};

const difficultyBadgeClass: Record<CodingDifficulty, string> = {
    EASY: 'border-amber-100 bg-amber-50 text-amber-700',
    MEDIUM: 'border-violet-100 bg-violet-50 text-violet-700',
    HARD: 'border-rose-100 bg-rose-50 text-rose-700',
};

export default function CodingTestPage() {
    const router = useRouter();
    const [filters, setFilters] = useState<CodingTestFilterState>(DEFAULT_FILTERS);
    const [selectedWorkbook, setSelectedWorkbook] = useState<CodingWorkbookDetailResponse | null>(null);
    const [isWorkbookDetailLoading, setIsWorkbookDetailLoading] = useState(false);
    const [workbookDetailError, setWorkbookDetailError] = useState('');
    const { data, isLoading, error, updateParams } = useCodingWorkbooks(DEFAULT_PARAMS);
    const solvedProblemIdsSnapshot = useSyncExternalStore(
        syncCodingSolvedProblemIds,
        getCodingSolvedProblemIdsSnapshot,
        () => '',
    );

    const workbooks = data?.content ?? EMPTY_WORKBOOKS;
    const totalPages = data?.totalPages ?? 1;
    const currentPage = (data?.page ?? 0) + 1;

    const workbookCategoryOptions = useMemo(() => {
        const categories = workbooks.map((workbook) => workbook.category);
        return Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b, 'ko-KR'));
    }, [workbooks]);

    const sortedProblems = useMemo(
        () => [...(selectedWorkbook?.problems ?? [])]
            .map((problem) => ({
                ...problem,
                solved: Boolean(problem.solved) || checkCodingProblemStoredSolved(problem.id, solvedProblemIdsSnapshot),
            }))
            .sort((left, right) => left.orderIndex - right.orderIndex || left.id - right.id),
        [selectedWorkbook?.problems, solvedProblemIdsSnapshot]
    );

    const handleSelectWorkbook = async (workbookId: number) => {
        setIsWorkbookDetailLoading(true);
        setWorkbookDetailError('');

        try {
            const detail = await getWorkbookDetail(workbookId);
            const firstProblem = [...detail.problems].sort((left, right) => left.orderIndex - right.orderIndex || left.id - right.id)[0];

            if (firstProblem) {
                router.push(`/coding-test/problem/${firstProblem.id}`);
                return;
            }

            setSelectedWorkbook(detail);
        } catch (err) {
            console.error('Failed to fetch coding workbook detail:', err);
            setWorkbookDetailError('문제집 정보를 불러오지 못했습니다.');
            setSelectedWorkbook(null);
        } finally {
            setIsWorkbookDetailLoading(false);
        }
    };

    const applyFilters = (nextFilters: CodingTestFilterState) => {
        setFilters(nextFilters);
        setSelectedWorkbook(null);
        updateParams({
            keyword: nextFilters.titleKeyword || undefined,
            category: nextFilters.workbookCategory,
            difficulty: nextFilters.workbookDifficulty,
            page: 0,
            sort: 'createdAt,desc',
        });
    };

    const resetFilters = () => {
        setFilters(DEFAULT_FILTERS);
        setSelectedWorkbook(null);
        updateParams({
            keyword: undefined,
            category: undefined,
            difficulty: undefined,
            page: 0,
            sort: 'createdAt,desc',
        });
    };

    const goBackToWorkbooks = () => {
        setSelectedWorkbook(null);
        setWorkbookDetailError('');
    };

    return (
        <>
            <Header />
            <div className="bg-white min-h-screen pb-20">
                <main className="flex-grow max-w-[1440px] mx-auto w-full px-8 py-10">
                    {selectedWorkbook ? (
                        <section>
                            <button
                                type="button"
                                onClick={goBackToWorkbooks}
                                className="mb-6 inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                <ArrowLeft size={16} />
                                뒤로가기
                            </button>

                            <div className="mb-8">
                                <div className="mb-3 flex flex-wrap gap-1.5">
                                    <span className="rounded border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                                        {selectedWorkbook.category}
                                    </span>
                                    <span className={`rounded border px-2 py-1 text-xs font-bold ${difficultyBadgeClass[selectedWorkbook.difficulty]}`}>
                                        {difficultyLabel[selectedWorkbook.difficulty]}
                                    </span>
                                </div>
                                <h1 className="mb-3 text-3xl font-bold text-gray-950">{selectedWorkbook.title}</h1>
                                <p className="max-w-3xl text-sm leading-6 text-gray-600">{selectedWorkbook.summary}</p>
                            </div>

                            {sortedProblems.length === 0 ? (
                                <div className="text-center py-20 text-gray-500 font-bold">아직 등록된 문제가 없습니다.</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {sortedProblems.map((problem) => (
                                        <Link
                                            key={problem.id}
                                            href={`/coding-test/problem/${problem.id}`}
                                            className={`group flex items-center gap-4 rounded-md border px-5 py-4 shadow-sm transition-all ${
                                                problem.solved
                                                    ? 'border-emerald-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/60'
                                                    : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/40'
                                            }`}
                                        >
                                            <span className={`w-8 shrink-0 text-sm font-bold ${problem.solved ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {problem.orderIndex}
                                            </span>
                                            <div className="min-w-0 flex-grow">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <p className={`truncate text-base font-bold ${problem.solved ? 'text-emerald-950' : 'text-gray-950'}`}>
                                                        {problem.title}
                                                    </p>
                                                    {problem.solved && (
                                                        <span className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                                            <CheckCircle2 size={12} />
                                                            해결됨
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 flex gap-1.5 text-[11px] font-bold">
                                                    <span className="rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-blue-700">
                                                        {problem.category}
                                                    </span>
                                                    <span className={`rounded border px-1.5 py-0.5 ${difficultyBadgeClass[problem.difficulty]}`}>
                                                        {difficultyLabel[problem.difficulty]}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="shrink-0 text-gray-400 transition-colors group-hover:text-violet-600" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    ) : (
                        <>
                            <CodingTestFilter
                                key={JSON.stringify(filters)}
                                value={filters}
                                workbookCategoryOptions={workbookCategoryOptions}
                                onApply={applyFilters}
                                onReset={resetFilters}
                            />

                            {error && (
                                <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                                    {error}
                                </div>
                            )}
                            {workbookDetailError && (
                                <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                                    {workbookDetailError}
                                </div>
                            )}

                            {isLoading && !data ? (
                                <div className="text-center py-20 text-gray-500 font-bold">데이터를 불러오는 중입니다...</div>
                            ) : isWorkbookDetailLoading ? (
                                <div className="text-center py-20 text-gray-500 font-bold">문제집 정보를 불러오는 중입니다...</div>
                            ) : workbooks.length === 0 ? (
                                <div className="text-center py-20 text-gray-500 font-bold">
                                    선택하신 조건에 맞는 문제집이 없습니다.
                                </div>
                            ) : (
                                <ProblemGrid workbooks={workbooks} onSelectWorkbook={(workbookId) => void handleSelectWorkbook(workbookId)} />
                            )}

                            {totalPages > 1 && workbooks.length > 0 && (
                                <div className="flex justify-center items-center gap-2 mt-12">
                                    {currentPage > 1 && (
                                        <button
                                            type="button"
                                            aria-label="이전 페이지"
                                            onClick={() => updateParams({ page: currentPage - 2, sort: 'createdAt,desc' })}
                                            className="w-10 h-10 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                        >
                                            &lt;
                                        </button>
                                    )}

                                    {Array.from({ length: totalPages }).map((_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            disabled={currentPage === index + 1}
                                            onClick={() => updateParams({ page: index, sort: 'createdAt,desc' })}
                                            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                                                currentPage === index + 1
                                                    ? 'bg-violet-600 text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    {currentPage < totalPages && (
                                        <button
                                            type="button"
                                            aria-label="다음 페이지"
                                            onClick={() => updateParams({ page: currentPage, sort: 'createdAt,desc' })}
                                            className="w-10 h-10 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                        >
                                            &gt;
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </>
    );
}
