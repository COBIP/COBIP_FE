import { ProblemGrid } from '@/features/coding-test/components/ProblemGrid';
import { useCodingTest } from '@/hooks/useCodingTest';
import Header from '@/features/coding-test/components/Header'

export default function CodingTestPage() {
    const { problems } = useCodingTest();

    return (
        /* 바깥을 감싸는 div에 bg-white min-h-screen을 주어 그라데이션 배경을 덮어버림 */
        <div className="bg-white min-h-screen">
            <Header></Header>
        <main className="flex-grow max-w-[1440px] mx-auto w-full px-8 py-10">
            {/* 상단 헤더 & 검색 바 */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">코딩 테스트 연습</h1>
                <p className="text-lg text-gray-600">다양한 언어와 알고리즘 문제를 통해 실력을 향상시키세요.</p>
            </div>
            <div className="w-full md:w-80 relative group">
                <input 
                className="w-full h-11 pl-11 pr-4 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 transition-all shadow-sm" 
                placeholder="문제 제목 또는 번호 검색" 
                type="text"
                />
                <svg className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            </div>

            {/* 가로형 다중 필터 시스템 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8 flex flex-col gap-4 shadow-sm">
            {/* Row 1: 테스트 구분 */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 pb-4 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800 w-24 flex-shrink-0">테스트 구분</span>
                <div className="flex flex-wrap gap-2">
                <button className="px-4 py-1.5 bg-violet-600 text-white rounded-full text-xs font-bold transition-all shadow-sm">전체</button>
                <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-all">기본 코딩테스트</button>
                <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-all">실무 코드테스트</button>
                <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-all">대기업 코딩 테스트</button>
                </div>
            </div>

            {/* Row 2: 난이도 */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 pb-4 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800 w-24 flex-shrink-0">난이도</span>
                <div className="flex flex-wrap gap-2">
                <button className="px-4 py-1.5 bg-violet-600 text-white rounded-full text-xs font-bold transition-all shadow-sm">전체</button>
                <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-all">입문</button>
                <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-all">초급</button>
                <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-all">중급</button>
                <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-all">고급</button>
                </div>
            </div>

            {/* Row 3: 언어 */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 pb-4 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800 w-24 flex-shrink-0">언어</span>
                <div className="flex flex-wrap gap-2">
                <button className="px-4 py-1.5 bg-violet-600 text-white rounded-full text-xs font-bold transition-all shadow-sm">전체</button>
                {['Spring', 'Java', 'React', 'Kotlin', 'Vue.js', 'Nest', 'Python'].map(lang => (
                    <button key={lang} className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-all">{lang}</button>
                ))}
                </div>
            </div>

            {/* Row 4: 유형 */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <span className="text-sm font-bold text-gray-800 w-24 flex-shrink-0">유형</span>
                <div className="flex flex-wrap gap-2">
                <button className="px-4 py-1.5 bg-violet-600 text-white rounded-full text-xs font-bold transition-all shadow-sm">전체</button>
                {['구현', '문자열', '배열', '정렬', 'DFS/BFS', 'DP', 'SQL'].map(type => (
                    <button key={type} className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-all">{type}</button>
                ))}
                </div>
            </div>
            </div>

            {/* 문제 리스트 컴포넌트 */}
            <ProblemGrid problems={problems} />
        </main>
        </div>
    );
}