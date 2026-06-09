import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { CodingWorkbookProblemSummaryResponse, CodingWorkbookSummaryResponse } from '@/types/CodingWorkbookTypes';

interface ProblemCardProps {
    workbook: CodingWorkbookSummaryResponse;
    problems: CodingWorkbookProblemSummaryResponse[];
}

const difficultyLabel: Record<CodingWorkbookSummaryResponse['difficulty'], string> = {
    EASY: '초급',
    MEDIUM: '중급',
    HARD: '고급',
};

export default function ProblemCard({ workbook, problems }: ProblemCardProps) {
    return (
        <article
            className="flex min-h-[280px] flex-col rounded-md border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-violet-500 hover:shadow-md"
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

            <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">문제 목록</span>
                    <span className="text-xs font-bold text-violet-600">{problems.length}개</span>
                </div>

                {problems.length === 0 ? (
                    <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-4 text-center text-xs font-bold text-gray-400">
                        문제 없음
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {problems.map((problem) => (
                            <Link
                                key={problem.id}
                                href={`/coding-test/problem/${problem.id}`}
                                className="group/problem flex items-center gap-2 rounded-md border border-gray-100 px-3 py-2 transition-colors hover:border-violet-200 hover:bg-violet-50"
                            >
                                <span className="w-6 shrink-0 text-xs font-bold text-gray-400">{problem.orderIndex}</span>
                                <span className="min-w-0 flex-grow truncate text-sm font-bold text-gray-800 group-hover/problem:text-violet-700">
                                    {problem.title}
                                </span>
                                <ChevronRight size={15} className="shrink-0 text-gray-300 group-hover/problem:text-violet-600" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs text-gray-400">
                    {new Date(workbook.createdAt).toLocaleDateString('ko-KR')} 업데이트
                </span>
            </div>
        </article>
    );
}
