// src/features/coding-test/hooks/useCodingWorkbooks.ts
import { useState, useEffect } from 'react';
import { getWorkbooks } from '@/api/services/CodingTestService';
import type { 
    PageResponse, 
    CodingWorkbookSummary, 
    GetWorkbooksParams 
} from '@/features/coding-test/types/CodingWorkbookTypes';

export const useCodingWorkbooks = (initialParams?: GetWorkbooksParams) => {
    const [data, setData] = useState<PageResponse<CodingWorkbookSummary> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [params, setParams] = useState<GetWorkbooksParams>(
        initialParams || { page: 0, size: 16 }
    );

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getWorkbooks(params);
                setData(result);
                setError(null);
            } catch (err) {
                setError('문제집 목록을 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [params]);

    const updateParams = (newParams: Partial<GetWorkbooksParams>) => {
        setParams((prev) => ({ ...prev, ...newParams }));
    };

    return { data, isLoading, error, params, updateParams };
};