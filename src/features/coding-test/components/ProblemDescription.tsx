import type { CodingProblemDetailResponse } from '@/types/CodingProblemTypes';

interface ProblemDescriptionProps {
    problem: CodingProblemDetailResponse;
}

export default function ProblemDescription({ problem }: ProblemDescriptionProps) {
    return (
        <div className="h-full overflow-y-auto p-6 bg-white border-r border-gray-200">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{problem.category}</span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">{problem.difficulty}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{problem.id}. {problem.title}</h1>
                <div className="flex gap-4 text-sm text-gray-500 font-medium">
                    <span>⏱ 시간 제한: {problem.timeLimitMillis}ms</span>
                    <span>💾 메모리 제한: {problem.memoryLimitMb}MB</span>
                </div>
            </div>
            <hr className="my-6 border-gray-100" />
            <div className="prose max-w-none text-gray-800 mb-10" 
                dangerouslySetInnerHTML={{ __html: typeof problem.contentJson === 'string' ? problem.contentJson : JSON.stringify(problem.contentJson) }} />

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">입출력 예시</h2>
                {problem.sampleTestCases.map((testCase, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Input</span>
                            <pre className="mt-1 text-sm bg-white p-2 rounded border border-gray-100">{testCase.input}</pre>
                        </div>
                        <div className="mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Output</span>
                            {/* expectedOutput으로 수정 */}
                            <pre className="mt-1 text-sm bg-white p-2 rounded border border-gray-100">{testCase.expectedOutput}</pre>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}