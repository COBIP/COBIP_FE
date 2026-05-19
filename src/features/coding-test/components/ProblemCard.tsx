import type { CodingWorkbookSummaryResponse } from '@/types/CodingWorkbookTypes';
import Link from 'next/link';

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
    const { title, summary, category, difficulty, createdAt } = workbook;

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col transition-all duration-300 relative group min-h-[200px] hover:border-violet-600 hover:ring-1 hover:ring-violet-600 shadow-sm">
            <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold">
                    {category}
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold">
                    {difficultyLabel[difficulty]}
                </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-2">{summary}</p>

            <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                    {new Date(createdAt).toLocaleDateString('ko-KR')}
                </span>

                {primaryProblemId ? (
                    <Link href={`/coding-test/problem/${primaryProblemId}`}>
                        <button className="px-4 py-2 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold hover:bg-violet-600 hover:text-white transition-colors w-full">
                            문제 풀기
                        </button>
                    </Link>
                ) : (
                    <button
                        disabled
                        className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold cursor-not-allowed w-full"
                    >
                        문제 없음
                    </button>
                )}
            </div>
        </div>
    );
}
