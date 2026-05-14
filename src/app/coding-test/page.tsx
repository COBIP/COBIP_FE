// src/app/coding-test/page.tsx
'use client';

import ProblemGrid from '@/features/coding-test/components/ProblemGrid';
import CodingTestFilter from '@/features/coding-test/components/CodingTestFilter';
import { useCodingWorkbooks } from '@/features/coding-test/hooks/useCodingWorkbooks';
import { Header } from '@/features/main-home/components/Header';

export default function CodingTestPage() {
    // API 훅 사용 (기본값: 0페이지, 16개씩)
    const { data, isLoading, params, updateParams } = useCodingWorkbooks({ page: 0, size: 16 });

    // 필터 변경 핸들러 (서버로 파라미터 전송)
    const handleFilterChange = (categoryId: string, option: string | undefined) => {
        // 필터가 바뀌면 무조건 1페이지(index 0)로 리셋
        updateParams({ 
            [categoryId]: option, 
            page: 0 
        });
    };

    // 검색 핸들러
    const handleSearch = (keyword: string) => {
        updateParams({ keyword, page: 0 });
    };

    // 로딩 상태 UI
    if (isLoading && !data) return <div className="text-center py-20">데이터를 불러오는 중입니다...</div>;

    // 백엔드 데이터 추출 (더미 데이터 제거 완료)
    const workbooks = data?.content || [];

    // =================================================================

    const totalPages = data?.totalPages || 1;
    const currentPage = (data?.page ?? data?.number ?? 0) + 1; 

    return (
        <>
            <Header/>
            <div className="bg-white min-h-screen pb-20">
                <main className="flex-grow max-w-[1440px] mx-auto w-full px-8 py-10">
                    <CodingTestFilter 
                        selectedParams={params} 
                        onFilterChange={handleFilterChange} 
                        onSearch={handleSearch}
                    />

                    {workbooks.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 font-bold">
                            선택하신 조건에 맞는 문제집이 없습니다. 😥
                        </div>
                    ) : (
                        <ProblemGrid workbooks={workbooks} />
                    )}

                    {/* 백엔드 totalPages 기반 페이징 버튼 */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-12">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => updateParams({ page: currentPage - 2 })} // 이전 페이지 (0-index 기준)
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
                            >
                                이전
                            </button>
                            
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => updateParams({ page: i })} // 특정 페이지 클릭 (0-index 기준)
                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                                        currentPage === i + 1 
                                            ? 'bg-violet-600 text-white shadow-sm' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => updateParams({ page: currentPage })} // 다음 페이지 (0-index 기준)
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
                            >
                                다음
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}