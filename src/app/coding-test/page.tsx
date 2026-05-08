'use client';

import { useState } from 'react';
import { ProblemGrid } from '@/features/coding-test/components/ProblemGrid';
import { CodingTestFilter } from '@/features/coding-test/components/CodingTestFilter';
import { useCodingTest } from '@/hooks/useCodingTest';
import Header from '@/features/coding-test/components/Header';

// 한 페이지에 보여줄 문제 개수 상수 선언
const ITEMS_PER_PAGE = 16;

export default function CodingTestPage() {
    const { problems } = useCodingTest();
    
    // 필터 상태
    const [filters, setFilters] = useState({
        testType: '전체',
        difficulty: '전체',
        language: '전체',
        type: '전체'
    });

    // 1. 현재 페이지 번호 상태 추가 (기본값 1페이지)
    const [currentPage, setCurrentPage] = useState(1);

    const handleFilterChange = (categoryId: string, option: string) => {
        setFilters(prev => ({ ...prev, [categoryId]: option }));
        // 필터 조건이 바뀌면 무조건 1페이지로 돌아가도록 리셋
        setCurrentPage(1);
    };

    // 필터링 적용
    const filteredProblems = problems.filter(problem => {
        const matchTestType = filters.testType === '전체' || problem.testType === filters.testType;
        const matchDifficulty = filters.difficulty === '전체' || problem.difficulty === filters.difficulty;
        const matchLanguage = filters.language === '전체' || problem.language === filters.language;
        const matchType = filters.type === '전체' || problem.type === filters.type;
        return matchTestType && matchDifficulty && matchLanguage && matchType;
    });

    // 2. 페이징 계산 로직
    // 전체 페이지 수 = (필터링된 문제 수 / 16) 올림 처리. 단, 0개라도 1페이지는 유지.
    const totalPages = Math.max(1, Math.ceil(filteredProblems.length / ITEMS_PER_PAGE));
    
    // 현재 페이지에 보여줄 데이터만 자르기 (slice 활용)
    const paginatedProblems = filteredProblems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE, 
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="bg-white min-h-screen pb-20">
            <Header />
            <main className="flex-grow max-w-[1440px] mx-auto w-full px-8 py-10">
                <CodingTestFilter 
                    selectedFilters={filters} 
                    onFilterChange={handleFilterChange} 
                />

                {/* 3. 전체 문제가 아니라 '잘려진 문제(paginatedProblems)'를 넘겨줌 */}
                <ProblemGrid problems={paginatedProblems} />
                
                {filteredProblems.length === 0 && (
                    <div className="text-center py-20 text-gray-500 font-bold">
                        선택하신 조건에 맞는 문제가 없습니다. 😥
                    </div>
                )}

                {/* 4. 동적 페이징 버튼 UI (데이터가 16개를 초과할 때만 표시됨) */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            이전
                        </button>
                        
                        {/* 페이지 숫자 버튼들 동적 생성 */}
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                                    currentPage === i + 1 
                                        ? 'bg-violet-600 text-white shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            다음
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}