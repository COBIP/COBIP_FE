'use client';

import { useState } from 'react';
import type { CodingDifficulty } from '@/types/CodingWorkbookTypes';

const WORKBOOK_NAME_OPTIONS = ['네이버 코테집', '카카오 코테집', '삼성 코테집', '라인 코테집'];
const WORKBOOK_CATEGORY_OPTIONS = ['네이버', '카카오', '삼성', '라인', '프로그래머스'];

const DIFFICULTY_OPTIONS: Array<{ label: string; value: CodingDifficulty | undefined }> = [
    { label: '전체', value: undefined },
    { label: '초급', value: 'EASY' },
    { label: '중급', value: 'MEDIUM' },
    { label: '고급', value: 'HARD' },
];

export interface CodingTestFilterState {
    titleKeyword?: string;
    workbookName?: string;
    workbookCategory?: string;
    workbookDifficulty?: CodingDifficulty;
    problemCategory?: string;
    problemDifficulty?: CodingDifficulty;
}

interface CodingTestFilterProps {
    value: CodingTestFilterState;
    problemCategoryOptions: string[];
    onApply: (filters: CodingTestFilterState) => void;
    onReset: () => void;
}

export default function CodingTestFilter({
    value,
    problemCategoryOptions,
    onApply,
    onReset,
}: CodingTestFilterProps) {
    const [draft, setDraft] = useState<CodingTestFilterState>(value);
    const [titleInput, setTitleInput] = useState(value.titleKeyword ?? '');

    const applyFilters = (nextDraft: CodingTestFilterState) => {
        onApply({
            ...nextDraft,
            titleKeyword: nextDraft.titleKeyword?.trim() || undefined,
        });
    };

    const updateAndApply = (next: Partial<CodingTestFilterState>) => {
        setDraft((prev) => {
            const nextDraft = { ...prev, ...next };
            applyFilters(nextDraft);
            return nextDraft;
        });
    };

    const applyTitleSearch = () => {
        updateAndApply({ titleKeyword: titleInput.trim() || undefined });
    };

    return (
        <>
            <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">문제집 목록</h1>
                    <p className="text-lg text-gray-600">문제집 조건과 문제 조건을 함께 골라 코테집을 찾아보세요.</p>
                </div>
                <div className="w-full md:w-[420px] flex gap-2">
                    <input
                        value={titleInput}
                        onChange={(event) => setTitleInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') applyTitleSearch();
                        }}
                        className="h-11 min-w-0 flex-grow rounded-xl border border-gray-300 px-4 text-sm"
                        placeholder="제목 검색"
                        type="text"
                    />
                    <button
                        onClick={applyTitleSearch}
                        className="h-11 px-5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors"
                    >
                        검색
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="flex flex-col gap-4">
                        <div className="border-b border-gray-100 pb-3">
                            <h3 className="text-base font-bold text-gray-900">문제집 필터</h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-sm font-bold text-gray-800 border-l-4 pl-3 border-blue-500">문제집 이름</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => updateAndApply({ workbookName: undefined })}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                        !draft.workbookName ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    전체
                                </button>
                                {WORKBOOK_NAME_OPTIONS.map((name) => (
                                    <button
                                        key={name}
                                        onClick={() => updateAndApply({ workbookName: name })}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                            draft.workbookName === name ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-sm font-bold text-gray-800 border-l-4 pl-3 border-blue-500">문제집 카테고리</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => updateAndApply({ workbookCategory: undefined })}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                        !draft.workbookCategory ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    전체
                                </button>
                                {WORKBOOK_CATEGORY_OPTIONS.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => updateAndApply({ workbookCategory: category })}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                            draft.workbookCategory === category ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-sm font-bold text-gray-800 border-l-4 pl-3 border-blue-500">문제집 난이도</span>
                            <div className="flex flex-wrap gap-2">
                                {DIFFICULTY_OPTIONS.map((option) => (
                                    <button
                                        key={option.label}
                                        onClick={() => updateAndApply({ workbookDifficulty: option.value })}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                            draft.workbookDifficulty === option.value ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col gap-4 lg:border-l lg:border-gray-100 lg:pl-8">
                        <div className="border-b border-gray-100 pb-3">
                            <h3 className="text-base font-bold text-gray-900">문제 필터</h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-sm font-bold text-gray-800 border-l-4 pl-3 border-blue-500">문제 카테고리</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => updateAndApply({ problemCategory: undefined })}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                        !draft.problemCategory ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    전체
                                </button>
                                {problemCategoryOptions.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => updateAndApply({ problemCategory: category })}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                            draft.problemCategory === category ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-sm font-bold text-gray-800 border-l-4 pl-3 border-blue-500">문제 난이도</span>
                            <div className="flex flex-wrap gap-2">
                                {DIFFICULTY_OPTIONS.map((option) => (
                                    <button
                                        key={option.label}
                                        onClick={() => updateAndApply({ problemDifficulty: option.value })}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                            draft.problemDifficulty === option.value ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end w-full">
                            <button
                                onClick={onReset}
                                className="mt-5 inline-flex w-fit items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700 transition-colors shadow-sm"
                            >
                                필터 초기화
                            </button>
                        </div>
                    </section>
                </div>

                
            </div>
        </>
    );
}
