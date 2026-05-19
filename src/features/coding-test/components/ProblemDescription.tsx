import type {
    CodingProblemContentBlock,
    CodingProblemDetailResponse,
    CodingProblemJson,
} from '@/types/CodingProblemTypes';

interface ProblemDescriptionProps {
    problem: CodingProblemDetailResponse;
}

const difficultyLabel: Record<CodingProblemDetailResponse['difficulty'], string> = {
    EASY: '초급',
    MEDIUM: '중급',
    HARD: '고급',
};

const collectText = (block: CodingProblemContentBlock): string => {
    if (block.text) return block.text;
    return block.content?.map(collectText).join('') ?? '';
};

const renderContent = (content: CodingProblemJson) => {
    if (!content) {
        return <p className="text-gray-500">문제 설명이 없습니다.</p>;
    }

    if (typeof content === 'string') {
        return <p className="whitespace-pre-wrap leading-7">{content}</p>;
    }

    const blocks = Array.isArray(content) ? content : content.content ?? [content];

    return blocks.map((block, index) => {
        const text = collectText(block);

        if (block.type === 'heading') {
            return <h2 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-3">{text}</h2>;
        }

        if (block.type === 'codeBlock') {
            return (
                <pre key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto my-4">
                    {text}
                </pre>
            );
        }

        if (block.type === 'bulletList' || block.type === 'orderedList') {
            return (
                <ul key={index} className="list-disc pl-5 space-y-2 my-4">
                    {block.content?.map((item, itemIndex) => (
                        <li key={itemIndex}>{collectText(item)}</li>
                    ))}
                </ul>
            );
        }

        return <p key={index} className="leading-7 mb-4 whitespace-pre-wrap">{text}</p>;
    });
};

export default function ProblemDescription({ problem }: ProblemDescriptionProps) {
    return (
        <div className="h-full overflow-y-auto p-6 bg-white border-r border-gray-200">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{problem.category}</span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">{difficultyLabel[problem.difficulty]}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{problem.orderIndex}. {problem.title}</h1>
                <div className="flex gap-4 text-sm text-gray-500 font-medium">
                    <span>시간 제한: {problem.timeLimitMillis}ms</span>
                    <span>메모리 제한: {problem.memoryLimitMb}MB</span>
                </div>
            </div>

            <hr className="my-6 border-gray-100" />

            <div className="max-w-none text-gray-800 mb-10">
                {renderContent(problem.contentJson)}
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">입출력 예시</h2>
                {problem.sampleTestCases.map((testCase) => (
                    <div key={testCase.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Input</span>
                            <pre className="mt-1 text-sm bg-white p-2 rounded border border-gray-100 whitespace-pre-wrap">{testCase.input}</pre>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Output</span>
                            <pre className="mt-1 text-sm bg-white p-2 rounded border border-gray-100 whitespace-pre-wrap">{testCase.expectedOutput}</pre>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
