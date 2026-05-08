import { Problem } from '@/types/CodingTestTypes';
import Link from 'next/link'; // 링크 이동을 위해 추가

interface ProblemCardProps {
    problem: Problem;
}

export const ProblemCard = ({ problem }: ProblemCardProps) => {
    // 4가지 속성 모두 가져오기
    const { id, title, description, language, status, solveCount, testType, difficulty, type } = problem;

    const isCompleted = status === 'completed';
    const isInProgress = status === 'in-progress';

    // 1. 상태에 따른 배경색 로직 분리 (완료: 초록 / 풀이중: 주황 / 미시작: 하양)
    const cardStyle = isCompleted 
        ? 'bg-emerald-50/50 border-emerald-200' 
        : isInProgress 
            ? 'bg-amber-50/50 border-amber-200' 
            : 'bg-white border-gray-200';

    return (
        <div className={`rounded-xl p-5 border flex flex-col transition-all duration-300 relative group min-h-[200px] hover:border-violet-600 hover:ring-1 hover:ring-violet-600 ${cardStyle}`}>
            <div className="flex justify-between items-start mb-3">
                {/* 상태 뱃지 */}
                {isCompleted && (
                    <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Solved
                    </div>
                )}
                {isInProgress && (
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        풀이 중
                    </div>
                )}
                
                {/* 북마크 아이콘 (항상 우측 상단 고정) */}
                <div className="ml-auto">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </div>
            </div>

            {/* 카테고리별 파스텔 톤 태그 (Option 1 적용) */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {/* 테스트 구분: 블루 */}
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold">
                    {testType}
                </span>
                {/* 난이도: 에메랄드 */}
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold">
                    {difficulty}
                </span>
                {/* 언어: 보라 */}
                <span className="px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-100 rounded text-[10px] font-bold">
                    {language}
                </span>
                {/* 유형: 오렌지/앰버 */}
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold">
                    {type}
                </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow">{description}</p>

            <div className="flex justify-between items-center mt-auto pt-2">
                <div className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {solveCount.toLocaleString()}명 해결
                </div>
                
                <Link href={`/coding-test/${id}`}>
                    {isCompleted ? (
                        <button className="px-4 py-2 border-2 border-emerald-500 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors w-full">다시 풀기</button>
                    ) : (
                        <button className="px-4 py-2 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold hover:bg-violet-600 hover:text-white transition-colors w-full">
                            {isInProgress ? '이어서 풀기' : '문제 풀이'}
                        </button>
                    )}
                </Link>
            </div>
        </div>
    );
};