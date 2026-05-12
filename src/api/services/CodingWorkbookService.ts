import axiosInstance from '@/api/AxiosInstance';
import type { PageResponse, CodingWorkbookSummary, GetWorkbooksParams } from '@/types/CodingWorkbookTypes';

export const getWorkbooks = async (
    params?: GetWorkbooksParams
): Promise<PageResponse<CodingWorkbookSummary>> => {
    // GET /api/v1/coding-workbooks 요청
    const response = await axiosInstance.get('/api/v1/coding-workbooks', { params });
    
    // ApiResponse.success()로 한 번 감싸져 오기 때문에 data.data를 반환합니다.
    return response.data.data; 
};