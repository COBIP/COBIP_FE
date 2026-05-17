// src/hooks/useDashboard.ts
import { useEffect, useState } from 'react';
import { dashboardService } from '@/api/services/DashboardService';
import type { MyDashboardData } from '@/features/my-page/types/DashboardTypes';

export const useDashboard = () => {
    const [dashboardData, setDashboardData] = useState<MyDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const data = await dashboardService.getDashboard();
                setDashboardData(data);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "대시보드 정보를 불러오는데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        void fetchDashboardData();
    }, []);

    return { dashboardData, isLoading, error };
};
