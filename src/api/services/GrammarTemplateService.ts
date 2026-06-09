import axiosInstance from '@/api/AxiosInstance';
import type {
  GrammarTemplateItem,
  GrammarTemplateDetail,
  CodeRunRequest,
  ExecutionFlowRequest,
  CodeRunResponse,
  ExecutionFlowResponse,
  GrammarTemplateMissionSubmissionRequest,
  GrammarTemplateMissionSubmissionResponse,
} from '@/features/grammar-template/Constants';

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
      `/api/v1/grammar-templates/${templateId}/chapters/${chapterId}/run`,
      { language: request.language, sourceCode: request.sourceCode, input: request.input }
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

  submitMission: async (
    templateId: number,
    chapterId: number,
    missionId: number,
    request: GrammarTemplateMissionSubmissionRequest,
  ): Promise<GrammarTemplateMissionSubmissionResponse> => {
    const response = await axiosInstance.post<ApiResponse<GrammarTemplateMissionSubmissionResponse>>(
      `/api/v1/grammar-templates/${templateId}/chapters/${chapterId}/missions/${missionId}/submit`,
      request,
    );
    return response.data.data;
  },
};

