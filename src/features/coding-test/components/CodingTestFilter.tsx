// src/features/coding-test/components/CodingTestFilter.tsx
'use client';

import { useState } from 'react';
import type { GetWorkbooksParams } from '@/types/CodingWorkbookTypes';

// DB 약속에 맞춘 최종 카테고리 & 난이도 세팅
const FILTER_CATEGORIES = [
    { 
        id: 'category', 
        label: '출제 기관', 
        options: [
            { label: '전체', value: undefined }, 
            { label: '네이버', value: '네이버' }, 
            { label: '삼성', value: '삼성' }, 
            { label: '다음', value: '다음' }
        ] 
    },
    { 
        id: 'difficulty', 
        label: '난이도', 
        options: [
            { label: '전체', value: undefined }, 
            { label: '초급', value: 'EASY' }, 
            { label: '중급', value: 'MEDIUM' }, 
            { label: '고급', value: 'HARD' }
        ] 
    },
];

interface CodingTestFilterProps {
    selectedParams: GetWorkbooksParams;
    onFilterChange: (categoryId: string, optionValue: string | undefined) => void;
    onSearch: (keyword: string) => void;
}

export default function CodingTestFilter({ selectedParams, onFilterChange, onSearch }: CodingTestFilterProps) {
    const [searchInput, setSearchInput] = useState(selectedParams.keyword || '');

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch(searchInput);
        }
    };

    return (
        <>
            <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">문제집 목록</h1>
                    <p className="text-lg text-gray-600">다양한 출제 기관의 문제집을 통해 실력을 향상시키세요.</p>
                </div>
                <div className="w-full md:w-80 relative group">
                    <input 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="w-full h-11 pl-11 pr-4 bg-white border border-gray-300 rounded-xl text-sm" 
                        placeholder="문제집 제목 검색 (Enter)" 
                        type="text"
                    />
                    <svg className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8 flex flex-col gap-4 shadow-sm">
                {FILTER_CATEGORIES.map((category) => (
                    <div key={category.id} className="flex flex-col md:flex-row md:items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="w-32 flex-shrink-0 border-l-4 pl-3 border-blue-500">
                            <span className="text-sm font-bold text-gray-800">{category.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {category.options.map((option) => {
                                // 타입 안전성을 위해 타입 단언 사용
                                const isSelected = (selectedParams as Record<string, unknown>)[category.id] === option.value;
                                return (
                                    <button 
                                        key={option.label} 
                                        onClick={() => onFilterChange(category.id, option.value)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                            isSelected ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}