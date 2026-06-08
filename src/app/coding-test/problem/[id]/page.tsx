'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useCodingSolving } from '@/hooks/useCodingSolving';
import ProblemDescription from '@/features/coding-test/components/ProblemDescription';
import CodeEditor from '@/features/coding-test/components/CodeEditor';
import ConsolePanel from '@/features/coding-test/components/ConsolePanel';
import { Header } from '@/features/main-home/components/Header';
import { getWorkbookDetail } from '@/api/services/CodingWorkbookService';
import type { CodingWorkbookProblemSummaryResponse } from '@/types/CodingWorkbookTypes';

export default function CodingProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const problemId = Number(resolvedParams.id);

    const {
        problem,
        isLoading,
        error,
        selectedLanguage,
        changeLanguage,
        sourceCode,
        setSourceCode,
        isExecuting,
        handleRun,
        handleSubmit,
        runResult,
        submissionResult,
        resetCode,
        executionError,
    } = useCodingSolving(problemId);
    const [relatedProblems, setRelatedProblems] = useState<CodingWorkbookProblemSummaryResponse[]>([]);

    useEffect(() => {
        if (!problem?.workbookId) {
            return;
        }

        let isMounted = true;

        const fetchRelatedProblems = async () => {
            try {
                const workbook = await getWorkbookDetail(problem.workbookId);
                if (!isMounted) return;
                setRelatedProblems(workbook.problems);
            } catch (err) {
                console.error('Failed to fetch related coding problems:', err);
                if (isMounted) setRelatedProblems([]);
            }
        };

        fetchRelatedProblems();

        return () => {
            isMounted = false;
        };
    }, [problem?.workbookId]);

    const sortedRelatedProblems = useMemo(
        () => [...relatedProblems].sort((left, right) => left.orderIndex - right.orderIndex || left.id - right.id),
        [relatedProblems]
    );

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (error || !problem) {
        return <div className="flex h-screen items-center justify-center text-red-500 font-bold">{error ?? '문제를 찾을 수 없습니다.'}</div>;
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
            <Header />
            <main className="flex-grow flex w-full overflow-hidden">
                <div className="w-[40%] min-w-[450px] h-full shadow-inner">
                    <ProblemDescription problem={problem} relatedProblems={sortedRelatedProblems} />
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
                            key={problem.id}
                            isExecuting={isExecuting}
                            handleRun={handleRun}
                            handleSubmit={handleSubmit}
                            runResult={runResult}
                            submissionResult={submissionResult}
                            executionError={executionError}
                            defaultInput={problem.sampleTestCases[0]?.input ?? ''}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
