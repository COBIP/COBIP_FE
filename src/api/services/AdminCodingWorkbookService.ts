import { API_BASE_URL } from '@/api/services/ApiConfig';
import { useUserStore } from '@/store/UseUserStore';
import type {
  AdminCodingProblemDetail,
  AdminCodingProblemPayload,
  AdminCodingProblemSummary,
  AdminCodingWorkbookDetail,
  AdminCodingWorkbookPayload,
  AdminCodingWorkbookQuery,
  AdminCodingWorkbookSummary,
  PageResponse,
} from '@/types/AdminCodingWorkbookTypes';

interface ApiResponse<TData> {
  message?: string;
  data: TData;
}

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

class AdminCodingWorkbookApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminCodingWorkbookApiError';
  }
}

function getAccessToken() {
  const storeToken = useUserStore.getState().accessToken;

  if (storeToken) {
    return storeToken;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('accessToken') ?? localStorage.getItem('access_token');
}

function buildQueryString(params?: QueryParams) {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

async function requestAdminCoding<TData>(
  path: string,
  options: RequestInit & { query?: QueryParams } = {},
): Promise<TData> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(options.query)}`, {
    cache: 'no-store',
    ...options,
    headers,
  });
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? ((await response.json()) as ApiResponse<TData>)
    : null;

  if (!response.ok) {
    throw new AdminCodingWorkbookApiError(body?.message ?? `관리자 API 요청에 실패했습니다. (${response.status})`);
  }

  return body?.data as TData;
}

export const adminCodingWorkbookService = {
  getWorkbooks(params: AdminCodingWorkbookQuery = {}) {
    return requestAdminCoding<PageResponse<AdminCodingWorkbookSummary>>('/api/v1/admin/coding-workbooks', {
      query: {
        keyword: params.keyword,
        category: params.category,
        difficulty: params.difficulty,
        status: params.status,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? 'displayOrder,asc',
      },
    });
  },

  createWorkbook(payload: AdminCodingWorkbookPayload) {
    return requestAdminCoding<AdminCodingWorkbookDetail>('/api/v1/admin/coding-workbooks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getWorkbook(workbookId: number) {
    return requestAdminCoding<AdminCodingWorkbookDetail>(`/api/v1/admin/coding-workbooks/${workbookId}`);
  },

  updateWorkbook(workbookId: number, payload: Partial<AdminCodingWorkbookPayload>) {
    return requestAdminCoding<AdminCodingWorkbookDetail>(`/api/v1/admin/coding-workbooks/${workbookId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteWorkbook(workbookId: number) {
    return requestAdminCoding<void>(`/api/v1/admin/coding-workbooks/${workbookId}`, {
      method: 'DELETE',
    });
  },

  getProblems(workbookId: number) {
    return requestAdminCoding<AdminCodingProblemSummary[]>(`/api/v1/admin/coding-workbooks/${workbookId}/problems`);
  },

  createProblem(workbookId: number, payload: AdminCodingProblemPayload) {
    return requestAdminCoding<AdminCodingProblemDetail>(`/api/v1/admin/coding-workbooks/${workbookId}/problems`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getProblem(workbookId: number, problemId: number) {
    return requestAdminCoding<AdminCodingProblemDetail>(
      `/api/v1/admin/coding-workbooks/${workbookId}/problems/${problemId}`,
    );
  },

  updateProblem(workbookId: number, problemId: number, payload: Partial<AdminCodingProblemPayload>) {
    return requestAdminCoding<AdminCodingProblemDetail>(
      `/api/v1/admin/coding-workbooks/${workbookId}/problems/${problemId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
  },

  deleteProblem(workbookId: number, problemId: number) {
    return requestAdminCoding<void>(`/api/v1/admin/coding-workbooks/${workbookId}/problems/${problemId}`, {
      method: 'DELETE',
    });
  },
};
