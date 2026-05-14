import axiosInstance from '@/api/AxiosInstance';
import type { 
    CodingProblemDetail, 
    CodingCodeRunRequest, 
    CodingCodeRunResponse, 
    CodingSubmissionRequest, 
    CodingSubmissionResponse 
} from '@/features/coding-test/types/CodingProblemTypes';
import type { 
    PageResponse, 
    CodingWorkbookSummary, 
    GetWorkbooksParams 
} from '@/features/coding-test/types/CodingWorkbookTypes';

export const getProblemDetail = async (problemId: number): Promise<CodingProblemDetail> => {
    const response = await axiosInstance.get(`/api/v1/coding-problems/${problemId}`);
    return response.data.data;
};

export const runCode = async (problemId: number, request: CodingCodeRunRequest): Promise<CodingCodeRunResponse> => {
    const response = await axiosInstance.post(`/api/v1/coding-problems/${problemId}/run`, request);
    return response.data.data;
};

export const submitCode = async (problemId: number, request: CodingSubmissionRequest): Promise<CodingSubmissionResponse> => {
    const response = await axiosInstance.post(`/api/v1/coding-problems/${problemId}/submissions`, request);
    return response.data.data;
};

export const getWorkbooks = async (params?: GetWorkbooksParams): Promise<PageResponse<CodingWorkbookSummary>> => {
    const response = await axiosInstance.get('/api/v1/coding-workbooks', { params });
    // ApiResponse.success(data) 구조이므로 data.data를 반환
    return response.data.data; 
};