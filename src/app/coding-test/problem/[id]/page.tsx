'use client';

import { use, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
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
    const workspaceRef = useRef<HTMLDivElement>(null);

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
    const [consoleHeightPercent, setConsoleHeightPercent] = useState(35);

    const handleConsoleResizeStart = (event: PointerEvent<HTMLDivElement>) => {
        const workspace = workspaceRef.current;
        if (!workspace) return;

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);

        const workspaceRect = workspace.getBoundingClientRect();
        const updateConsoleHeight = (clientY: number) => {
            const nextHeight = ((workspaceRect.bottom - clientY) / workspaceRect.height) * 100;
            setConsoleHeightPercent(Math.min(60, Math.max(25, nextHeight)));
        };
        const handlePointerMove = (pointerEvent: globalThis.PointerEvent) => updateConsoleHeight(pointerEvent.clientY);
        const handlePointerUp = () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };

        updateConsoleHeight(event.clientY);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

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
                <div ref={workspaceRef} className="w-[60%] flex flex-col h-full bg-[#1E1E1E]">
                    <div className="min-h-[220px] overflow-hidden" style={{ height: `${100 - consoleHeightPercent}%` }}>
                        <CodeEditor
                            selectedLanguage={selectedLanguage}
                            changeLanguage={changeLanguage}
                            sourceCode={sourceCode}
                            setSourceCode={setSourceCode}
                            resetCode={resetCode}
                        />
                    </div>
                    <div
                        role="separator"
                        aria-orientation="horizontal"
                        aria-label="코드 편집기와 실행 결과 영역 크기 조절"
                        tabIndex={0}
                        onPointerDown={handleConsoleResizeStart}
                        className="group flex h-3 shrink-0 cursor-row-resize items-center justify-center border-y border-slate-800 bg-slate-950"
                    >
                        <span className="h-1 w-12 rounded-full bg-slate-700 transition-colors group-hover:bg-violet-500" />
                    </div>
                    <div className="min-h-[220px]" style={{ height: `${consoleHeightPercent}%` }}>
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
