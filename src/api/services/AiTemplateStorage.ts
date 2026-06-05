import axiosInstance from '@/api/AxiosInstance';
import type {
  AiFeatureTemplateGenerateRequest,
  AiFeatureTemplateGenerateResult,
} from '@/api/services/AiService';
import type { LearningProgress } from '@/features/my-page/types/DashboardTypes';

export const AI_TEMPLATE_SESSION_KEY = 'cobip.aiFeatureTemplateDraft';

export type AiTemplateDraft = {
  request: AiFeatureTemplateGenerateRequest;
  result: AiFeatureTemplateGenerateResult;
  savedAt: string;
};

export type SavedAiTemplateDraft = AiTemplateDraft & {
  id: string;
  updatedAt: string;
  progressPercent: number;
  studySeconds: number;
  completed: boolean;
  completedQuestionIds: string[];
  completedMissionIds: string[];
  lastStep?: string | null;
  lastAccessedAt?: string | null;
};

export interface AiTemplateProgressResponse {
  id: number;
  contentType: 'AI_TEMPLATE';
  aiTemplateId: string;
  templateTitle: string;
  templateSnapshot: AiTemplateDraft;
  sections: AiTemplateProgressSections | null;
  lastLearningPosition: AiTemplateLastLearningPosition | null;
  progressPercent: number;
  lastStep: string | null;
  studySeconds: number;
  completed: boolean;
  lastAccessedAt: string;
  updatedAt: string;
}

interface AiTemplateProgressSections {
  completedQuestionIds?: string[];
  completedMissionIds?: string[];
}

interface AiTemplateLastLearningPosition {
  activeSection?: string;
  activeFile?: string;
}

function checkBrowser() {
  return typeof window !== 'undefined';
}

function createAiTemplateId() {
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getTemplateTitle(draft: AiTemplateDraft) {
  return draft.result.template.overview.featureName || draft.request.featureName || 'AI 생성 기능 템플릿';
}

function getProgressState(
  draft: AiTemplateDraft,
  completedQuestionIds: string[] = [],
  completedMissionIds: string[] = [],
) {
  const totalCount = draft.result.template.basicQuestions.length + draft.result.template.missions.length;
  const completedCount = completedQuestionIds.length + completedMissionIds.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    progressPercent,
    completed: totalCount > 0 && completedCount >= totalCount,
    lastStep: completedCount > 0 ? `AI 템플릿 ${completedCount}/${totalCount} 완료` : 'AI 생성 초안',
  };
}

function mapResponseToSavedDraft(response: AiTemplateProgressResponse): SavedAiTemplateDraft {
  const snapshot = response.templateSnapshot;

  return {
    ...snapshot,
    id: response.aiTemplateId,
    updatedAt: response.updatedAt,
    progressPercent: response.progressPercent,
    studySeconds: response.studySeconds,
    completed: response.completed,
    completedQuestionIds: response.sections?.completedQuestionIds ?? [],
    completedMissionIds: response.sections?.completedMissionIds ?? [],
    lastStep: response.lastStep,
    lastAccessedAt: response.lastAccessedAt,
  };
}

function formatBackendLocalDateTime(date = new Date()) {
  return date.toISOString().slice(0, 19);
}

function getSafeTemplateTitle(draft: AiTemplateDraft) {
  return getTemplateTitle(draft).slice(0, 120);
}

function buildSavePayload(
  draft: AiTemplateDraft,
  aiTemplateId: string,
  completedQuestionIds: string[] = [],
  completedMissionIds: string[] = [],
) {
  const progress = getProgressState(draft, completedQuestionIds, completedMissionIds);
  const now = formatBackendLocalDateTime();

  return {
    aiTemplateId,
    templateTitle: getSafeTemplateTitle(draft),
    templateSnapshot: draft,
    sections: {
      completedQuestionIds,
      completedMissionIds,
    },
    lastLearningPosition: {
      activeSection: 'overview',
    },
    progressPercent: progress.progressPercent,
    lastStep: progress.lastStep,
    studySeconds: 0,
    completed: progress.completed,
    lastAccessedAt: now,
  };
}

function buildUpdatePayload(
  draft: AiTemplateDraft,
  completedQuestionIds: string[] = [],
  completedMissionIds: string[] = [],
) {
  const progress = getProgressState(draft, completedQuestionIds, completedMissionIds);

  return {
    templateTitle: getSafeTemplateTitle(draft),
    templateSnapshot: draft,
    sections: {
      completedQuestionIds,
      completedMissionIds,
    },
    lastLearningPosition: {
      activeSection: 'overview',
    },
    progressPercent: progress.progressPercent,
    lastStep: progress.lastStep,
    completed: progress.completed,
    lastAccessedAt: formatBackendLocalDateTime(),
  };
}

export function loadAiTemplateDraft(): AiTemplateDraft | null {
  if (!checkBrowser()) return null;

  const raw = sessionStorage.getItem(AI_TEMPLATE_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AiTemplateDraft;
  } catch {
    return null;
  }
}

export function setAiTemplateDraft(draft: AiTemplateDraft) {
  if (!checkBrowser()) return;
  sessionStorage.setItem(AI_TEMPLATE_SESSION_KEY, JSON.stringify(draft));
}

export async function getSavedAiTemplates(page = 0, size = 20) {
  const response = await axiosInstance.get('/api/v1/users/me/ai-templates', {
    params: { page, size },
  });

  return response.data.data;
}

export async function getSavedAiTemplate(id: string | null) {
  if (!id) return null;

  const response = await axiosInstance.get(`/api/v1/users/me/ai-templates/${encodeURIComponent(id)}`);

  return mapResponseToSavedDraft(response.data.data);
}

export async function setAiTemplateToLibrary(
  draft: AiTemplateDraft,
  savedTemplateId?: string | null,
): Promise<SavedAiTemplateDraft> {
  const aiTemplateId = savedTemplateId ?? createAiTemplateId();
  const payload = savedTemplateId
    ? buildUpdatePayload(draft)
    : buildSavePayload(draft, aiTemplateId);
  const response = savedTemplateId
    ? await axiosInstance.patch(`/api/v1/users/me/ai-templates/${encodeURIComponent(aiTemplateId)}`, payload)
    : await axiosInstance.post('/api/v1/users/me/ai-templates', payload);

  return mapResponseToSavedDraft(response.data.data);
}

export async function updateSavedAiTemplateProgress(
  draft: AiTemplateDraft,
  savedTemplateId: string | null,
  completedQuestionIds: string[],
  completedMissionIds: string[],
) {
  const aiTemplateId = savedTemplateId ?? createAiTemplateId();
  const payload = savedTemplateId
    ? buildUpdatePayload(draft, completedQuestionIds, completedMissionIds)
    : buildSavePayload(draft, aiTemplateId, completedQuestionIds, completedMissionIds);
  const response = savedTemplateId
    ? await axiosInstance.patch(`/api/v1/users/me/ai-templates/${encodeURIComponent(aiTemplateId)}`, payload)
    : await axiosInstance.post('/api/v1/users/me/ai-templates', payload);

  return mapResponseToSavedDraft(response.data.data);
}

export async function loadSavedAiTemplateToSession(id: string | null) {
  const savedTemplate = await getSavedAiTemplate(id);
  if (!savedTemplate) return null;

  setAiTemplateDraft({
    request: savedTemplate.request,
    result: savedTemplate.result,
    savedAt: savedTemplate.savedAt,
  });

  return savedTemplate;
}

export function mapSavedAiTemplateToLearningProgress(template: SavedAiTemplateDraft): LearningProgress {
  return {
    templateId: null,
    aiTemplateId: template.id,
    contentType: 'AI_TEMPLATE',
    templateTitle: getTemplateTitle(template),
    thumbnailUrl: null,
    progressPercent: template.progressPercent,
    lastStep: template.lastStep ?? 'AI 생성 초안',
    solvedCount: template.completedQuestionIds?.length ?? 0,
    correctCount: template.completedQuestionIds?.length ?? 0,
    studySeconds: template.studySeconds,
    lastAccessedAt: template.lastAccessedAt ?? template.updatedAt,
    completed: template.completed,
  };
}

export async function getSavedAiTemplateLearningItems() {
  const response = await getSavedAiTemplates(0, 20);
  const content = (response.content ?? []) as AiTemplateProgressResponse[];

  return content.map(mapResponseToSavedDraft).map(mapSavedAiTemplateToLearningProgress);
}
