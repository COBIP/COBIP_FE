import axiosInstance from '@/api/AxiosInstance';
import type {
    ApiResponse,
    CodingWorkbookDetailResponse,
    CodingWorkbookSummaryResponse,
    GetWorkbooksParams,
    PageResponse,
} from '@/types/CodingWorkbookTypes';

export const getWorkbooks = async (
    params?: GetWorkbooksParams
): Promise<PageResponse<CodingWorkbookSummaryResponse>> => {
    const response = await axiosInstance.get<ApiResponse<PageResponse<CodingWorkbookSummaryResponse>>>(
        '/api/v1/coding-workbooks',
        { params }
    );

    return response.data.data;
};

export const getWorkbookDetail = async (id: number): Promise<CodingWorkbookDetailResponse> => {
    const response = await axiosInstance.get<ApiResponse<CodingWorkbookDetailResponse>>(
        `/api/v1/coding-workbooks/${id}`
    );

    return response.data.data;
};
