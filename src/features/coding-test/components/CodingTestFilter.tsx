'use client';

import { useState } from 'react';
import type { CodingDifficulty } from '@/types/CodingWorkbookTypes';

const DIFFICULTY_LABELS: Record<CodingDifficulty, string> = {
    EASY: '초급',
    MEDIUM: '중급',
    HARD: '고급',
};

const DIFFICULTY_OPTIONS: CodingDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];

const toDifficultyOptions = (
    difficulties: CodingDifficulty[]
): Array<{ label: string; value: CodingDifficulty | undefined }> => [
    { label: '전체', value: undefined },
    ...difficulties.map((difficulty) => ({
        label: DIFFICULTY_LABELS[difficulty],
        value: difficulty,
    })),
];

export interface CodingTestFilterState {
    titleKeyword?: string;
    workbookCategory?: string;
    workbookDifficulty?: CodingDifficulty;
    problemCategory?: string;
    problemDifficulty?: CodingDifficulty;
}

interface CodingTestFilterProps {
    value: CodingTestFilterState;
    workbookCategoryOptions: string[];
    problemCategoryOptions: string[];
    onApply: (filters: CodingTestFilterState) => void;
    onReset: () => void;
}

export default function CodingTestFilter({
    value,
    workbookCategoryOptions,
    problemCategoryOptions,
    onApply,
    onReset,
}: CodingTestFilterProps) {
    const [draft, setDraft] = useState<CodingTestFilterState>(value);
    const [titleInput, setTitleInput] = useState(value.titleKeyword ?? '');

    const updateAndApply = (next: Partial<CodingTestFilterState>) => {
        setDraft((previous) => {
            const nextDraft = { ...previous, ...next };
            onApply({
                ...nextDraft,
                titleKeyword: nextDraft.titleKeyword?.trim() || undefined,
            });
            return nextDraft;
        });
    };

    const applyTitleSearch = () => {
        updateAndApply({ titleKeyword: titleInput.trim() || undefined });
    };

    const resetAll = () => {
        setDraft({});
        setTitleInput('');
        onReset();
    };

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-950">문제 목록</h1>
                    <p className="text-sm text-gray-500">
                        문제집 조건과 문제 조건을 함께 골라 코딩테스트 문제를 찾아보세요.
                    </p>
                </div>
                <div className="flex w-full gap-2 md:w-[420px]">
                    <input
                        value={titleInput}
                        onChange={(event) => setTitleInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') applyTitleSearch();
                        }}
                        className="h-10 min-w-0 flex-grow rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        placeholder="문제 제목 검색"
                        type="text"
                    />
                    <button
                        type="button"
                        onClick={applyTitleSearch}
                        className="h-10 rounded-md bg-violet-600 px-5 text-sm font-bold text-white transition-colors hover:bg-violet-700"
                    >
                        검색
                    </button>
                </div>
            </div>

            <div className="mb-8 rounded-md border border-gray-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <section className="space-y-4">
                        <h2 className="text-sm font-bold text-gray-950">문제집 필터</h2>
                        <FilterButtonGroup
                            label="카테고리"
                            options={[
                                { label: '전체', value: undefined },
                                ...workbookCategoryOptions.map((category) => ({ label: category, value: category })),
                            ]}
                            value={draft.workbookCategory}
                            onChange={(workbookCategory) => updateAndApply({ workbookCategory })}
                        />
                        <FilterButtonGroup
                            label="난이도"
                            options={toDifficultyOptions(DIFFICULTY_OPTIONS)}
                            value={draft.workbookDifficulty}
                            onChange={(workbookDifficulty) => updateAndApply({ workbookDifficulty })}
                        />
                    </section>

                    <section className="space-y-4 lg:border-l lg:border-gray-100 lg:pl-6">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-sm font-bold text-gray-950">문제 필터</h2>
                            <button
                                type="button"
                                onClick={resetAll}
                                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50"
                            >
                                초기화
                            </button>
                        </div>
                        <FilterButtonGroup
                            label="유형"
                            options={[
                                { label: '전체', value: undefined },
                                ...problemCategoryOptions.map((category) => ({ label: category, value: category })),
                            ]}
                            value={draft.problemCategory}
                            onChange={(problemCategory) => updateAndApply({ problemCategory })}
                        />
                        <FilterButtonGroup
                            label="난이도"
                            options={toDifficultyOptions(DIFFICULTY_OPTIONS)}
                            value={draft.problemDifficulty}
                            onChange={(problemDifficulty) => updateAndApply({ problemDifficulty })}
                        />
                    </section>
                </div>
            </div>
        </>
    );
}

interface FilterButtonGroupProps<TValue extends string | undefined> {
    label: string;
    options: Array<{ label: string; value: TValue }>;
    value: TValue;
    onChange: (value: TValue) => void;
}

function FilterButtonGroup<TValue extends string | undefined>({
    label,
    options,
    value,
    onChange,
}: FilterButtonGroupProps<TValue>) {
    return (
        <div className="space-y-2">
            <div className="text-xs font-bold text-gray-700">{label}</div>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        key={option.label}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                            value === option.value
                                ? 'bg-violet-600 text-white'
                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
