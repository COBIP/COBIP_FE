import { useState } from 'react';
import type { CodingCodeRunResponse, CodingSubmissionResponse } from '@/types/CodingProblemTypes';

interface ConsolePanelProps {
    isExecuting: boolean;
    handleRun: (customInput?: string) => void;
    handleSubmit: () => void;
    runResult: CodingCodeRunResponse | null;
    submissionResult: CodingSubmissionResponse | null;
    executionError: string | null;
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

function ResultBlock({ result }: { result: CodingCodeRunResponse | CodingSubmissionResponse }) {
    return (
        <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-3">
                <span className={`text-base font-bold ${result.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {statusLabel[result.status] ?? result.status}
                </span>
                {result.time && <span className="text-gray-500">실행 시간: {result.time}</span>}
                {result.memory !== null && <span className="text-gray-500">메모리: {result.memory}KB</span>}
            </div>
            {result.message && <p className="text-gray-700">{result.message}</p>}
            {result.stdout && (
                <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Stdout</span>
                    <pre className="mt-1 bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap">{result.stdout}</pre>
                </div>
            )}
            {result.stderr && (
                <div>
                    <span className="text-xs font-bold text-red-500 uppercase">Stderr</span>
                    <pre className="mt-1 bg-red-50 border border-red-100 rounded-lg p-3 whitespace-pre-wrap text-red-700">{result.stderr}</pre>
                </div>
            )}
            {result.compileOutput && (
                <div>
                    <span className="text-xs font-bold text-orange-500 uppercase">Compile Output</span>
                    <pre className="mt-1 bg-orange-50 border border-orange-100 rounded-lg p-3 whitespace-pre-wrap text-orange-700">{result.compileOutput}</pre>
                </div>
            )}
        </div>
    );
}

export default function ConsolePanel({
    isExecuting,
    handleRun,
    handleSubmit,
    runResult,
    submissionResult,
    executionError,
}: ConsolePanelProps) {
    const [activeTab, setActiveTab] = useState<'TESTCASE' | 'RUN_RESULT' | 'SUBMIT_RESULT'>('TESTCASE');
    const [customInput, setCustomInput] = useState('');

    return (
        <div className="flex flex-col h-full bg-white border-t border-gray-200">
            <div className="flex gap-6 px-4 pt-2 bg-gray-50 border-b border-gray-200">
                <button onClick={() => setActiveTab('TESTCASE')} className={`pb-2 text-sm font-bold ${activeTab === 'TESTCASE' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700'}`}>테스트 케이스</button>
                <button onClick={() => setActiveTab('RUN_RESULT')} className={`pb-2 text-sm font-bold ${activeTab === 'RUN_RESULT' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700'}`}>실행 결과</button>
                <button onClick={() => setActiveTab('SUBMIT_RESULT')} className={`pb-2 text-sm font-bold ${activeTab === 'SUBMIT_RESULT' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700'}`}>제출 결과</button>
            </div>

            <div className="flex-grow overflow-y-auto p-4">
                {executionError && (
                    <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                        {executionError}
                    </div>
                )}

                {activeTab === 'TESTCASE' && (
                    <textarea
                        value={customInput}
                        onChange={(event) => setCustomInput(event.target.value)}
                        className="w-full h-full min-h-[120px] resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                        placeholder="직접 입력값을 넣고 실행해보세요."
                    />
                )}

                {activeTab === 'RUN_RESULT' && (
                    runResult ? <ResultBlock result={runResult} /> : <span className="text-gray-400">실행 결과가 여기에 표시됩니다.</span>
                )}

                {activeTab === 'SUBMIT_RESULT' && (
                    <div>
                        {submissionResult ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-bold ${submissionResult.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {submissionResult.status === 'ACCEPTED' ? '정답입니다' : statusLabel[submissionResult.status]}
                                    </span>
                                    <span className="text-gray-600">통과: {submissionResult.passedCount} / {submissionResult.totalCount}</span>
                                </div>
                                <ResultBlock result={submissionResult} />
                            </div>
                        ) : <span className="text-gray-400">제출 결과가 여기에 표시됩니다.</span>}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 p-4 bg-white border-t border-gray-200">
                <button
                    onClick={() => { setActiveTab('RUN_RESULT'); handleRun(customInput); }}
                    disabled={isExecuting}
                    className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg disabled:opacity-50"
                >
                    실행
                </button>
                <button
                    onClick={() => { setActiveTab('SUBMIT_RESULT'); handleSubmit(); }}
                    disabled={isExecuting}
                    className="px-6 py-2 bg-violet-600 text-white font-bold rounded-lg disabled:opacity-50"
                >
                    제출
                </button>
            </div>
        </div>
    );
}