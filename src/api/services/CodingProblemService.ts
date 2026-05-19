import axiosInstance from '@/api/AxiosInstance';
import type { ApiResponse } from '@/types/CodingWorkbookTypes';
import type {
    CodingCodeRunRequest,
    CodingCodeRunResponse,
    CodingProblemDetailResponse,
    CodingSubmissionRequest,
    CodingSubmissionResponse,
} from '@/types/CodingProblemTypes';

export const getProblemDetail = async (problemId: number): Promise<CodingProblemDetailResponse> => {
    const response = await axiosInstance.get<ApiResponse<CodingProblemDetailResponse>>(
        `/api/v1/coding-problems/${problemId}`
    );

    return response.data.data;
};

export const runCode = async (
    problemId: number,
    request: CodingCodeRunRequest
): Promise<CodingCodeRunResponse> => {
    const response = await axiosInstance.post<ApiResponse<CodingCodeRunResponse>>(
        `/api/v1/coding-problems/${problemId}/run`,
        request
    );

    return response.data.data;
};

export const submitCode = async (
    problemId: number,
    request: CodingSubmissionRequest
): Promise<CodingSubmissionResponse> => {
    const response = await axiosInstance.post<ApiResponse<CodingSubmissionResponse>>(
        `/api/v1/coding-problems/${problemId}/submissions`,
        request
    );

    return response.data.data;
};
