import axiosInstance from '@/api/AxiosInstance';
import type { GrammarTemplateItem, GrammarTemplateDetail, CodeRunRequest, ExecutionFlowRequest, CodeRunResponse, ExecutionFlowResponse } from '@/features/grammar-template/Constants';

/** API 응답 래퍼 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** 페이지 응답 */
interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const grammarTemplateService = {
  /** 문법 템플릿 목록 조회 */
  getTemplates: async (params?: {
    keyword?: string;
    language?: string;
    category?: string;
    difficulty?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<GrammarTemplateItem>> => {
    const response = await axiosInstance.get<ApiResponse<PageResponse<GrammarTemplateItem>>>(
      '/api/v1/grammar-templates',
      { params: { page: params?.page ?? 0, size: params?.size ?? 20, ...params } }
    );
    return response.data.data;
  },

  /** 문법 템플릿 상세 조회 */
  getTemplateDetail: async (templateId: number): Promise<GrammarTemplateDetail> => {
    const response = await axiosInstance.get<ApiResponse<GrammarTemplateDetail>>(
      `/api/v1/grammar-templates/${templateId}`
    );
    return response.data.data;
  },

  /** 카테고리 목록 조회 */
  getCategories: async (language?: string): Promise<string[]> => {
    const response = await axiosInstance.get<ApiResponse<string[]>>(
      '/api/v1/grammar-templates/categories',
      { params: language ? { language } : undefined }
    );
    return response.data.data;
  },

  /** 챕터 코드 실행 */
  runCode: async (
    templateId: number,
    chapterId: number,
    request: CodeRunRequest
  ): Promise<CodeRunResponse> => {
    const response = await axiosInstance.post<ApiResponse<CodeRunResponse>>(
      `/api/run`,
      { language: request.language, sourceCode: request.sourceCode }
    );
    return response.data.data;
  },

  /** 챕터 실행흐름 조회 */
  getExecutionFlow: async (
    templateId: number,
    chapterId: number,
    request: ExecutionFlowRequest
  ): Promise<ExecutionFlowResponse> => {
    const response = await axiosInstance.post<ApiResponse<ExecutionFlowResponse>>(
      `/api/v1/grammar-templates/${templateId}/chapters/${chapterId}/execution-flow`,
      request
    );
    return response.data.data;
  },
};

