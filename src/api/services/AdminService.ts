import { API_BASE_URL } from '@/api/services/ApiConfig';
import { useUserStore } from '@/store/UseUserStore';
import type {
  AdminActivityHistory,
  AdminContentModerationPayload,
  AdminContentModerationResponse,
  AdminOperationStatistics,
  AdminReportDetail,
  AdminReportStatusPayload,
  AdminReportSummary,
  AdminTemplateDetail,
  AdminTemplateExposurePayload,
  AdminTemplateSummary,
  AdminUserDetail,
  AdminUserRole,
  AdminUserStatus,
  AdminUserSummary,
  ApiResponse,
  GrammarTemplateDetail,
  GrammarTemplateLanguage,
  GrammarTemplateMediaUploadResponse,
  GrammarTemplatePayload,
  GrammarTemplateStatus,
  PageQuery,
  PageResponse,
  PracticeFile,
  PracticeFilePayload,
  PracticeMission,
  PracticeMissionPayload,
  SubscriptionPlan,
  SubscriptionPlanPayload,
  TemplatePractice,
} from '@/types/AdminTypes';

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
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

  return localStorage.getItem('accessToken');
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

async function parseAdminResponse<TData>(response: Response): Promise<TData> {
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? ((await response.json()) as ApiResponse<TData>)
    : null;

  if (!response.ok) {
    throw new AdminApiError(body?.message ?? `관리자 API 요청 실패 (${response.status})`, response.status);
  }

  if (!body) {
    return undefined as TData;
  }

  return body.data;
}

async function fetchAdminRequest<TData>(
  path: string,
  options: RequestInit & { query?: QueryParams } = {},
): Promise<TData> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(options.query)}`, {
    ...options,
    headers,
  });

  return parseAdminResponse<TData>(response);
}

function buildPageQuery(params: QueryParams = {}, pageQuery: PageQuery = {}) {
  return {
    page: pageQuery.page ?? 0,
    size: pageQuery.size ?? 20,
    sort: pageQuery.sort,
    ...params,
  };
}

export const adminService = {
  getOverview() {
    return fetchAdminRequest<AdminOperationStatistics>('/api/v1/admin/statistics/overview');
  },

  getUsers(
    params: {
      keyword?: string;
      role?: AdminUserRole;
      status?: AdminUserStatus;
      emailVerified?: boolean;
    } & PageQuery = {},
  ) {
    return fetchAdminRequest<PageResponse<AdminUserSummary>>('/api/v1/admin/users', {
      query: buildPageQuery(
        {
          keyword: params.keyword,
          role: params.role,
          status: params.status,
          emailVerified: params.emailVerified,
        },
        params,
      ),
    });
  },

  getUser(userId: number) {
    return fetchAdminRequest<AdminUserDetail>(`/api/v1/admin/users/${userId}`);
  },

  updateUserStatus(userId: number, status: AdminUserStatus) {
    return fetchAdminRequest<AdminUserDetail>(`/api/v1/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getGrammarTemplates(
    params: {
      keyword?: string;
      language?: GrammarTemplateLanguage;
      category?: string;
      difficulty?: string;
      status?: GrammarTemplateStatus;
    } & PageQuery = {},
  ) {
    return fetchAdminRequest<PageResponse<GrammarTemplateDetail>>('/api/v1/admin/grammar-templates', {
      query: buildPageQuery(
        {
          keyword: params.keyword,
          language: params.language,
          category: params.category,
          difficulty: params.difficulty,
          status: params.status,
        },
        params,
      ),
    });
  },

  getGrammarTemplate(templateId: number) {
    return fetchAdminRequest<GrammarTemplateDetail>(`/api/v1/admin/grammar-templates/${templateId}`);
  },

  createGrammarTemplate(payload: GrammarTemplatePayload) {
    return fetchAdminRequest<GrammarTemplateDetail>('/api/v1/admin/grammar-templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateGrammarTemplate(templateId: number, payload: Partial<GrammarTemplatePayload>) {
    return fetchAdminRequest<GrammarTemplateDetail>(`/api/v1/admin/grammar-templates/${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteGrammarTemplate(templateId: number) {
    return fetchAdminRequest<void>(`/api/v1/admin/grammar-templates/${templateId}`, {
      method: 'DELETE',
    });
  },

  updateGrammarTemplateStatus(templateId: number, status: GrammarTemplateStatus) {
    return fetchAdminRequest<GrammarTemplateDetail>(`/api/v1/admin/grammar-templates/${templateId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  uploadGrammarTemplateMedia(templateId: number, file: File, type: 'IMAGE' | 'VIDEO') {
    const formData = new FormData();
    formData.append('file', file);

    return fetchAdminRequest<GrammarTemplateMediaUploadResponse>(
      `/api/v1/admin/grammar-templates/${templateId}/media`,
      {
        method: 'POST',
        query: { type },
        body: formData,
      },
    );
  },

  getTemplates(
    params: {
      keyword?: string;
      category?: string;
      difficulty?: string;
      visibility?: string;
      accessLevel?: string;
      ownerId?: number;
    } & PageQuery = {},
  ) {
    return fetchAdminRequest<PageResponse<AdminTemplateSummary>>('/api/v1/admin/templates', {
      query: buildPageQuery(
        {
          keyword: params.keyword,
          category: params.category,
          difficulty: params.difficulty,
          visibility: params.visibility,
          accessLevel: params.accessLevel,
          ownerId: params.ownerId,
        },
        params,
      ),
    });
  },

  getTemplate(templateId: number) {
    return fetchAdminRequest<AdminTemplateDetail>(`/api/v1/admin/templates/${templateId}`);
  },

  updateTemplateExposure(templateId: number, payload: AdminTemplateExposurePayload) {
    return fetchAdminRequest<AdminTemplateDetail>(`/api/v1/admin/templates/${templateId}/exposure`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  getTemplatePractice(templateId: number) {
    return fetchAdminRequest<TemplatePractice>(`/api/v1/admin/templates/${templateId}/practice`);
  },

  createPracticeFile(templateId: number, payload: PracticeFilePayload) {
    return fetchAdminRequest<PracticeFile>(`/api/v1/admin/templates/${templateId}/practice/files`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updatePracticeFile(templateId: number, fileId: number, payload: PracticeFilePayload) {
    return fetchAdminRequest<PracticeFile>(`/api/v1/admin/templates/${templateId}/practice/files/${fileId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deletePracticeFile(templateId: number, fileId: number) {
    return fetchAdminRequest<void>(`/api/v1/admin/templates/${templateId}/practice/files/${fileId}`, {
      method: 'DELETE',
    });
  },

  createPracticeMission(templateId: number, payload: PracticeMissionPayload) {
    return fetchAdminRequest<PracticeMission>(`/api/v1/admin/templates/${templateId}/practice/missions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updatePracticeMission(templateId: number, missionId: number, payload: PracticeMissionPayload) {
    return fetchAdminRequest<PracticeMission>(
      `/api/v1/admin/templates/${templateId}/practice/missions/${missionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
  },

  deletePracticeMission(templateId: number, missionId: number) {
    return fetchAdminRequest<void>(`/api/v1/admin/templates/${templateId}/practice/missions/${missionId}`, {
      method: 'DELETE',
    });
  },

  getSubscriptionPlans(params: { keyword?: string; visible?: boolean } & PageQuery = {}) {
    return fetchAdminRequest<PageResponse<SubscriptionPlan>>('/api/v1/admin/subscription-plans', {
      query: buildPageQuery(
        {
          keyword: params.keyword,
          visible: params.visible,
        },
        params,
      ),
    });
  },

  createSubscriptionPlan(payload: SubscriptionPlanPayload) {
    return fetchAdminRequest<SubscriptionPlan>('/api/v1/admin/subscription-plans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateSubscriptionPlan(planId: number, payload: Partial<SubscriptionPlanPayload>) {
    return fetchAdminRequest<SubscriptionPlan>(`/api/v1/admin/subscription-plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteSubscriptionPlan(planId: number) {
    return fetchAdminRequest<void>(`/api/v1/admin/subscription-plans/${planId}`, {
      method: 'DELETE',
    });
  },

  updateSubscriptionPlanVisibility(planId: number, visible: boolean) {
    return fetchAdminRequest<SubscriptionPlan>(`/api/v1/admin/subscription-plans/${planId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ visible }),
    });
  },

  getReports(
    params: {
      keyword?: string;
      status?: string;
      targetType?: string;
      reporterId?: number;
      targetId?: number;
    } & PageQuery = {},
  ) {
    return fetchAdminRequest<PageResponse<AdminReportSummary>>('/api/v1/admin/reports', {
      query: buildPageQuery(
        {
          keyword: params.keyword,
          status: params.status,
          targetType: params.targetType,
          reporterId: params.reporterId,
          targetId: params.targetId,
        },
        params,
      ),
    });
  },

  getReport(reportId: number) {
    return fetchAdminRequest<AdminReportDetail>(`/api/v1/admin/reports/${reportId}`);
  },

  updateReportStatus(reportId: number, payload: AdminReportStatusPayload) {
    return fetchAdminRequest<AdminReportDetail>(`/api/v1/admin/reports/${reportId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  moderateContent(payload: AdminContentModerationPayload) {
    return fetchAdminRequest<AdminContentModerationResponse>('/api/v1/admin/content-moderations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getActivityHistories(params: { userId?: number; type?: string; targetType?: string } & PageQuery = {}) {
    return fetchAdminRequest<PageResponse<AdminActivityHistory>>('/api/v1/admin/activity-histories', {
      query: buildPageQuery(
        {
          userId: params.userId,
          type: params.type,
          targetType: params.targetType,
        },
        params,
      ),
    });
  },
};
