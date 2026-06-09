'use client';

import { useEffect, useMemo, useState } from 'react';
import ProblemGrid from '@/features/coding-test/components/ProblemGrid';
import CodingTestFilter, { type CodingTestFilterState } from '@/features/coding-test/components/CodingTestFilter';
import { getWorkbookDetail } from '@/api/services/CodingWorkbookService';
import { useCodingWorkbooks } from '@/hooks/useCodingWorkbooks';
import { Header } from '@/features/main-home/components/Header';
import type {
    CodingWorkbookDetailResponse,
    CodingProblemListItem,
    CodingWorkbookSummaryResponse,
} from '@/types/CodingWorkbookTypes';

const DEFAULT_FILTERS: CodingTestFilterState = {};
const DEFAULT_PARAMS = { page: 0, size: 16, sort: 'createdAt,desc' };
const EMPTY_WORKBOOKS: CodingWorkbookSummaryResponse[] = [];
const PROBLEMS_PER_PAGE = 16;

export default function CodingTestPage() {
    const [filters, setFilters] = useState<CodingTestFilterState>(DEFAULT_FILTERS);
    const [workbookDetails, setWorkbookDetails] = useState<Record<number, CodingWorkbookDetailResponse>>({});
    const [isProblemFilterLoading, setIsProblemFilterLoading] = useState(false);
    const [problemPage, setProblemPage] = useState(1);
    const { data, isLoading, error, updateParams } = useCodingWorkbooks(DEFAULT_PARAMS);

    const workbooks = data?.content ?? EMPTY_WORKBOOKS;
    const hasProblemFilter = Boolean(filters.problemCategory || filters.problemDifficulty);

    const workbookCategoryOptions = useMemo(() => {
        const categories = workbooks.map((workbook) => workbook.category);
        return Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b, 'ko-KR'));
    }, [workbooks]);

    useEffect(() => {
        if (workbooks.length === 0) {
            setWorkbookDetails({});
            return;
        }

        let isMounted = true;

        const fetchDetails = async () => {
            setIsProblemFilterLoading(true);
            try {
                const entries = await Promise.all(
                    workbooks.map(async (workbook) => {
                        const detail = await getWorkbookDetail(workbook.id);
                        return [workbook.id, detail] as const;
                    })
                );

                if (!isMounted) return;
                setWorkbookDetails(Object.fromEntries(entries));
            } catch (err) {
                console.error('Failed to fetch coding workbook details for problem filters:', err);
                if (!isMounted) return;
                setWorkbookDetails({});
            } finally {
                if (isMounted) setIsProblemFilterLoading(false);
            }
        };

        fetchDetails();

        return () => {
            isMounted = false;
        };
    }, [data?.content, workbooks]);

    const problemCategoryOptions = useMemo(() => {
        const categories = Object.values(workbookDetails)
            .flatMap((detail) => detail.problems.map((problem) => problem.category));
        return Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b, 'ko-KR'));
    }, [workbookDetails]);

    const filteredWorkbooks = useMemo(() => {
        const titleKeyword = filters.titleKeyword?.trim().toLowerCase();
        const titleFilteredWorkbooks = workbooks.filter((workbook) => {
            const title = workbook.title.toLowerCase();
            const hasTitleKeyword = !titleKeyword || title.includes(titleKeyword);

            return hasTitleKeyword;
        });

        if (!hasProblemFilter) return titleFilteredWorkbooks;

        return titleFilteredWorkbooks.filter((workbook) => {
            const detail = workbookDetails[workbook.id];
            if (!detail) return false;

            return detail.problems.some((problem) => {
                const hasCategory = !filters.problemCategory || problem.category === filters.problemCategory;
                const hasDifficulty = !filters.problemDifficulty || problem.difficulty === filters.problemDifficulty;
                return hasCategory && hasDifficulty;
            });
        });
    }, [filters.problemCategory, filters.problemDifficulty, filters.titleKeyword, hasProblemFilter, workbookDetails, workbooks]);

    const filteredProblems = useMemo<CodingProblemListItem[]>(() => (
        filteredWorkbooks.flatMap((workbook) => {
            const detail = workbookDetails[workbook.id];
            if (!detail) return [];

            return [...detail.problems]
                .sort((left, right) => left.orderIndex - right.orderIndex || left.id - right.id)
                .filter((problem) => {
                    const hasCategory = !filters.problemCategory || problem.category === filters.problemCategory;
                    const hasDifficulty = !filters.problemDifficulty || problem.difficulty === filters.problemDifficulty;
                    return hasCategory && hasDifficulty;
                })
                .map((problem) => ({ workbook, problem }));
        })
    ), [filteredWorkbooks, filters.problemCategory, filters.problemDifficulty, workbookDetails]);

    const problemTotalPages = Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE);
    const currentProblemPage = problemTotalPages > 0 ? Math.min(problemPage, problemTotalPages) : 1;
    const paginatedProblems = filteredProblems.slice(
        (currentProblemPage - 1) * PROBLEMS_PER_PAGE,
        currentProblemPage * PROBLEMS_PER_PAGE
    );

    useEffect(() => {
        setProblemPage(1);
    }, [filters, workbookDetails]);

    const applyFilters = (nextFilters: CodingTestFilterState) => {
        setFilters(nextFilters);
        setProblemPage(1);
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
        setProblemPage(1);
        updateParams({
            keyword: undefined,
            category: undefined,
            difficulty: undefined,
            page: 0,
            sort: 'createdAt,desc',
        });
    };

    return (
        <>
            <Header />
            <div className="bg-white min-h-screen pb-20">
                <main className="flex-grow max-w-[1440px] mx-auto w-full px-8 py-10">
                    <CodingTestFilter
                        key={JSON.stringify(filters)} 
                        value={filters}
                        workbookCategoryOptions={workbookCategoryOptions}
                        problemCategoryOptions={problemCategoryOptions}
                        onApply={applyFilters}
                        onReset={resetFilters}
                    />

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                            {error}
                        </div>
                    )}

                    {isLoading && !data ? (
                        <div className="text-center py-20 text-gray-500 font-bold">데이터를 불러오는 중입니다...</div>
                    ) : isProblemFilterLoading ? (
                        <div className="text-center py-20 text-gray-500 font-bold">문제 목록을 불러오는 중입니다...</div>
                    ) : paginatedProblems.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 font-bold">
                            선택하신 조건에 맞는 문제가 없습니다.
                        </div>
                    ) : (
                        <ProblemGrid problems={paginatedProblems} />
                    )}

                    {problemTotalPages > 1 && paginatedProblems.length > 0 && (
                        <div className="flex justify-center items-center gap-2 mt-12">
                            {currentProblemPage > 1 && (
                                <button
                                    type="button"
                                    aria-label="이전 페이지"
                                    onClick={() => setProblemPage(currentProblemPage - 1)}
                                    className="w-10 h-10 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    &lt;
                                </button>
                            )}

                            {Array.from({ length: problemTotalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={currentProblemPage === index + 1}
                                    onClick={() => setProblemPage(index + 1)}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                                        currentProblemPage === index + 1
                                            ? 'bg-violet-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            {currentProblemPage < problemTotalPages && (
                                <button
                                    type="button"
                                    aria-label="다음 페이지"
                                    onClick={() => setProblemPage(currentProblemPage + 1)}
                                    className="w-10 h-10 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    &gt;
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
