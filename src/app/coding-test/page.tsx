'use client';

import { useState } from 'react';
import { ProblemGrid } from '@/features/coding-test/components/ProblemGrid';
import { useCodingTest } from '@/hooks/useCodingTest';
import { CodingTestFilter } from '@/features/coding-test/components/CodingTestFilter'; 
import Header from '@/features/coding-test/components/Header'

export default function CodingTestPage() {
    const { problems } = useCodingTest();

    // 1. 현재 선택된 필터들을 기억하는 상태
    const [filters, setFilters] = useState({
        testType: '전체',
        difficulty: '전체',
        language: '전체',
        type: '전체'
    });

    // 2. 버튼이 눌렸을 때 상태를 갈아끼워주는 함수
    const handleFilterChange = (categoryId: string, option: string) => {
        setFilters(prev => ({
            ...prev,
            [categoryId]: option
        }));
    };
    
    const filteredProblems = problems.filter(problem => {
        const matchTestType = filters.testType === '전체' || problem.testType === filters.testType;
        const matchDifficulty = filters.difficulty === '전체' || problem.difficulty === filters.difficulty;
        const matchLanguage = filters.language === '전체' || problem.language === filters.language;
        const matchType = filters.type === '전체' || problem.type === filters.type;
        
        // 4조건이 모두 맞는 문제만 살아남음
        return matchTestType && matchDifficulty && matchLanguage && matchType;
    });
    
    return (
        <div className="bg-white min-h-screen">
            <Header />
            <main className="flex-grow max-w-[1440px] mx-auto w-full px-8 py-10">
                {/* 현재 상태와 함수를 자식(필터 컴포넌트)에게 넘겨줌 */}
                <CodingTestFilter 
                    selectedFilters={filters} 
                    onFilterChange={handleFilterChange} 
                />

                {/* 2. 하단 문제 리스트 영역 조립 */}
                <ProblemGrid problems={filteredProblems} />

                {/* 만약 필터 조건에 맞는 문제가 하나도 없다면 보여줄 화면 */}
                {filteredProblems.length === 0 && (
                    <div className="text-center py-20 text-gray-500 font-bold">
                        선택하신 조건에 맞는 문제가 없습니다.
                    </div>
                )}
            </main>
        </div>
    );
}