// src/hooks/useCodingWorkbooks.ts
import { useState, useEffect } from 'react';
import { getWorkbooks } from '@/api/services/CodingWorkbookService';
import type { PageResponse, CodingWorkbookSummary, GetWorkbooksParams } from '@/types/CodingWorkbookTypes';

export const useCodingWorkbooks = (initialParams?: GetWorkbooksParams) => {
    const [data, setData] = useState<PageResponse<CodingWorkbookSummary> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // 기본값: 0페이지(첫 페이지), 20개씩 보기
    const [params, setParams] = useState<GetWorkbooksParams>(
        initialParams || { page: 0, size: 20 }
    );

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getWorkbooks(params);
                setData(result);
                setError(null);
            } catch (err) {
                console.error('워크북 목록 조회 실패:', err);
                setError('문제집 목록을 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params]); // 파라미터(페이지, 검색어 등)가 바뀔 때마다 API를 다시 호출합니다.

    // 페이지 변경, 필터 변경 시 호출할 편리한 함수
    const updateParams = (newParams: Partial<GetWorkbooksParams>) => {
        setParams((prev) => ({ ...prev, ...newParams }));
    };

    return { 
        data, 
        isLoading, 
        error, 
        params, 
        updateParams 
    };
};