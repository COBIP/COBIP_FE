const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String(body.message)
        : `요청에 실패했습니다. (${response.status})`;

    throw new Error(message);
  }

  return body as T;
}

export type TemplateSummaryApiResponse = {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  accessLevel: string;
  techStacks: string[];
  thumbnailUrl: string | null;
  viewCount: number;
  favoriteCount: number;
  ownerId: number;
  ownerNickname: string;
  createdAt: string;
};

export type TemplateDetailApiResponse = TemplateSummaryApiResponse & {
  visibility: string;
  designIntent: string;
  requirementsSpec: string;
  erd: string;
  apiSpec: string;
  projectStructure: string;
  interviewQuestions: string[];
  fileUrl: string | null;
  favorited: boolean;
  updatedAt: string;
};

export type TemplatePracticeMissionType = 'CONCEPT' | 'IMPLEMENTATION' | 'DEBUGGING' | 'TEST' | 'REVIEW';

export type TemplatePracticeProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type TemplatePracticeFileApiResponse = {
  id: number;
  filePath: string;
  language: string;
  content: string;
  readOnly: boolean;
  orderIndex: number;
};

export type TemplatePracticeMissionApiResponse = {
  id: number;
  title: string;
  description: string;
  missionType: TemplatePracticeMissionType;
  orderIndex: number;
  guideContent: string;
  validationJson: Record<string, unknown> | null;
};

export type TemplatePracticeProgressApiResponse = {
  id: number;
  status: TemplatePracticeProgressStatus;
  progressPercent: number;
  completedMissionCount: number;
  currentMissionId: number | null;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string | null;
};

export type TemplatePracticeDetailApiResponse = {
  templateId: number;
  templateTitle: string;
  files: TemplatePracticeFileApiResponse[];
  missions: TemplatePracticeMissionApiResponse[];
  progress: TemplatePracticeProgressApiResponse | null;
};

export type FunctionalTemplateCardViewModel = {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'ready' | 'coming-soon';
  tags: string[];
  duration: string;
  templateId: number;
};

function getTemplateIcon(template: TemplateSummaryApiResponse): string {
  const category = template.category.toLowerCase();

  if (category.includes('auth') || category.includes('인증') || template.title.includes('인증')) {
    return '🔐';
  }

  if (category.includes('data') || category.includes('dashboard') || template.title.includes('데이터')) {
    return '📊';
  }

  if (category.includes('chat') || template.title.includes('채팅') || template.title.includes('협업')) {
    return '💬';
  }

  return '🧩';
}

function getTemplateDuration(difficulty: string): string {
  switch (difficulty) {
    case 'BEGINNER':
      return '약 1시간';
    case 'INTERMEDIATE':
      return '약 2시간';
    case 'ADVANCED':
      return '약 3시간';
    default:
      return '약 2시간';
  }
}

function getTemplateStatus(accessLevel: string): 'ready' | 'coming-soon' {
  return accessLevel === 'PREMIUM' ? 'coming-soon' : 'ready';
}

export function mapTemplateCardViewModel(
  template: TemplateSummaryApiResponse,
): FunctionalTemplateCardViewModel {
  return {
    id: String(template.id),
    templateId: template.id,
    title: template.title,
    description: template.description,
    icon: getTemplateIcon(template),
    status: getTemplateStatus(template.accessLevel),
    tags: [template.category, ...template.techStacks].filter(Boolean).slice(0, 3),
    duration: getTemplateDuration(template.difficulty),
  };
}

export async function getTemplates(): Promise<TemplateSummaryApiResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/templates`, {
    cache: 'no-store',
    headers: getAuthHeaders(),
  });

  const result = await parseJsonResponse<{ data: { content: TemplateSummaryApiResponse[] } }>(response);
  return result.data?.content ?? [];
}

export async function getTemplate(templateId: number): Promise<TemplateDetailApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/templates/${templateId}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  const result = await parseJsonResponse<{ data: TemplateDetailApiResponse }>(response);
  return result.data;
}

export async function getTemplatePractice(templateId: number): Promise<TemplatePracticeDetailApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/templates/${templateId}/practice`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  const result = await parseJsonResponse<{ data: TemplatePracticeDetailApiResponse }>(response);
  return result.data;
}

export async function createTemplatePracticeStart(
  templateId: number,
): Promise<TemplatePracticeProgressApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/templates/${templateId}/practice/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const result = await parseJsonResponse<{ data: TemplatePracticeProgressApiResponse }>(response);
  return result.data;
}

export async function updateTemplatePracticeMissionProgress(
  templateId: number,
  missionId: number,
  status: TemplatePracticeProgressStatus,
): Promise<TemplatePracticeProgressApiResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/templates/${templateId}/practice/missions/${missionId}/progress`,
    {...getAuthHeaders(),
        
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    },
  );

  const result = await parseJsonResponse<{ data: TemplatePracticeProgressApiResponse }>(response);
  return result.data;
}
