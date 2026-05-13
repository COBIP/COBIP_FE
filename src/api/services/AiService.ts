const AI_API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_BASE_URL ?? 'http://localhost:8000';

async function parseAiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String(body.message)
        : `AI 요청에 실패했습니다. (${response.status})`;

    throw new Error(message);
  }

  return body as T;
}

export type AiFeatureTemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type AiFeatureTemplateGenerateRequest = {
  language: string;
  framework?: string | null;
  featureName: string;
  level: AiFeatureTemplateDifficulty;
  includeCode?: boolean;
  includeMissions?: boolean;
  includeInterview?: boolean;
  referenceContext?: Record<string, unknown> | null;
};

export type AiFeatureTemplateSection =
  | 'overview'
  | 'requirements'
  | 'flow'
  | 'apiSpec'
  | 'codeFiles'
  | 'basicQuestions'
  | 'missions'
  | 'interviewQuestions'
  | 'nextRecommendations';

export type AiFeatureTemplateOverview = {
  featureName: string;
  purpose: string;
  useCases: string[];
  resultDescription: string;
  techStack: string[];
  learningGoals: string[];
};

export type AiFeatureTemplateRequirement = {
  requirementId: string;
  name: string;
  description: string;
  inputValue: string;
  processCondition: string;
  successResult: string;
  failureResult: string;
  priority: string;
  relatedScreenOrApi: string;
};

export type AiFeatureTemplateFlow = {
  steps: string[];
  layers: Array<{
    layer: string;
    role: string;
  }>;
};

export type AiFeatureTemplateApiSpec = {
  apiName: string;
  method: string;
  endpoint: string;
  description: string;
  requestBody: Record<string, unknown> | string;
  responseBody: Record<string, unknown> | string;
  status: number;
};

export type AiFeatureTemplateCodeFile = {
  fileName: string;
  filePath?: string | null;
  role: string;
  language: string;
  content: string;
};

export type AiFeatureTemplateBasicQuestion = {
  questionId: string;
  type: string;
  question: string;
  choices?: string[] | null;
  answer: string;
  explanation: string;
  relatedSection?: string | null;
  difficulty: AiFeatureTemplateDifficulty;
};

export type AiFeatureTemplateMission = {
  missionId: string;
  title: string;
  description: string;
  missionType: string;
  requirements: string[];
  successCriteria: string[];
  relatedRequirements: string[];
  difficulty: AiFeatureTemplateDifficulty;
};

export type AiFeatureTemplateInterviewQuestion = {
  questionId: string;
  question: string;
  keyPoints: string[];
  sampleAnswer: string;
  relatedSection?: string | null;
};

export type AiFeatureTemplateNextRecommendation = {
  featureName: string;
  reason: string;
  expectedLearning: string;
  priority: number;
};

export type AiFeatureTemplateData = {
  overview: AiFeatureTemplateOverview;
  requirements: AiFeatureTemplateRequirement[];
  flow: AiFeatureTemplateFlow;
  apiSpec: AiFeatureTemplateApiSpec[];
  codeFiles: AiFeatureTemplateCodeFile[];
  basicQuestions: AiFeatureTemplateBasicQuestion[];
  missions: AiFeatureTemplateMission[];
  interviewQuestions: AiFeatureTemplateInterviewQuestion[];
  nextRecommendations: AiFeatureTemplateNextRecommendation[];
};

export type AiFeatureTemplateGenerateResult = {
  template: AiFeatureTemplateData;
  source: 'ollama' | 'fallback';
};

export type AiFeatureTemplateRegenerateSectionRequest = AiFeatureTemplateGenerateRequest & {
  templateId?: number | null;
  section: AiFeatureTemplateSection;
  previousContent?: Record<string, unknown> | null;
  userInstruction?: string | null;
  techStack?: string[] | null;
  currentTemplate?: Record<string, unknown> | null;
};

export type AiFeatureTemplateRegenerateSectionResult = {
  section: AiFeatureTemplateSection;
  content: unknown;
  source: 'ollama' | 'fallback';
};

type AiApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function fetchAiFeatureTemplate(
  request: AiFeatureTemplateGenerateRequest,
): Promise<AiFeatureTemplateGenerateResult> {
  const response = await fetch(`${AI_API_BASE_URL}/ai/feature-template/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      includeCode: true,
      includeMissions: true,
      includeInterview: true,
      referenceContext: null,
      ...request,
      framework: request.framework?.trim() ? request.framework.trim() : null,
      featureName: request.featureName.trim(),
      language: request.language.trim(),
    }),
  });

  const result = await parseAiResponse<AiApiResponse<AiFeatureTemplateGenerateResult>>(response);
  return result.data;
}

export async function fetchAiFeatureTemplateSection(
  request: AiFeatureTemplateRegenerateSectionRequest,
): Promise<AiFeatureTemplateRegenerateSectionResult> {
  const response = await fetch(`${AI_API_BASE_URL}/ai/feature-template/regenerate-section`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      includeCode: true,
      includeMissions: true,
      includeInterview: true,
      referenceContext: null,
      previousContent: null,
      userInstruction: null,
      techStack: null,
      currentTemplate: null,
      ...request,
      framework: request.framework?.trim() ? request.framework.trim() : null,
      featureName: request.featureName.trim(),
      language: request.language.trim(),
    }),
  });

  const result = await parseAiResponse<AiApiResponse<AiFeatureTemplateRegenerateSectionResult>>(response);
  return result.data;
}
