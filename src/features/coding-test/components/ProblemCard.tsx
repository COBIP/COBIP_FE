// src/features/coding-test/components/ProblemCard.tsx
import type { CodingWorkbookSummary } from '@/features/coding-test/types/CodingWorkbookTypes';
import Link from 'next/link';

interface ProblemCardProps {
    workbook: CodingWorkbookSummary;
}

export default function ProblemCard({ workbook }: ProblemCardProps) {
    const { id, title, summary, category, difficulty, createdAt } = workbook;

    // 백엔드의 EASY, MEDIUM, HARD를 한글로 변환
    const getDifficultyLabel = (diff: string) => {
        switch (diff) {
            case 'EASY': return '초급';
            case 'MEDIUM': return '중급';
            case 'HARD': return '고급';
            default: return diff;
        }
    };

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col transition-all duration-300 relative group min-h-[200px] hover:border-violet-600 hover:ring-1 hover:ring-violet-600 shadow-sm">
            
            <div className="flex flex-wrap gap-1.5 mb-3">
                {category && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold">
                        {category}
                    </span>
                )}
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold">
                    {getDifficultyLabel(difficulty)}
                </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-2">{summary}</p>

            <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                    {new Date(createdAt).toLocaleDateString()}
                </span>
                
                <Link href={`/coding-test/${id}`}>
                    <button className="px-4 py-2 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold hover:bg-violet-600 hover:text-white transition-colors w-full">
                        문제집 보기
                    </button>
                </Link>
            </div>
        </div>
    );
}