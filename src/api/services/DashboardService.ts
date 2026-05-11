// src/api/services/DashboardService.ts
import axiosInstance from '@/api/AxiosInstance';
import type { MyDashboardData } from '@/types/DashboardTypes';
import type { LearningProgress } from '@/types/LearningProgressTypes';

export interface PageResponse<TItem> {
    content: TItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export const dashboardService = {
    getDashboard: async (): Promise<MyDashboardData> => {
        // 인터셉터가 자동으로 헤더에 토큰을 넣어줍니다.
        const response = await axiosInstance.get('/api/v1/users/me/dashboard');
        return response.data.data;
    },

    getLearningProgress: async (page = 0, size = 20): Promise<PageResponse<LearningProgress>> => {
        const response = await axiosInstance.get('/api/v1/users/me/learning', {
            params: { page, size },
        });
        return response.data.data;
    },
};
