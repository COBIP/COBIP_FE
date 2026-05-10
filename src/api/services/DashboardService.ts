// src/api/services/DashboardService.ts
import axiosInstance from '@/api/AxiosInstance';
import type { MyDashboardData } from '@/types/DashboardTypes';

export const dashboardService = {
    getDashboard: async (): Promise<MyDashboardData> => {
        // 인터셉터가 자동으로 헤더에 토큰을 넣어줍니다.
        const response = await axiosInstance.get('/api/v1/users/me/dashboard');
        return response.data.data;
    }
};