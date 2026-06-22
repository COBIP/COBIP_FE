'use client';

import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { MarkdownTextView } from '@/features/functional-template/components/MarkdownTextView';
import type { CodingWorkbookProblemSummaryResponse } from '@/types/CodingWorkbookTypes';
import type {
    CodingProblemContentBlock,
    CodingProblemDetailResponse,
    CodingProblemJson,
} from '@/types/CodingProblemTypes';
import { useState } from 'react';

interface ProblemDescriptionProps {
    problem: CodingProblemDetailResponse;
    relatedProblems: CodingWorkbookProblemSummaryResponse[];
    isProblemSolved?: boolean;
}

const difficultyLabel: Record<CodingProblemDetailResponse['difficulty'], string> = {
    EASY: '초급',
    MEDIUM: '중급',
    HARD: '고급',
};

const difficultyBadgeClass: Record<CodingProblemDetailResponse['difficulty'], string> = {
    EASY: 'border-amber-100 bg-amber-50 text-amber-700',
    MEDIUM: 'border-violet-100 bg-violet-50 text-violet-700',
    HARD: 'border-rose-100 bg-rose-50 text-rose-700',
};

const normalizeProblemText = (text: string) => (
    text
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\n')
        .replace(/\/n/g, '\n')
);

const collectText = (block: CodingProblemContentBlock): string => {
    if (block.type === 'hardBreak') return '\n';
    if (block.text) return normalizeProblemText(block.text);
    return block.content?.map(collectText).join('') ?? '';
};

const renderMarkdown = (text: string, key?: string | number) => (
    <MarkdownTextView
        key={key}
        content={text}
        className="text-base leading-7 text-gray-800 [&_code]:border [&_code]:border-gray-100 [&_pre]:border [&_pre]:border-gray-200 [&_pre]:bg-gray-50 [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-gray-950 [&_h4]:mb-2 [&_h4]:mt-6 [&_h4]:text-xl [&_h4]:font-bold [&_h4]:text-gray-900 [&_h5]:mb-2 [&_h5]:mt-5 [&_h5]:text-lg [&_h5]:font-bold [&_h5]:text-gray-900"
    />
);

const renderContent = (content: CodingProblemJson) => {
    if (!content) {
        return <p className="text-gray-500">문제 설명이 없습니다.</p>;
    }

    if (typeof content === 'string') {
        return renderMarkdown(normalizeProblemText(content));
    }

    const blocks = Array.isArray(content) ? content : content.content ?? [content];

    return blocks.map((block, index) => {
        const text = collectText(block);

        if (block.type === 'heading') {
            return <h2 key={index} className="mb-3 mt-7 text-xl font-bold text-gray-950">{text}</h2>;
        }

        if (block.type === 'codeBlock') {
            return (
                <pre key={index} className="my-4 overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-4 text-sm">
                    {text}
                </pre>
            );
        }

        if (block.type === 'bulletList' || block.type === 'orderedList') {
            return (
                <ul key={index} className="my-4 list-disc space-y-2 pl-5">
                    {block.content?.map((item, itemIndex) => (
                        <li key={itemIndex}>{collectText(item)}</li>
                    ))}
                </ul>
            );
        }

        return renderMarkdown(text, index);
    });
};

export default function ProblemDescription({ problem, relatedProblems, isProblemSolved = false }: ProblemDescriptionProps) {
    const [activeTab, setActiveTab] = useState<'description' | 'related'>('description');
    const isCurrentProblemSolved = isProblemSolved || relatedProblems.some((relatedProblem) => (
        relatedProblem.id === problem.id && relatedProblem.solved
    ));

    return (
        <div className="flex h-full flex-col border-r border-gray-200 bg-white">
            <div className="flex h-12 shrink-0 border-b border-gray-200 bg-white">
                <button
                    type="button"
                    onClick={() => setActiveTab('description')}
                    className={`flex-1 border-b-2 text-sm font-bold transition-colors ${
                        activeTab === 'description'
                            ? 'border-violet-600 text-violet-700'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                    문제 설명
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('related')}
                    className={`flex-1 border-b-2 text-sm font-bold transition-colors ${
                        activeTab === 'related'
                            ? 'border-violet-600 text-violet-700'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                    관련 문제
                </button>
            </div>

            <div className="min-h-0 flex-grow overflow-y-auto p-6">
                {activeTab === 'description' ? (
                    <>
                        <div className="mb-6">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="rounded border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                                    {problem.category}
                                </span>
                                <span className={`rounded border px-2 py-1 text-xs font-bold ${difficultyBadgeClass[problem.difficulty]}`}>
                                    {difficultyLabel[problem.difficulty]}
                                </span>
                                {isCurrentProblemSolved && (
                                    <span className="inline-flex items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                                        <CheckCircle2 size={13} />
                                        해결됨
                                    </span>
                                )}
                            </div>
                            <h1 className="mb-4 text-3xl font-bold text-gray-950">
                                {problem.orderIndex}. {problem.title}
                            </h1>
                            <div className="flex gap-4 text-sm font-medium text-gray-500">
                                <span>시간 제한: {problem.timeLimitMillis}ms</span>
                                <span>메모리 제한: {problem.memoryLimitMb}MB</span>
                            </div>
                        </div>

                        <hr className="my-6 border-gray-100" />

                        <div className="max-w-none text-gray-800">
                            {renderContent(problem.contentJson)}
                        </div>

                        {problem.sampleTestCases.length > 0 && (
                            <section className="mt-8">
                                <h2 className="mb-3 text-xl font-bold text-gray-950">입출력 예시</h2>
                                <div className="overflow-hidden rounded-md border border-gray-200">
                                    <table className="w-full table-fixed border-collapse text-sm">
                                        <thead className="bg-gray-50 text-xs font-bold text-gray-500">
                                            <tr>
                                                <th className="border-b border-r border-gray-200 px-3 py-2 text-left">입력 예시</th>
                                                <th className="border-b border-gray-200 px-3 py-2 text-left">출력 예시</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {problem.sampleTestCases.map((testCase) => (
                                                <tr key={testCase.id} className="align-top">
                                                    <td className="border-r border-gray-200 px-3 py-3">
                                                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                                                            {normalizeProblemText(testCase.input)}
                                                        </pre>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                                                            {normalizeProblemText(testCase.expectedOutput)}
                                                        </pre>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}
                    </>
                ) : (
                    <div>
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-gray-950">같은 문제집의 관련 문제</h2>
                            <p className="mt-1 text-sm text-gray-500">같은 문제집 안의 다른 문제로 바로 이동할 수 있습니다.</p>
                        </div>

                        {relatedProblems.length === 0 ? (
                            <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                                관련 문제를 불러오는 중입니다.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {relatedProblems.map((relatedProblem) => {
                                    const isCurrent = relatedProblem.id === problem.id;
                                    const row = (
                                        <div
                                            className={`flex items-center gap-3 rounded-md border px-4 py-3 transition-colors ${
                                                relatedProblem.solved
                                                    ? 'border-emerald-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/60'
                                                    : isCurrent
                                                    ? 'border-violet-200 bg-violet-50'
                                                    : 'border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50/60'
                                            }`}
                                        >
                                            <span className={`w-7 shrink-0 text-sm font-bold ${relatedProblem.solved ? 'text-emerald-600' : 'text-gray-600'}`}>
                                                {relatedProblem.orderIndex}
                                            </span>
                                            <div className="min-w-0 flex-grow">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <p className={`truncate text-sm font-bold ${relatedProblem.solved ? 'text-emerald-950' : 'text-gray-950'}`}>
                                                        {relatedProblem.title}
                                                    </p>
                                                    {isCurrent && (
                                                        <span className="shrink-0 rounded bg-violet-600 px-2 py-0.5 text-[11px] font-bold text-white">
                                                            현재 풀이 중
                                                        </span>
                                                    )}
                                                    {relatedProblem.solved && (
                                                        <span className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                                            <CheckCircle2 size={12} />
                                                            해결됨
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 flex gap-1.5 text-[11px] font-bold">
                                                    <span className="rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-blue-700">
                                                        {relatedProblem.category}
                                                    </span>
                                                    <span className={`rounded border px-1.5 py-0.5 ${difficultyBadgeClass[relatedProblem.difficulty]}`}>
                                                        {difficultyLabel[relatedProblem.difficulty]}
                                                    </span>
                                                </div>
                                            </div>
                                            {!isCurrent && <ChevronRight size={17} className="shrink-0 text-gray-400" />}
                                        </div>
                                    );

                                    return isCurrent ? (
                                        <div key={relatedProblem.id}>{row}</div>
                                    ) : (
                                        <Link key={relatedProblem.id} href={`/coding-test/problem/${relatedProblem.id}`}>
                                            {row}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
