import axiosInstance from '@/api/AxiosInstance';
import type { 
    CodingProblemDetailResponse, 
    CodingCodeRunRequest, 
    CodingCodeRunResponse, 
    CodingSubmissionRequest, 
    CodingSubmissionResponse 
} from '@/types/CodingProblemTypes';

export const getProblemDetail = async (problemId: number): Promise<CodingProblemDetailResponse> => {
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