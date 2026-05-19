import { useEffect, useState } from 'react';
import { getWorkbooks } from '@/api/services/CodingWorkbookService';
import type {
    CodingWorkbookSummaryResponse,
    GetWorkbooksParams,
    PageResponse,
} from '@/types/CodingWorkbookTypes';

export const useCodingWorkbooks = (initialParams?: GetWorkbooksParams) => {
    const [data, setData] = useState<PageResponse<CodingWorkbookSummaryResponse> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [params, setParams] = useState<GetWorkbooksParams>(
        initialParams ?? { page: 0, size: 20 }
    );

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getWorkbooks(params);
                if (!isMounted) return;
                setData(result);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch coding workbooks:', err);
                if (!isMounted) return;
                setError('문제집 목록을 불러오지 못했습니다.');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [params]);

    const updateParams = (newParams: Partial<GetWorkbooksParams>) => {
        setParams((prev) => ({ ...prev, ...newParams }));
    };

    return {
        data,
        isLoading,
        error,
        params,
        updateParams,
    };
};
