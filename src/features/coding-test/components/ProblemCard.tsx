import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { CodingWorkbookSummaryResponse } from '@/types/CodingWorkbookTypes';

interface ProblemCardProps {
    workbook: CodingWorkbookSummaryResponse;
    primaryProblemId?: number;
}

const difficultyLabel: Record<CodingWorkbookSummaryResponse['difficulty'], string> = {
    EASY: '초급',
    MEDIUM: '중급',
    HARD: '고급',
};

export default function ProblemCard({ workbook, primaryProblemId }: ProblemCardProps) {
    const cardContent = (
        <article
            className={`flex min-h-[180px] flex-col rounded-md border bg-white p-5 shadow-sm transition-all ${
                primaryProblemId
                    ? 'border-gray-200 hover:border-violet-500 hover:shadow-md'
                    : 'cursor-not-allowed border-gray-100 opacity-60'
            }`}
        >
            <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    {workbook.category}
                </span>
                <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    {difficultyLabel[workbook.difficulty]}
                </span>
            </div>

            <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-950">{workbook.title}</h3>
            <p className="line-clamp-3 flex-grow text-sm leading-6 text-gray-600">{workbook.summary}</p>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs text-gray-400">
                    {new Date(workbook.createdAt).toLocaleDateString('ko-KR')} 업데이트
                </span>
                {primaryProblemId ? (
                    <ChevronRight size={18} className="text-gray-400 transition-colors group-hover:text-violet-600" />
                ) : (
                    <span className="text-xs font-bold text-gray-400">문제 없음</span>
                )}
            </div>
        </article>
    );

    if (!primaryProblemId) {
        return cardContent;
    }

    return (
        <Link href={`/coding-test/problem/${primaryProblemId}`} className="group block focus:outline-none focus:ring-2 focus:ring-violet-200">
            {cardContent}
        </Link>
    );
}
