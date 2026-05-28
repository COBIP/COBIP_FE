'use client';

import { Loader2 } from 'lucide-react';
import { StudyEmptyState } from '@/features/my-page/components/study/StudyEmptyState';
import { StudyFilterTabs } from '@/features/my-page/components/study/StudyFilterTabs';
import { StudyList } from '@/features/my-page/components/study/StudyList';
import { StudyPagination } from '@/features/my-page/components/study/StudyPagination';
import { StudySummaryCards } from '@/features/my-page/components/study/StudySummaryCards';
import { useMyLearning } from '@/features/my-page/hooks/UseMyLearning';

export function StudyPage() {
  const {
    error,
    filter,
    filteredItems,
    isLoading,
    page,
    response,
    setFilter,
    setPage,
    summary,
  } = useMyLearning();

  if (isLoading && !response) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-purple-600" />
        <p className="text-sm font-medium text-gray-500">내 학습 목록을 불러오고 있습니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">내 학습</h1>
          <p className="mt-2 text-sm text-gray-500">진행 중인 템플릿과 완료한 학습을 한곳에서 확인합니다.</p>
        </div>
        <StudyFilterTabs activeFilter={filter} onFilterChange={setFilter} />
      </div>

      <StudySummaryCards
        averageProgress={summary.averageProgress}
        completedCount={summary.completedCount}
        inProgressCount={summary.inProgressCount}
        totalCount={summary.totalCount}
        totalStudySeconds={summary.totalStudySeconds}
      />

      {filteredItems.length > 0 ? (
        <StudyList items={filteredItems} />
      ) : (
        <StudyEmptyState hasFilter={filter !== 'all'} />
      )}

      {isLoading && response && (
        <div className="flex justify-center py-2 text-sm font-medium text-gray-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          새 페이지를 불러오는 중입니다.
        </div>
      )}

      <StudyPagination
        page={page}
        totalPages={response?.totalPages ?? 0}
        isLast={response?.last ?? true}
        onPageChange={setPage}
      />
    </div>
  );
}
