'use client';

import { use } from 'react';
import { useCodingSolving } from '@/hooks/useCodingSolving';
import ProblemDescription from '@/features/coding-test/components/ProblemDescription';
import CodeEditor from '@/features/coding-test/components/CodeEditor';
import ConsolePanel from '@/features/coding-test/components/ConsolePanel';
import { Header } from '@/features/main-home/components/Header';
import type { CodingProblemDetailResponse } from '@/types/CodingProblemTypes';

export default function CodingProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const problemId = Number(resolvedParams.id);
    
    const { 
        problem: apiProblem,
        isLoading, 
        selectedLanguage, changeLanguage, 
        sourceCode, setSourceCode,
        isExecuting, handleRun, handleSubmit,
        runResult, submissionResult, resetCode
    } = useCodingSolving(problemId);

    const dummyProblem: CodingProblemDetailResponse = {
        id: problemId,
        workbookId: 999,
        title: "두 수의 합 (더미 데이터)",
        category: "알고리즘",
        difficulty: "MEDIUM",
        contentJson: "문제 설명입니다.",
        explanationJson: null,
        orderIndex: 1,
        timeLimitMillis: 1000,
        memoryLimitMb: 256,
        sampleTestCases: [
            { id: 1, input: "nums = [2, 7], target = 9", expectedOutput: "[0, 1]", orderIndex: 1 }
        ],
        starterCodes: [
            { language: 'JAVA', code: 'public class Solution { }' },
            { language: 'PYTHON', code: 'def solution(): pass' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const problem = apiProblem || dummyProblem;

    if (isLoading && !apiProblem) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
            <Header />
            <main className="flex-grow flex w-full overflow-hidden">
                <div className="w-[40%] min-w-[450px] h-full shadow-inner">
                    <ProblemDescription problem={problem} />
                </div>
                <div className="w-[60%] flex flex-col h-full bg-[#1E1E1E]">
                    <div className="flex-grow overflow-hidden">
                        <CodeEditor 
                            selectedLanguage={selectedLanguage}
                            changeLanguage={changeLanguage}
                            sourceCode={sourceCode}
                            setSourceCode={setSourceCode}
                            resetCode={resetCode}
                        />
                    </div>
                    <div className="h-[35%] min-h-[250px]">
                        <ConsolePanel 
                            isExecuting={isExecuting}
                            handleRun={handleRun}
                            handleSubmit={handleSubmit}
                            runResult={runResult}
                            submissionResult={submissionResult}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}