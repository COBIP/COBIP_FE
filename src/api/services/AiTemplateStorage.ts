import type {
  AiFeatureTemplateGenerateRequest,
  AiFeatureTemplateGenerateResult,
} from '@/api/services/AiService';
import type { LearningProgress } from '@/features/my-page/types/DashboardTypes';

export const AI_TEMPLATE_SESSION_KEY = 'cobip.aiFeatureTemplateDraft';
const AI_TEMPLATE_LIBRARY_KEY = 'cobip.aiFeatureTemplateLibrary';

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
};

function checkBrowser() {
  return typeof window !== 'undefined';
}

function createAiTemplateId() {
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

export function getSavedAiTemplates(): SavedAiTemplateDraft[] {
  if (!checkBrowser()) return [];

  try {
    const raw = localStorage.getItem(AI_TEMPLATE_LIBRARY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed as SavedAiTemplateDraft[] : [];
  } catch {
    return [];
  }
}

export function getSavedAiTemplate(id: string | null) {
  if (!id) return null;
  return getSavedAiTemplates().find((template) => template.id === id) ?? null;
}

export function setAiTemplateToLibrary(
  draft: AiTemplateDraft,
  savedTemplateId?: string | null,
): SavedAiTemplateDraft {
  const library = getSavedAiTemplates();
  const now = new Date().toISOString();
  const existingIndex = savedTemplateId
    ? library.findIndex((template) => template.id === savedTemplateId)
    : -1;
  const existing = existingIndex >= 0 ? library[existingIndex] : null;
  const savedDraft: SavedAiTemplateDraft = {
    ...draft,
    id: existing?.id ?? createAiTemplateId(),
    savedAt: existing?.savedAt ?? draft.savedAt ?? now,
    updatedAt: now,
    progressPercent: existing?.progressPercent ?? 0,
    studySeconds: existing?.studySeconds ?? 0,
    completed: existing?.completed ?? false,
  };

  const nextLibrary = existingIndex >= 0
    ? library.map((template, index) => index === existingIndex ? savedDraft : template)
    : [savedDraft, ...library];

  if (checkBrowser()) {
    localStorage.setItem(AI_TEMPLATE_LIBRARY_KEY, JSON.stringify(nextLibrary));
  }

  return savedDraft;
}

export function loadSavedAiTemplateToSession(id: string | null) {
  const savedTemplate = getSavedAiTemplate(id);
  if (!savedTemplate) return null;

  setAiTemplateDraft({
    request: savedTemplate.request,
    result: savedTemplate.result,
    savedAt: savedTemplate.savedAt,
  });

  return savedTemplate;
}

export function mapSavedAiTemplateToLearningProgress(template: SavedAiTemplateDraft): LearningProgress {
  const numericId = Math.abs(
    Array.from(template.id).reduce((sum, char) => sum + char.charCodeAt(0), 0),
  );

  return {
    templateId: numericId,
    aiTemplateId: template.id,
    contentType: 'AI_TEMPLATE',
    templateTitle: template.result.template.overview.featureName || template.request.featureName || 'AI 생성 기능 템플릿',
    thumbnailUrl: null,
    progressPercent: template.progressPercent,
    lastStep: 'AI 생성 초안',
    solvedCount: 0,
    correctCount: 0,
    studySeconds: template.studySeconds,
    lastAccessedAt: template.updatedAt,
    completed: template.completed,
  };
}

export function getSavedAiTemplateLearningItems() {
  return getSavedAiTemplates().map(mapSavedAiTemplateToLearningProgress);
}
