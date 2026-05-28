import axiosInstance from '@/api/AxiosInstance';
import type { LearningProgress } from '@/features/my-page/types/DashboardTypes';

export interface PageResponse<TItem> {
  content: TItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const myLearningService = {
  getLearningProgress: async (page = 0, size = 10): Promise<PageResponse<LearningProgress>> => {
    const response = await axiosInstance.get('/api/v1/users/me/learning', {
      params: { page, size },
    });

    return response.data.data;
  },
};
