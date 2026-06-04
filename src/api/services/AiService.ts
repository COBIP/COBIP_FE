const AI_API_BASE_URL = (process.env.NEXT_PUBLIC_AI_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const SPRING_BOOT_FRAMEWORK = 'Spring Boot';

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

  if (body && typeof body === 'object' && 'success' in body && body.success === false) {
    const message = 'message' in body ? String(body.message) : 'AI 요청에 실패했습니다.';
    throw new Error(message);
  }

  return body as T;
}

export type AiFeatureTemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type AiFeatureTemplateGenerateRequest = {
  language: string;
  framework?: string | null;
  techStack?: string[] | null;
  featureName: string;
  level: AiFeatureTemplateDifficulty;
  difficulty?: AiFeatureTemplateDifficulty;
  includeCode?: boolean;
  includeMissions?: boolean;
  includeInterview?: boolean;
  referenceContext?: Record<string, unknown> | null;
};

export type AiChatRequest = {
  message: string;
  context?: string | null;
  useRag?: boolean | null;
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
  authenticationRequired?: boolean | null;
  requestHeaders?: AiFeatureTemplateApiHeader[];
  requestFields?: AiFeatureTemplateApiField[];
  responseFields?: AiFeatureTemplateApiField[];
  statusCodes?: AiFeatureTemplateStatusCode[];
  errorResponses?: AiFeatureTemplateErrorResponse[];
  frontendNotes?: string[];
  requestBody: Record<string, unknown> | string;
  responseBody: Record<string, unknown> | string;
  status: number;
};

export type AiFeatureTemplateApiHeader = {
  header: string;
  required: boolean;
  value: string;
  description: string;
};

export type AiFeatureTemplateApiField = {
  fieldName: string;
  type: string;
  required: boolean;
  description: string;
  example: unknown;
};

export type AiFeatureTemplateStatusCode = {
  code: number | string;
  description: string;
  condition: string;
};

export type AiFeatureTemplateErrorResponse = {
  statusCode: number | string;
  errorCode: string;
  message: string;
  example: unknown;
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
  sectionName?: AiFeatureTemplateSection;
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

export type AiChatResponse = {
  answer: string;
  source: 'ollama' | 'fallback';
  ragUsed: boolean;
  references?: unknown[];
  agent?: unknown;
};

export type AiQuizGradeResponse = {
  isCorrect: boolean;
  score: number;
  feedback: string;
  correctAnswer: string;
  explanation: string;
  relatedSection?: string | null;
};

export type AiMissionFeedbackResponse = {
  passed: boolean;
  score: number;
  summary: string;
  satisfiedRequirements: string[];
  missingRequirements: string[];
  apiSpecIssues: string[];
  codeIssues: Array<{
    fileName?: string | null;
    line?: number | null;
    severity: string;
    message: string;
    suggestion: string;
  }>;
  improvementSuggestions: string[];
  nextAction: string;
};

type AiApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const sectionAliases: Record<string, AiFeatureTemplateSection> = {
  overview: 'overview',
  requirements: 'requirements',
  flow: 'flow',
  apiSpec: 'apiSpec',
  apispec: 'apiSpec',
  api_spec: 'apiSpec',
  codeFiles: 'codeFiles',
  codefiles: 'codeFiles',
  code_files: 'codeFiles',
  code_view: 'codeFiles',
  basicQuestions: 'basicQuestions',
  basicquestions: 'basicQuestions',
  basic_questions: 'basicQuestions',
  missions: 'missions',
  interviewQuestions: 'interviewQuestions',
  interviewquestions: 'interviewQuestions',
  interview_questions: 'interviewQuestions',
  interview: 'interviewQuestions',
  nextRecommendations: 'nextRecommendations',
  nextrecommendations: 'nextRecommendations',
  next_recommendations: 'nextRecommendations',
};

const emptyAiTemplateData: AiFeatureTemplateData = {
  overview: {
    featureName: '',
    purpose: '',
    useCases: [],
    resultDescription: '',
    techStack: [],
    learningGoals: [],
  },
  requirements: [],
  flow: {
    steps: [],
    layers: [],
  },
  apiSpec: [],
  codeFiles: [],
  basicQuestions: [],
  missions: [],
  interviewQuestions: [],
  nextRecommendations: [],
};

function checkRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function convertToStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function convertToString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function convertToNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function convertToDifficulty(value: unknown): AiFeatureTemplateDifficulty {
  return value === 'beginner' || value === 'advanced' ? value : 'intermediate';
}

function getResolvedSection(value: unknown): AiFeatureTemplateSection {
  if (typeof value !== 'string') return 'overview';
  const key = value.trim();
  return sectionAliases[key] ?? sectionAliases[key.toLowerCase().replace(/-/g, '_')] ?? 'overview';
}

function getNormalizedTechStack(request: AiFeatureTemplateGenerateRequest) {
  const techStack = Array.isArray(request.techStack)
    ? request.techStack.map((item) => item.trim()).filter(Boolean)
    : [];
  const framework = formatFeatureTemplateFramework(request.framework);
  const language = request.language.trim();

  return Array.from(new Set([...techStack, framework, language].filter((item): item is string => Boolean(item))));
}

export function formatFeatureTemplateFramework(framework?: string | null) {
  if (framework?.trim()) return SPRING_BOOT_FRAMEWORK;
  return SPRING_BOOT_FRAMEWORK;
}

function buildGeneratePayload(request: AiFeatureTemplateGenerateRequest) {
  const framework = formatFeatureTemplateFramework(request.framework);
  const featureName = request.featureName.trim();
  const language = request.language.trim();
  const level = request.level;
  const techStack = getNormalizedTechStack(request);

  return {
    includeCode: true,
    includeMissions: true,
    includeInterview: true,
    referenceContext: null,
    ...request,
    framework,
    featureName,
    language,
    level,
    difficulty: request.difficulty ?? level,
    techStack,
  };
}

function getSectionValue(source: Record<string, unknown>, section: AiFeatureTemplateSection) {
  const keys = Object.entries(sectionAliases)
    .filter(([, canonical]) => canonical === section)
    .map(([key]) => key);

  for (const key of [section, ...keys]) {
    if (key in source) return source[key];
  }

  return undefined;
}

function mapRequirement(value: unknown, index: number): AiFeatureTemplateRequirement {
  const item = checkRecord(value) ? value : {};

  return {
    requirementId: convertToString(item.requirementId, `R-${index + 1}`),
    name: convertToString(item.name),
    description: convertToString(item.description),
    inputValue: convertToString(item.inputValue),
    processCondition: convertToString(item.processCondition),
    successResult: convertToString(item.successResult),
    failureResult: convertToString(item.failureResult),
    priority: convertToString(item.priority, 'MEDIUM'),
    relatedScreenOrApi: convertToString(item.relatedScreenOrApi),
  };
}

function mapLayer(value: unknown): AiFeatureTemplateFlow['layers'][number] {
  const item = checkRecord(value) ? value : {};

  return {
    layer: convertToString(item.layer),
    role: convertToString(item.role),
  };
}

function mapApiSpec(value: unknown, index: number): AiFeatureTemplateApiSpec {
  const item = checkRecord(value) ? value : {};

  return {
    apiName: convertToString(item.apiName, `API ${index + 1}`),
    method: convertToString(item.method, 'GET'),
    endpoint: convertToString(item.endpoint, '/'),
    description: convertToString(item.description),
    authenticationRequired:
      typeof item.authenticationRequired === 'boolean'
        ? item.authenticationRequired
        : typeof item.authRequired === 'boolean'
          ? item.authRequired
          : null,
    requestHeaders: Array.isArray(item.requestHeaders)
      ? item.requestHeaders.map(mapApiHeader)
      : [],
    requestFields: Array.isArray(item.requestFields)
      ? item.requestFields.map(mapApiField)
      : [],
    responseFields: Array.isArray(item.responseFields)
      ? item.responseFields.map(mapApiField)
      : [],
    statusCodes: Array.isArray(item.statusCodes)
      ? item.statusCodes.map(mapStatusCode)
      : [],
    errorResponses: Array.isArray(item.errorResponses)
      ? item.errorResponses.map(mapErrorResponse)
      : [],
    frontendNotes: convertToStringArray(item.frontendNotes),
    requestBody: checkRecord(item.requestBody) || typeof item.requestBody === 'string' ? item.requestBody : {},
    responseBody: checkRecord(item.responseBody) || typeof item.responseBody === 'string' ? item.responseBody : {},
    status: convertToNumber(item.status, 200),
  };
}

function convertToBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'required' || value === 'Y';
}

function mapApiHeader(value: unknown): AiFeatureTemplateApiHeader {
  const item = checkRecord(value) ? value : {};

  return {
    header: convertToString(item.header ?? item.name ?? item.headerName),
    required: convertToBoolean(item.required ?? item.isRequired),
    value: convertToString(item.value ?? item.example),
    description: convertToString(item.description),
  };
}

function mapApiField(value: unknown): AiFeatureTemplateApiField {
  const item = checkRecord(value) ? value : {};

  return {
    fieldName: convertToString(item.fieldName ?? item.name ?? item.field),
    type: convertToString(item.type ?? item.dataType),
    required: convertToBoolean(item.required ?? item.isRequired),
    description: convertToString(item.description),
    example: item.example ?? item.exampleValue ?? '',
  };
}

function mapStatusCode(value: unknown): AiFeatureTemplateStatusCode {
  const item = checkRecord(value) ? value : {};

  return {
    code: typeof item.code === 'number' || typeof item.code === 'string'
      ? item.code
      : convertToString(item.statusCode),
    description: convertToString(item.description ?? item.message),
    condition: convertToString(item.condition ?? item.when),
  };
}

function mapErrorResponse(value: unknown): AiFeatureTemplateErrorResponse {
  const item = checkRecord(value) ? value : {};

  return {
    statusCode: typeof item.statusCode === 'number' || typeof item.statusCode === 'string'
      ? item.statusCode
      : convertToString(item.status),
    errorCode: convertToString(item.errorCode ?? item.code),
    message: convertToString(item.message ?? item.description),
    example: item.example ?? item.responseBody ?? '',
  };
}

function mapCodeFile(value: unknown, index: number): AiFeatureTemplateCodeFile {
  const item = checkRecord(value) ? value : {};

  return {
    fileName: convertToString(item.fileName, `file-${index + 1}`),
    filePath: typeof item.filePath === 'string' ? item.filePath : null,
    role: convertToString(item.role),
    language: convertToString(item.language),
    content: convertToString(item.content),
  };
}

function mapBasicQuestion(value: unknown, index: number): AiFeatureTemplateBasicQuestion {
  const item = checkRecord(value) ? value : {};

  return {
    questionId: convertToString(item.questionId, `Q-${index + 1}`),
    type: convertToString(item.type, 'short_answer'),
    question: convertToString(item.question),
    choices: Array.isArray(item.choices) ? convertToStringArray(item.choices) : null,
    answer: convertToString(item.answer),
    explanation: convertToString(item.explanation),
    relatedSection: typeof item.relatedSection === 'string' ? item.relatedSection : null,
    difficulty: convertToDifficulty(item.difficulty),
  };
}

function mapMission(value: unknown, index: number): AiFeatureTemplateMission {
  const item = checkRecord(value) ? value : {};

  return {
    missionId: convertToString(item.missionId, `M-${index + 1}`),
    title: convertToString(item.title),
    description: convertToString(item.description),
    missionType: convertToString(item.missionType, 'implementation'),
    requirements: convertToStringArray(item.requirements),
    successCriteria: convertToStringArray(item.successCriteria),
    relatedRequirements: convertToStringArray(item.relatedRequirements),
    difficulty: convertToDifficulty(item.difficulty),
  };
}

function mapInterviewQuestion(value: unknown, index: number): AiFeatureTemplateInterviewQuestion {
  const item = checkRecord(value) ? value : {};

  return {
    questionId: convertToString(item.questionId, `I-${index + 1}`),
    question: convertToString(item.question),
    keyPoints: convertToStringArray(item.keyPoints),
    sampleAnswer: convertToString(item.sampleAnswer),
    relatedSection: typeof item.relatedSection === 'string' ? item.relatedSection : null,
  };
}

function mapNextRecommendation(value: unknown, index: number): AiFeatureTemplateNextRecommendation {
  const item = checkRecord(value) ? value : {};

  return {
    featureName: convertToString(item.featureName, `recommendation-${index + 1}`),
    reason: convertToString(item.reason),
    expectedLearning: convertToString(item.expectedLearning),
    priority: convertToNumber(item.priority, index + 1),
  };
}

function mapTemplateData(value: unknown): AiFeatureTemplateData {
  if (!checkRecord(value)) return emptyAiTemplateData;

  const overviewValue = getSectionValue(value, 'overview');
  const overview = checkRecord(overviewValue) ? overviewValue : {};
  const flowValue = getSectionValue(value, 'flow');
  const flow = checkRecord(flowValue) ? flowValue : {};

  return {
    overview: {
      featureName: typeof overview.featureName === 'string' ? overview.featureName : '',
      purpose: typeof overview.purpose === 'string' ? overview.purpose : '',
      useCases: convertToStringArray(overview.useCases),
      resultDescription: typeof overview.resultDescription === 'string' ? overview.resultDescription : '',
      techStack: convertToStringArray(overview.techStack),
      learningGoals: convertToStringArray(overview.learningGoals),
    },
    requirements: Array.isArray(getSectionValue(value, 'requirements'))
      ? (getSectionValue(value, 'requirements') as unknown[]).map(mapRequirement)
      : [],
    flow: {
      steps: convertToStringArray(flow.steps),
      layers: Array.isArray(flow.layers) ? (flow.layers as unknown[]).map(mapLayer) : [],
    },
    apiSpec: Array.isArray(getSectionValue(value, 'apiSpec'))
      ? (getSectionValue(value, 'apiSpec') as unknown[]).map(mapApiSpec)
      : [],
    codeFiles: Array.isArray(getSectionValue(value, 'codeFiles'))
      ? (getSectionValue(value, 'codeFiles') as unknown[]).map(mapCodeFile)
      : [],
    basicQuestions: Array.isArray(getSectionValue(value, 'basicQuestions'))
      ? (getSectionValue(value, 'basicQuestions') as unknown[]).map(mapBasicQuestion)
      : [],
    missions: Array.isArray(getSectionValue(value, 'missions'))
      ? (getSectionValue(value, 'missions') as unknown[]).map(mapMission)
      : [],
    interviewQuestions: Array.isArray(getSectionValue(value, 'interviewQuestions'))
      ? (getSectionValue(value, 'interviewQuestions') as unknown[]).map(mapInterviewQuestion)
      : [],
    nextRecommendations: Array.isArray(getSectionValue(value, 'nextRecommendations'))
      ? (getSectionValue(value, 'nextRecommendations') as unknown[]).map(mapNextRecommendation)
      : [],
  };
}

function mapSectionContent(section: AiFeatureTemplateSection, content: unknown) {
  if (section === 'overview') return mapTemplateData({ overview: content }).overview;
  if (section === 'flow') return mapTemplateData({ flow: content }).flow;
  return Array.isArray(content) ? content : [];
}

function mapGenerateResult(value: unknown): AiFeatureTemplateGenerateResult {
  const result = checkRecord(value) ? value : {};

  return {
    template: mapTemplateData(result.template ?? result),
    source: result.source === 'ollama' ? 'ollama' : 'fallback',
  };
}

function mapRegenerateSectionResult(value: unknown): AiFeatureTemplateRegenerateSectionResult {
  const result = checkRecord(value) ? value : {};
  const section = getResolvedSection(result.section ?? result.sectionName);

  return {
    section,
    content: mapSectionContent(section, result.content),
    source: result.source === 'ollama' ? 'ollama' : 'fallback',
  };
}

export async function fetchAiFeatureTemplate(
  request: AiFeatureTemplateGenerateRequest,
): Promise<AiFeatureTemplateGenerateResult> {
  const response = await fetch(`${AI_API_BASE_URL}/ai/feature-template/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildGeneratePayload(request)),
  });

  const result = await parseAiResponse<AiApiResponse<unknown>>(response);
  return mapGenerateResult(result.data);
}

export async function fetchAiFeatureTemplateSection(
  request: AiFeatureTemplateRegenerateSectionRequest,
): Promise<AiFeatureTemplateRegenerateSectionResult> {
  const payload = buildGeneratePayload(request);
  const response = await fetch(`${AI_API_BASE_URL}/ai/feature-template/regenerate-section`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      previousContent: request.previousContent ?? null,
      userInstruction: request.userInstruction ?? null,
      currentTemplate: request.currentTemplate ?? null,
      section: request.section,
      sectionName: request.sectionName ?? request.section,
    }),
  });

  const result = await parseAiResponse<AiApiResponse<unknown>>(response);
  return mapRegenerateSectionResult(result.data);
}

export async function fetchAiChat(request: AiChatRequest): Promise<AiChatResponse> {
  const response = await fetch(`${AI_API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: request.message,
      context: request.context ?? null,
      useRag: request.useRag ?? null,
    }),
  });

  const result = await parseAiResponse<AiApiResponse<AiChatResponse>>(response);
  return result.data;
}

export async function fetchAiQuizGrade(request: {
  featureName: string;
  question: AiFeatureTemplateBasicQuestion;
  userAnswer: string;
  relatedRequirements?: AiFeatureTemplateRequirement[];
  relatedApiSpecs?: AiFeatureTemplateApiSpec[];
}): Promise<AiQuizGradeResponse> {
  const response = await fetch(`${AI_API_BASE_URL}/ai/quiz/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId: null, ...request }),
  });
  const result = await parseAiResponse<AiApiResponse<AiQuizGradeResponse>>(response);
  return result.data;
}

export async function fetchAiMissionFeedback(request: {
  featureName: string;
  mission: AiFeatureTemplateMission;
  submittedCode: AiFeatureTemplateCodeFile[];
  requirements: AiFeatureTemplateRequirement[];
  apiSpecs: AiFeatureTemplateApiSpec[];
}): Promise<AiMissionFeedbackResponse> {
  const response = await fetch(`${AI_API_BASE_URL}/ai/mission/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId: null, ...request }),
  });
  const result = await parseAiResponse<AiApiResponse<AiMissionFeedbackResponse>>(response);
  return result.data;
}
