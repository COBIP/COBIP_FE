'use client';

import { useEffect, useMemo, useState } from 'react';
import ProblemGrid from '@/features/coding-test/components/ProblemGrid';
import CodingTestFilter, { type CodingTestFilterState } from '@/features/coding-test/components/CodingTestFilter';
import { getWorkbookDetail } from '@/api/services/CodingWorkbookService';
import { useCodingWorkbooks } from '@/hooks/useCodingWorkbooks';
import { Header } from '@/features/main-home/components/Header';
import type { CodingWorkbookDetailResponse, CodingWorkbookSummaryResponse } from '@/types/CodingWorkbookTypes';

const DEFAULT_FILTERS: CodingTestFilterState = {};
const DEFAULT_PARAMS = { page: 0, size: 16, sort: 'createdAt,desc' };
const EMPTY_WORKBOOKS: CodingWorkbookSummaryResponse[] = [];

export default function CodingTestPage() {
    const [filters, setFilters] = useState<CodingTestFilterState>(DEFAULT_FILTERS);
    const [workbookDetails, setWorkbookDetails] = useState<Record<number, CodingWorkbookDetailResponse>>({});
    const [isProblemFilterLoading, setIsProblemFilterLoading] = useState(false);
    const { data, isLoading, error, updateParams } = useCodingWorkbooks(DEFAULT_PARAMS);

    const workbooks = data?.content ?? EMPTY_WORKBOOKS;
    const totalPages = data?.totalPages ?? 1;
    const currentPage = (data?.page ?? 0) + 1;
    const hasProblemFilter = Boolean(filters.problemCategory || filters.problemDifficulty);
    const hasTitleSearch = Boolean(filters.titleKeyword);

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

    const getPrimaryProblemId = (workbookId: number) => {
        const problems = workbookDetails[workbookId]?.problems ?? [];
        return [...problems].sort((a, b) => a.orderIndex - b.orderIndex)[0]?.id;
    };

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

    const applyFilters = (nextFilters: CodingTestFilterState) => {
        setFilters(nextFilters);
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
                    ) : hasProblemFilter && isProblemFilterLoading ? (
                        <div className="text-center py-20 text-gray-500 font-bold">문제 필터를 적용하는 중입니다...</div>
                    ) : filteredWorkbooks.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 font-bold">
                            선택하신 조건에 맞는 문제집이 없습니다.
                        </div>
                    ) : (
                        <ProblemGrid workbooks={filteredWorkbooks} getPrimaryProblemId={getPrimaryProblemId} />
                    )}

                    {totalPages > 1 && !hasProblemFilter && !hasTitleSearch && (
                        <div className="flex justify-center items-center gap-2 mt-12">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => updateParams({ page: currentPage - 2, sort: 'createdAt,desc' })}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
                            >
                                이전
                            </button>

                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index}
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

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => updateParams({ page: currentPage, sort: 'createdAt,desc' })}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
                            >
                                다음
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
