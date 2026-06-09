import { ChevronRight } from 'lucide-react';
import type { CodingWorkbookSummaryResponse } from '@/types/CodingWorkbookTypes';

interface ProblemCardProps {
    workbook: CodingWorkbookSummaryResponse;
    onSelect: () => void;
}

const difficultyLabel: Record<CodingWorkbookSummaryResponse['difficulty'], string> = {
    EASY: '초급',
    MEDIUM: '중급',
    HARD: '고급',
};

export default function ProblemCard({ workbook, onSelect }: ProblemCardProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className="group block h-full w-full text-left focus:outline-none focus:ring-2 focus:ring-violet-200"
        >
            <article className="flex min-h-[210px] flex-col rounded-md border border-gray-200 bg-white p-5 shadow-sm transition-all group-hover:border-violet-500 group-hover:shadow-md">
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
                    <ChevronRight size={18} className="shrink-0 text-gray-400 transition-colors group-hover:text-violet-600" />
                </div>
            </article>
        </button>
    );
}
