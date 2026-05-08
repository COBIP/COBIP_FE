import { Problem } from '@/types/CodingTestTypes';

interface ProblemCardProps {
    problem: Problem;
}

export const ProblemCard = ({ problem }: ProblemCardProps) => {
    const { title, description, language, status, solveCount } = problem; // progress 속성 제거

    const isCompleted = status === 'completed';
    const isInProgress = status === 'in-progress';

    return (
        <div
        // hover:border-violet-600 hover:ring-1 hover:ring-violet-600 클래스 추가로 뚜렷한 보라색 테두리 효과
        className={`rounded-xl p-5 border flex flex-col transition-all duration-300 relative group min-h-[200px] hover:border-violet-600 hover:ring-1 hover:ring-violet-600 ${
            isCompleted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-gray-200'
        }`}
        >
        <div className="flex justify-between items-start mb-4">
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
            
            {/* 언어 및 북마크 */}
            <div className={`flex items-center gap-2 ${!isCompleted && !isInProgress ? 'w-full justify-between' : ''}`}>
            <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-md text-[10px] font-bold uppercase">
                {language}
            </span>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-4 flex-grow">{description}</p>

        {/* 여기에 있던 주황색 진행바 삭제 완료! */}

        {/* 하단 영역 */}
        <div className="flex justify-between items-center mt-auto pt-2">
            <div className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {solveCount.toLocaleString()}명 해결
            </div>
            
            {isCompleted ? (
            <button className="px-4 py-2 border-2 border-emerald-500 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors">
                다시 풀기
            </button>
            ) : (
            <button className="px-4 py-2 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold hover:bg-violet-600 hover:text-white transition-colors">
                {isInProgress ? '이어서 풀기' : '문제 풀이'}
            </button>
            )}
        </div>
        </div>
    );
};