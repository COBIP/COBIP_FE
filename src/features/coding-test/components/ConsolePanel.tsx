import { useState } from 'react';
import type { CodingCodeRunResponse, CodingSubmissionResponse } from '@/features/coding-test/types/CodingProblemTypes';

interface ConsolePanelProps {
    isExecuting: boolean;
    handleRun: () => void;
    handleSubmit: () => void;
    runResult: CodingCodeRunResponse | null;
    submissionResult: CodingSubmissionResponse | null;
}

export default function ConsolePanel({ isExecuting, handleRun, handleSubmit, submissionResult }: ConsolePanelProps) {
    const [activeTab, setActiveTab] = useState<'TESTCASE' | 'RUN_RESULT' | 'SUBMIT_RESULT'>('TESTCASE');

    return (
        <div className="flex flex-col h-full bg-white border-t border-gray-200">
            <div className="flex gap-6 px-4 pt-2 bg-gray-50 border-b border-gray-200">
                <button onClick={() => setActiveTab('TESTCASE')} className={`pb-2 text-sm font-bold ${activeTab === 'TESTCASE' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700'}`}>테스트 케이스</button>
                <button onClick={() => setActiveTab('RUN_RESULT')} className={`pb-2 text-sm font-bold ${activeTab === 'RUN_RESULT' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700'}`}>실행 결과</button>
                <button onClick={() => setActiveTab('SUBMIT_RESULT')} className={`pb-2 text-sm font-bold ${activeTab === 'SUBMIT_RESULT' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700'}`}>제출 결과</button>
            </div>

            <div className="flex-grow overflow-y-auto p-4">
                {activeTab === 'SUBMIT_RESULT' && (
                    <div>
                        {submissionResult ? (
                            <div className="flex items-center gap-3">
                                {/* ACCEPTED로 수정 */}
                                <span className={`text-lg font-bold ${submissionResult.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {submissionResult.status === 'ACCEPTED' ? '정답입니다! 🎉' : '틀렸습니다 😢'}
                                </span>
                                <span className="text-gray-600">통과: {submissionResult.passedCount} / {submissionResult.totalCount}</span>
                            </div>
                        ) : <span className="text-gray-400">제출 결과가 여기에 표시됩니다.</span>}
                    </div>
                )}
                {/* 나머지 탭 내용은 기존과 동일하게 유지... */}
            </div>

            <div className="flex justify-end gap-3 p-4 bg-white border-t border-gray-200">
                <button onClick={() => { setActiveTab('RUN_RESULT'); handleRun(); }} disabled={isExecuting} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg disabled:opacity-50">▶ 실행</button>
                <button onClick={() => { setActiveTab('SUBMIT_RESULT'); handleSubmit(); }} disabled={isExecuting} className="px-6 py-2 bg-violet-600 text-white font-bold rounded-lg disabled:opacity-50">☁ 제출</button>
            </div>
        </div>
    );
}