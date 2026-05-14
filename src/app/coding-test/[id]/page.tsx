// 'use client';

// import { use } from 'react';
// import { useCodingSolving } from '@/hooks/useCodingSolving';
// import ProblemDescription from '@/features/coding-test/components/ProblemDescription';
// import CodeEditor from '@/features/coding-test/components/CodeEditor';
// import ConsolePanel from '@/features/coding-test/components/ConsolePanel';
// import { Header } from '@/features/main-home/components/Header';

// export default function CodingProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
//     const resolvedParams = use(params);
//     const problemId = Number(resolvedParams.id);
    
//     // apiProblem으로 이름을 바꾸던 부분을 원래 이름인 problem으로 단순화
//     const { 
//         problem,
//         isLoading, 
//         selectedLanguage, changeLanguage, 
//         sourceCode, setSourceCode,
//         isExecuting, handleRun, handleSubmit,
//         runResult, submissionResult, resetCode
//     } = useCodingSolving(problemId);

//     // 로딩 중이거나 아직 API 데이터를 받아오지 못한 경우 안전하게 예외 처리
//     if (isLoading || !problem) {
//         return <div className="flex h-screen items-center justify-center">Loading...</div>;
//     }

//     return (
//         <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
//             <Header />
//             <main className="flex-grow flex w-full overflow-hidden">
//                 <div className="w-[40%] min-w-[450px] h-full shadow-inner">
//                     <ProblemDescription problem={problem} />
//                 </div>
//                 <div className="w-[60%] flex flex-col h-full bg-[#1E1E1E]">
//                     <div className="flex-grow overflow-hidden">
//                         <CodeEditor 
//                             selectedLanguage={selectedLanguage}
//                             changeLanguage={changeLanguage}
//                             sourceCode={sourceCode}
//                             setSourceCode={setSourceCode}
//                             resetCode={resetCode}
//                         />
//                     </div>
//                     <div className="h-[35%] min-h-[250px]">
//                         <ConsolePanel 
//                             isExecuting={isExecuting}
//                             handleRun={handleRun}
//                             handleSubmit={handleSubmit}
//                             runResult={runResult}
//                             submissionResult={submissionResult}
//                         />
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }


'use client';

import { use } from 'react';
import { Header } from '@/features/main-home/components/Header';
import { useCodingWorkbookDetail } from '@/hooks/useCodingWorkbookDetail';
import WorkbookProblemList from '@/features/coding-test/components/WorkbookProblemList';

export default function WorkbookDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const workbookId = Number(resolvedParams.id);
    
    // 이전에 정리한 커스텀 훅 사용
    const { data: workbook, isLoading, error } = useCodingWorkbookDetail(workbookId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="animate-pulse text-violet-600 font-bold">데이터를 로드 중입니다...</div>
            </div>
        );
    }

    if (error || !workbook) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-500 font-bold">
                {error || '문제집을 찾을 수 없습니다.'}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />
            
            <main className="max-w-[1440px] mx-auto w-full px-8 py-10">
                {/* 상단 문제집 요약 섹션 */}
                <section className="mb-12 bg-white p-10 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-violet-600"></div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold">
                            {workbook.category}
                        </span>
                        <span className="px-3 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-full text-xs font-bold">
                            {workbook.difficulty}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-4">{workbook.title}</h1>
                    <p className="text-xl text-gray-600 mb-6 font-medium">{workbook.summary}</p>
                    <div className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-6 rounded-xl border border-gray-100">
                        {workbook.description}
                    </div>
                </section>

                {/* 하단 문제 리스트 섹션 */}
                <section>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            포함된 문제
                            <span className="bg-violet-600 text-white text-sm px-2.5 py-0.5 rounded-full">
                                {workbook.problems.length}
                            </span>
                        </h2>
                    </div>

                    <WorkbookProblemList problems={workbook.problems} />
                </section>
            </main>
        </div>
    );
}