'use client';

import { use } from 'react';
import { useCodingSolving } from '@/hooks/useCodingSolving';
import ProblemDescription from '@/features/coding-test/components/ProblemDescription';
import CodeEditor from '@/features/coding-test/components/CodeEditor';
import ConsolePanel from '@/features/coding-test/components/ConsolePanel';
import { Header } from '@/features/main-home/components/Header';

export default function CodingProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const problemId = Number(resolvedParams.id);
    
    // apiProblem으로 이름을 바꾸던 부분을 원래 이름인 problem으로 단순화
    const { 
        problem,
        isLoading, 
        selectedLanguage, changeLanguage, 
        sourceCode, setSourceCode,
        isExecuting, handleRun, handleSubmit,
        runResult, submissionResult, resetCode
    } = useCodingSolving(problemId);

    // 로딩 중이거나 아직 API 데이터를 받아오지 못한 경우 안전하게 예외 처리
    if (isLoading || !problem) {
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