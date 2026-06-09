import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import type { CodingWorkbookProblemSummaryResponse, CodingWorkbookSummaryResponse } from '@/types/CodingWorkbookTypes';

interface ProblemCardProps {
    workbook: CodingWorkbookSummaryResponse;
    problem: CodingWorkbookProblemSummaryResponse;
}

const difficultyLabel: Record<CodingWorkbookSummaryResponse['difficulty'], string> = {
    EASY: '초급',
    MEDIUM: '중급',
    HARD: '고급',
};

export default function ProblemCard({ workbook, problem }: ProblemCardProps) {
    return (
        <Link
            href={`/coding-test/problem/${problem.id}`}
            className="group block focus:outline-none focus:ring-2 focus:ring-violet-200"
        >
            <article className="flex min-h-[210px] flex-col rounded-md border border-gray-200 bg-white p-5 shadow-sm transition-all group-hover:border-violet-500 group-hover:shadow-md">
                <div className="mb-3 flex flex-wrap gap-1.5">
                    <span className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {problem.category}
                    </span>
                    <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {difficultyLabel[problem.difficulty]}
                    </span>
                    {problem.solved && (
                        <span className="inline-flex items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 size={12} />
                            해결됨
                        </span>
                    )}
                </div>

                <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-950">
                    {problem.orderIndex}. {problem.title}
                </h3>
                <p className="line-clamp-3 flex-grow text-sm leading-6 text-gray-600">{workbook.summary}</p>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="min-w-0 truncate text-xs font-bold text-gray-400">{workbook.title}</span>
                    <ChevronRight size={18} className="shrink-0 text-gray-400 transition-colors group-hover:text-violet-600" />
                </div>
            </article>
        </Link>
    );
}
