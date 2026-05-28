import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StudyPaginationProps {
  page: number;
  totalPages: number;
  isLast: boolean;
  onPageChange: (page: number) => void;
}

export function StudyPagination({ page, totalPages, isLast, onPageChange }: StudyPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button
        type="button"
        disabled={page <= 0}
        onClick={() => onPageChange(Math.max(0, page - 1))}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        이전
      </button>

      <span className="text-sm font-semibold text-gray-500">
        {page + 1} / {totalPages}
      </span>

      <button
        type="button"
        disabled={isLast}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        다음
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
