import { useState } from 'react';
import { Play, Upload } from 'lucide-react';
import type { CodingCodeRunResponse, CodingSubmissionResponse } from '@/types/CodingProblemTypes';

interface ConsolePanelProps {
    isExecuting: boolean;
    handleRun: (customInput?: string) => Promise<CodingCodeRunResponse | null> | CodingCodeRunResponse | null | void;
    handleSubmit: () => Promise<CodingSubmissionResponse | null> | CodingSubmissionResponse | null | void;
    onSubmissionSolved?: (result: CodingSubmissionResponse) => void;
    runResult: CodingCodeRunResponse | null;
    submissionResult: CodingSubmissionResponse | null;
    executionError: string | null;
    defaultInput?: string;
}

const statusLabel: Record<string, string> = {
    PENDING: '대기 중',
    RUNNING: '실행 중',
    ACCEPTED: '정답',
    WRONG_ANSWER: '오답',
    COMPILE_ERROR: '컴파일 오류',
    RUNTIME_ERROR: '런타임 오류',
    TIME_LIMIT_EXCEEDED: '시간 초과',
    INTERNAL_ERROR: '채점 오류',
};

function checkCodingSubmissionSolved(
    result: CodingSubmissionResponse | null | void,
): result is CodingSubmissionResponse {
    return Boolean(
        result
        && (
            result.status === 'ACCEPTED'
            || result.solved
            || (result.totalCount > 0 && result.passedCount >= result.totalCount)
        ),
    );
}

function ResultBlock({ result }: { result: CodingCodeRunResponse | CodingSubmissionResponse }) {
    const isAccepted = result.status === 'ACCEPTED'
        || ('solved' in result && Boolean(result.solved))
        || ('passedCount' in result && result.totalCount > 0 && result.passedCount >= result.totalCount);
    const hasSubmissionCount = 'passedCount' in result;

    return (
        <div className="grid h-full grid-cols-1 gap-4 text-sm md:grid-cols-[minmax(0,1fr)_13rem]">
            <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                        className={`rounded px-2 py-1 text-xs font-bold ${
                            isAccepted ? 'bg-emerald-500 text-white' : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {statusLabel[result.status] ?? result.status}
                    </span>
                    {result.message && <span className="text-xs font-semibold text-gray-500">{result.message}</span>}
                </div>

                <div className="space-y-3">
                    {result.stdout && (
                        <div>
                            <div className="mb-1 text-xs font-bold text-gray-500">출력</div>
                            <pre className="min-h-[64px] whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-sm text-gray-800">
                                {result.stdout}
                            </pre>
                        </div>
                    )}
                    {result.stderr && (
                        <div>
                            <div className="mb-1 text-xs font-bold text-red-500">Stderr</div>
                            <pre className="whitespace-pre-wrap rounded-md border border-red-100 bg-red-50 p-3 font-mono text-sm text-red-700">
                                {result.stderr}
                            </pre>
                        </div>
                    )}
                    {result.compileOutput && (
                        <div>
                            <div className="mb-1 text-xs font-bold text-orange-500">Compile Output</div>
                            <pre className="whitespace-pre-wrap rounded-md border border-orange-100 bg-orange-50 p-3 font-mono text-sm text-orange-700">
                                {result.compileOutput}
                            </pre>
                        </div>
                    )}
                    {!result.stdout && !result.stderr && !result.compileOutput && (
                        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-8 text-center text-sm text-gray-400">
                            표시할 출력이 없습니다.
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-gray-200 bg-white p-3">
                {hasSubmissionCount && (
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-gray-500">통과</span>
                        <span className="text-sm font-bold text-gray-950">
                            {result.passedCount} / {result.totalCount}
                        </span>
                    </div>
                )}
                {result.time && (
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-gray-500">실행 시간</span>
                        <span className="text-sm font-bold text-emerald-600">{result.time}</span>
                    </div>
                )}
                {result.memory !== null && (
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-gray-500">메모리 사용량</span>
                        <span className="text-sm font-bold text-emerald-600">{result.memory}KB</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ConsolePanel({
    isExecuting,
    handleRun,
    handleSubmit,
    onSubmissionSolved,
    runResult,
    submissionResult,
    executionError,
    defaultInput = '',
}: ConsolePanelProps) {
    const [activeTab, setActiveTab] = useState<'TEST_RESULT' | 'SUBMIT_RESULT'>('TEST_RESULT');

    const testCode = async () => {
        setActiveTab('TEST_RESULT');
        await handleRun(defaultInput);
    };

    const submitCode = async () => {
        setActiveTab('SUBMIT_RESULT');
        const result = await handleSubmit();
        if (checkCodingSubmissionSolved(result)) {
            onSubmissionSolved?.(result);
            window.alert('제출에 성공했습니다.');
            window.location.href = '/coding-test';
        }
    };

    return (
        <div className="flex h-full flex-col border-t border-slate-800 bg-slate-950 text-white">
            <div className="flex h-10 shrink-0 gap-6 border-b border-slate-800 px-4">
                <button
                    type="button"
                    onClick={() => setActiveTab('TEST_RESULT')}
                    className={`border-b-2 text-sm font-bold transition-colors ${
                        activeTab === 'TEST_RESULT'
                            ? 'border-violet-500 text-violet-300'
                            : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                >
                    테스트 결과
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('SUBMIT_RESULT')}
                    className={`border-b-2 text-sm font-bold transition-colors ${
                        activeTab === 'SUBMIT_RESULT'
                            ? 'border-violet-500 text-violet-300'
                            : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                >
                    제출 결과
                </button>
            </div>

            <div className="min-h-0 flex-grow overflow-y-auto bg-white p-4 text-gray-800">
                {executionError && (
                    <div className="mb-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                        {executionError}
                    </div>
                )}

                {activeTab === 'TEST_RESULT' && (
                    runResult ? (
                        <ResultBlock result={runResult} />
                    ) : (
                        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-8 text-center text-sm text-gray-400">
                            테스트 결과가 여기에 표시됩니다.
                        </div>
                    )
                )}

                {activeTab === 'SUBMIT_RESULT' && (
                    submissionResult ? (
                        <ResultBlock result={submissionResult} />
                    ) : (
                        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-8 text-center text-sm text-gray-400">
                            제출 결과가 여기에 표시됩니다.
                        </div>
                    )
                )}
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-800 bg-slate-950 p-4">
                <button
                    type="button"
                    onClick={() => void testCode()}
                    disabled={isExecuting}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                >
                    <Play size={16} />
                    테스트
                </button>
                <button
                    type="button"
                    onClick={() => void submitCode()}
                    disabled={isExecuting}
                    className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
                >
                    <Upload size={16} />
                    제출
                </button>
            </div>
        </div>
    );
}
