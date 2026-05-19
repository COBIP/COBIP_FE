import { useEffect, useState } from 'react';
import { getWorkbookDetail } from '@/api/services/CodingWorkbookService';
import type { CodingWorkbookDetailResponse } from '@/types/CodingWorkbookTypes';

export const useCodingWorkbookDetail = (id: number) => {
    const [data, setData] = useState<CodingWorkbookDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id || Number.isNaN(id)) {
            setIsLoading(false);
            setError('유효하지 않은 문제집입니다.');
            return;
        }

        let isMounted = true;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getWorkbookDetail(id);
                if (!isMounted) return;
                setData({
                    ...result,
                    problems: [...result.problems].sort((a, b) => a.orderIndex - b.orderIndex),
                });
                setError(null);
            } catch (err) {
                console.error('Failed to fetch coding workbook detail:', err);
                if (!isMounted) return;
                setError('문제집 정보를 불러오지 못했습니다.');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [id]);

    return { data, isLoading, error };
};
