import { useState, useEffect } from 'react';
import { getWorkbookDetail } from '@/api/services/CodingWorkbookService';
import type { CodingWorkbookDetail } from '@/types/CodingWorkbookTypes';

export const useCodingWorkbookDetail = (id: number) => {
    const [data, setData] = useState<CodingWorkbookDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            
            setIsLoading(true);
            try {
                const result = await getWorkbookDetail(id);
                // 가져온 문제들을 orderIndex 기준으로 오름차순 정렬
                result.problems.sort((a, b) => a.orderIndex - b.orderIndex);
                setData(result);
                setError(null);
            } catch (err) {
                console.error('문제집 상세 정보 로드 실패:', err);
                setError('문제집 정보를 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    return { data, isLoading, error };
};