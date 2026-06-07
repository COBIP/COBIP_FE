'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/api/services/AdminService';
import { CodeEditor } from '@/features/functional-template/components/CodeEditor';
import { SourceCodeSection } from '@/features/functional-template/components/SourceCodeSection';
import { AdminApiSpecEditor } from './AdminApiSpecEditor';
import type {
  AdminAccessLevel,
  AdminDifficulty,
  AdminTemplateDetail,
  AdminTemplateInterviewQuestion,
  AdminTemplateMissionDraft,
  AdminTemplateNextRecommendation,
  AdminTemplatePayload,
  AdminTemplateRequirement,
  AdminTemplateSummary,
  AdminTemplateTestCase,
  AdminVisibility,
  PracticeFile,
  PracticeFilePayload,
  PracticeMission,
  PracticeMissionPayload,
  PracticeMissionType,
  PageResponse,
} from '@/types/AdminTypes';
import {
  AdminCard,
  AdminEmpty,
  AdminError,
  AdminPageTitle,
  AdminPagination,
  formatDateTime,
  formatNumber,
} from './AdminShell';

const difficulties: AdminDifficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const visibilities: AdminVisibility[] = ['PUBLIC', 'PRIVATE'];
const accessLevels: AdminAccessLevel[] = ['FREE', 'PREMIUM'];
const runtimes = ['node', 'node16', 'node20', 'python', 'python3', 'java', 'java17', 'browser', 'none'];
const missionTypes: PracticeMissionType[] = ['CONCEPT', 'IMPLEMENTATION', 'REVIEW'];
const problemMissionTypes: PracticeMissionType[] = ['DEBUGGING', 'TEST'];

type TemplateFormState = {
  title: string;
  summary: string;
  description: string;
  category: string;
  difficulty: AdminDifficulty;
  techStacksText: string;
  designIntent: string;
  structure: string;
  requirements: AdminTemplateRequirement[];
  missions: AdminTemplateMissionDraft[];
  erd: string;
  apiSpec: string;
  interviewQuestions: AdminTemplateInterviewQuestion[];
  nextRecommendations: AdminTemplateNextRecommendation[];
  runtime: string;
  testCases: AdminTemplateTestCase[];
  tagsText: string;
  previewImage: string;
  visibility: AdminVisibility;
  accessLevel: AdminAccessLevel;
  published: boolean;
  license: string;
  source: string;
};

type PracticeFileFormState = PracticeFilePayload;

type MissionTestCaseDraft = {
  input: string;
  expectedOutput: string;
};

const emptyForm: TemplateFormState = {
  title: '',
  summary: '',
  description: '',
  category: '',
  difficulty: 'BEGINNER',
  techStacksText: '',
  designIntent: '',
  structure: '',
  requirements: [],
  missions: [],
  erd: '',
  apiSpec: '',
  interviewQuestions: [],
  nextRecommendations: [],
  runtime: 'node',
  testCases: [],
  tagsText: '',
  previewImage: '',
  visibility: 'PRIVATE',
  accessLevel: 'FREE',
  published: false,
  license: '',
  source: '',
};

const emptyPracticeFileForm: PracticeFileFormState = {
  filePath: '',
  language: 'typescript',
  content: '',
  readOnly: false,
  orderIndex: 0,
};

function parseTextList(value: string) {
  return value
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatTextList(values?: string[]) {
  return values?.join('\n') ?? '';
}

function buildInterviewQuestions(
  values?: Array<string | AdminTemplateInterviewQuestion>,
): AdminTemplateInterviewQuestion[] {
  return (
    values?.map((value) =>
      typeof value === 'string'
        ? {
            question: value,
            answerHint: '',
          }
        : {
            question: value.question ?? '',
            answerHint: value.answerHint ?? '',
          },
    ) ?? []
  );
}

function parseUnknownArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function getStringFromRecord(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null) {
      return String(value);
    }
  }

  return '';
}

function buildNextRecommendations(template: AdminTemplateDetail): AdminTemplateNextRecommendation[] {
  const source = template as unknown as Record<string, unknown>;
  const rawRecommendations = [
    ...parseUnknownArray(source.nextRecommendations),
    ...parseUnknownArray(source.next_recommendations),
    ...parseUnknownArray(source.nextRecommendation),
  ];

  return rawRecommendations
    .map((value, index) => {
      const recommendation = value as Record<string, unknown>;

      return {
        featureName: getStringFromRecord(recommendation, ['featureName', 'feature_name', 'name', 'title']).trim(),
        reason: getStringFromRecord(recommendation, ['reason', 'description']).trim(),
        expectedLearning: getStringFromRecord(recommendation, ['expectedLearning', 'expected_learning', 'learning']).trim(),
        priority: Number(recommendation.priority) || index + 1,
      };
    })
    .filter((recommendation) => recommendation.featureName || recommendation.reason || recommendation.expectedLearning);
}

function buildRequirementSpec(requirements: AdminTemplateRequirement[]) {
  const hasStructuredRequirements = requirements.some((requirement) =>
    requirement.id ||
    requirement.priority ||
    requirement.inputValue ||
    requirement.condition ||
    requirement.successResult ||
    requirement.failureResult,
  );

  if (hasStructuredRequirements) {
    return JSON.stringify({
      items: requirements.map((requirement, index) => ({
        id: requirement.id?.trim() || `R-${String(index + 1).padStart(3, '0')}`,
        type: requirement.type || 'Functional Requirement',
        required: !requirement.optionalFlag,
        priority: requirement.priority || 'HIGH',
        description: requirement.description,
        inputValue: requirement.inputValue ?? '',
        condition: requirement.condition ?? '',
        successResult: requirement.successResult ?? '',
        failureResult: requirement.failureResult ?? '',
      })),
    }, null, 2);
  }

  return requirements
    .map((requirement) => {
      const optionalText = requirement.optionalFlag ? 'optional' : 'required';

      return `[${requirement.type || 'general'}:${optionalText}] ${requirement.description}`;
    })
    .join('\n');
}

function parseRequirementSpec(value?: string): AdminTemplateRequirement[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    const items = Array.isArray(parsed)
      ? parsed
      : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as { items?: unknown }).items)
        ? (parsed as { items: unknown[] }).items
        : [];

    if (items.length > 0) {
      return items
        .map((item, index) => {
          const record = item as Record<string, unknown>;
          const description = String(record.description ?? record.name ?? record.title ?? '').trim();

          if (!description) return null;

          return {
            id: String(record.id ?? `R-${String(index + 1).padStart(3, '0')}`),
            type: String(record.type ?? 'Functional Requirement'),
            description,
            optionalFlag: record.required === false || record.optionalFlag === true,
            priority: String(record.priority ?? 'HIGH'),
            inputValue: String(record.inputValue ?? record.input ?? ''),
            condition: String(record.condition ?? ''),
            successResult: String(record.successResult ?? record.success ?? ''),
            failureResult: String(record.failureResult ?? record.failure ?? ''),
          };
        })
        .filter(Boolean) as AdminTemplateRequirement[];
    }
  } catch {
    // Legacy requirement syntax is parsed below.
  }

  return value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const matched = line.match(/^\[([^:\]]+)(?::(optional|required))?\]\s*(.*)$/i);

      if (!matched) {
        return {
          type: 'general',
          description: line,
          optionalFlag: false,
        };
      }

      return {
        type: matched[1]?.trim() || 'general',
        description: matched[3]?.trim() ?? '',
        optionalFlag: matched[2]?.toLowerCase() === 'optional',
      };
    })
    .filter((requirement) => requirement.description);
}

function buildFormFromTemplate(template: AdminTemplateDetail): TemplateFormState {
  const structuredRequirements = parseRequirementSpec(template.requirementsSpec);
  const missions = template.missions?.map((mission) => ({
    id: mission.id ?? '',
    title: mission.title ?? '',
    description: mission.description ?? '',
    type: mission.type,
    missionType: mission.missionType ?? mission.type,
    orderIndex: mission.orderIndex ?? 0,
    guideContent: mission.guideContent ?? '',
    validationJson: mission.validationJson ?? {},
    steps: mission.steps ?? (
      mission.guideContent && mission.guideContent !== mission.description
        ? mission.guideContent.split(/\r?\n/g).filter(Boolean)
        : []
    ),
  })) ?? [];
  const testCases = template.testCases?.map((testCase, index) => ({
    id: testCase.id,
    input: testCase.input ?? '',
    expectedOutput: testCase.expectedOutput ?? testCase.expected_output ?? '',
    description: testCase.description ?? '',
    orderIndex: testCase.orderIndex ?? index,
  })) ?? [];

  return {
    title: template.title ?? '',
    summary: template.summary ?? '',
    description: template.description ?? '',
    category: template.category ?? '',
    difficulty: template.difficulty,
    techStacksText: formatTextList(template.techStacks),
    designIntent: template.designIntent ?? '',
    structure: template.structure ?? template.projectStructure ?? '',
    requirements: structuredRequirements.length ? structuredRequirements : template.requirements?.length ? template.requirements : [],
    missions,
    erd: template.erd ?? '',
    apiSpec: template.apiSpec ?? '',
    interviewQuestions: buildInterviewQuestions(template.interviewQuestions),
    nextRecommendations: buildNextRecommendations(template),
    runtime: template.runtime ?? 'node',
    testCases,
    tagsText: formatTextList(template.tags),
    previewImage: template.previewImage ?? template.thumbnailUrl ?? '',
    visibility: template.visibility,
    accessLevel: template.accessLevel,
    published: template.published ?? template.visibility === 'PUBLIC',
    license: template.license ?? '',
    source: template.source ?? '',
  };
}

function buildPracticeFileForm(file: PracticeFile): PracticeFileFormState {
  return {
    filePath: file.filePath,
    language: file.language,
    content: file.content,
    readOnly: file.readOnly,
    orderIndex: file.orderIndex,
  };
}

function buildNormalizedPath(value: string) {
  return value.trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
}

function findLanguageByPath(filePath: string) {
  const extension = filePath.split('.').pop()?.toLowerCase();

  if (extension === 'ts' || extension === 'tsx') return 'typescript';
  if (extension === 'js' || extension === 'jsx') return 'javascript';
  if (extension === 'java') return 'java';
  if (extension === 'py') return 'python';
  if (extension === 'json') return 'json';
  if (extension === 'md') return 'markdown';
  if (extension === 'css') return 'css';
  if (extension === 'html') return 'html';

  return 'text';
}

function buildNextOrderIndex(items: Array<{ orderIndex: number }>) {
  return items.reduce((maxOrderIndex, item) => Math.max(maxOrderIndex, item.orderIndex), -1) + 1;
}

function buildTemplatePayload(form: TemplateFormState): AdminTemplatePayload {
  const requirements = form.requirements
    .map((requirement) => ({
      id: requirement.id?.trim(),
      type: requirement.type.trim(),
      description: requirement.description.trim(),
      optionalFlag: requirement.optionalFlag,
      priority: requirement.priority?.trim(),
      inputValue: requirement.inputValue?.trim(),
      condition: requirement.condition?.trim(),
      successResult: requirement.successResult?.trim(),
      failureResult: requirement.failureResult?.trim(),
    }))
    .filter((requirement) =>
      requirement.id ||
      requirement.type ||
      requirement.description ||
      requirement.priority ||
      requirement.inputValue ||
      requirement.condition ||
      requirement.successResult ||
      requirement.failureResult,
    );
  const missions = form.missions
    .map((mission) => ({
      id: String(mission.id).trim(),
      title: mission.title.trim(),
      steps: (mission.steps ?? []).map((step) => step.trim()).filter(Boolean),
      description: mission.description?.trim() || undefined,
      type: getTemplateMissionType(mission),
      missionType: getTemplateMissionType(mission),
      orderIndex: mission.orderIndex,
      guideContent: mission.guideContent?.trim() || undefined,
      validationJson: mission.validationJson ?? {},
    }))
    .filter((mission) => mission.id || mission.title || mission.description || mission.steps.length);
  const interviewQuestions = form.interviewQuestions
    .map((question) => ({
      question: question.question.trim(),
      answerHint: question.answerHint.trim(),
    }))
    .filter((question) => question.question || question.answerHint);
  const nextRecommendations = form.nextRecommendations
    .map((recommendation, index) => ({
      featureName: recommendation.featureName.trim(),
      reason: recommendation.reason.trim(),
      expectedLearning: recommendation.expectedLearning.trim(),
      priority: Number(recommendation.priority) || index + 1,
    }))
    .filter((recommendation) => recommendation.featureName || recommendation.reason || recommendation.expectedLearning);
  const testCases = form.testCases
    .map((testCase, index) => ({
      input: testCase.input.trim(),
      expectedOutput: (testCase.expectedOutput ?? testCase.expected_output ?? '').trim(),
      description: testCase.description?.trim() || undefined,
      orderIndex: testCase.orderIndex ?? index,
    }))
    .filter((testCase) => testCase.input || testCase.expectedOutput || testCase.description);
  const structure = form.structure.trim();

  return {
    title: form.title.trim(),
    summary: form.summary.trim() || undefined,
    description: form.description.trim(),
    category: form.category.trim(),
    difficulty: form.difficulty,
    techStacks: parseTextList(form.techStacksText),
    designIntent: form.designIntent.trim(),
    structure,
    requirements,
    requirementsSpec: buildRequirementSpec(requirements),
    missions,
    erd: form.erd.trim(),
    apiSpec: form.apiSpec.trim(),
    projectStructure: structure,
    interviewQuestions,
    nextRecommendations,
    runtime: form.runtime,
    testCases,
    tags: parseTextList(form.tagsText),
    previewImage: form.previewImage.trim() || undefined,
    visibility: form.visibility,
    accessLevel: form.accessLevel,
    published: form.published,
    license: form.license.trim() || undefined,
    source: form.source.trim() || undefined,
  };
}

function buildTemplateWithFallbackNextRecommendations(
  refreshed: AdminTemplateDetail,
  fallbackRecommendations: AdminTemplateNextRecommendation[],
): AdminTemplateDetail {
  const refreshedRecommendations = buildNextRecommendations(refreshed);

  if (refreshedRecommendations.length > 0 || fallbackRecommendations.length === 0) {
    return refreshed;
  }

  return {
    ...refreshed,
    nextRecommendations: fallbackRecommendations,
  };
}

function parseOwnerId(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function validateTemplatePayload(payload: AdminTemplatePayload) {
  const assertMaxLength = (value: string | undefined, maxLength: number, label: string) => {
    if (value && value.length > maxLength) {
      throw new Error(`${label}은(는) ${maxLength}자 이하여야 합니다. 현재 ${value.length}자입니다.`);
    }
  };
  if (!payload.title) {
    throw new Error('제목은 필수입니다.');
  }

  assertMaxLength(payload.title, 120, '제목');
  assertMaxLength(payload.summary, 500, '요약');
  assertMaxLength(payload.category, 80, '카테고리');
  assertMaxLength(payload.runtime, 40, '런타임');
  assertMaxLength(payload.previewImage, 1000, '미리보기 이미지 URL');
  assertMaxLength(payload.license, 80, '라이선스');
  assertMaxLength(payload.source, 120, '출처');

  if (!payload.description) {
    throw new Error('상세설명은 필수입니다.');
  }

  if (!payload.category) {
    throw new Error('카테고리는 필수입니다.');
  }

  const hasInvalidRequirement = payload.requirements?.some(
    (requirement) => !requirement.type || !requirement.description,
  );

  if (hasInvalidRequirement) {
    throw new Error('요구사항은 type과 description을 모두 입력해야 합니다.');
  }

  if (payload.techStacks.length > 20) {
    throw new Error(`기술 스택은 최대 20개까지 입력할 수 있습니다. 현재 ${payload.techStacks.length}개입니다.`);
  }

  if ((payload.tags?.length ?? 0) > 20) {
    throw new Error(`태그는 최대 20개까지 입력할 수 있습니다. 현재 ${payload.tags?.length ?? 0}개입니다.`);
  }

  const hasInvalidMission = payload.missions?.some((mission) => !mission.title || !mission.missionType);

  if (hasInvalidMission) {
    throw new Error('미션/문제는 title과 missionType을 입력해야 합니다.');
  }

  payload.interviewQuestions.forEach((question, index) => {
    assertMaxLength(question.question, 1000, `면접 질문 ${index + 1}번 질문`);
    assertMaxLength(question.answerHint, 1000, `면접 질문 ${index + 1}번 답변 힌트`);
  });

  const hasInvalidQuestion = payload.interviewQuestions.some((question) => !question.question);

  if (hasInvalidQuestion) {
    throw new Error('면접질문은 question을 입력해야 합니다.');
  }

  const hasInvalidRecommendation = payload.nextRecommendations?.some(
    (recommendation) => !recommendation.featureName || !recommendation.reason || !recommendation.expectedLearning || !recommendation.priority,
  );

  if (hasInvalidRecommendation) {
    throw new Error('다음 추천은 기능명, 추천 이유, 기대 학습, 우선순위를 모두 입력해야 합니다.');
  }

  payload.nextRecommendations?.forEach((recommendation, index) => {
    assertMaxLength(recommendation.featureName, 120, `다음 추천 ${index + 1}번 기능명`);
  });

  const hasInvalidTestCase = payload.testCases?.some((testCase) => !testCase.input || !testCase.expectedOutput);

  if (hasInvalidTestCase) {
    throw new Error('테스트케이스는 입력과 기대 출력을 모두 입력해야 합니다.');
  }

  payload.testCases?.forEach((testCase, index) => {
    assertMaxLength(testCase.description, 1000, `테스트케이스 ${index + 1}번 설명`);
  });

  if (payload.previewImage) {
    try {
      new URL(payload.previewImage);
    } catch {
      throw new Error('미리보기 이미지는 올바른 URL이어야 합니다.');
    }
  }
}

function createRequirement(): AdminTemplateRequirement {
  return {
    id: '',
    type: 'Functional Requirement',
    description: '',
    optionalFlag: false,
    priority: 'HIGH',
    inputValue: '',
    condition: '',
    successResult: '',
    failureResult: '',
  };
}

function createTemplateMission(): AdminTemplateMissionDraft {
  return { id: '', title: '', steps: [''], missionType: 'IMPLEMENTATION', description: '', validationJson: {} };
}

function createTemplateProblem(): AdminTemplateMissionDraft {
  return { id: '', title: '', steps: [''], missionType: 'TEST', description: '', validationJson: {} };
}

function createInterviewQuestion(): AdminTemplateInterviewQuestion {
  return { question: '', answerHint: '' };
}

function createNextRecommendation(): AdminTemplateNextRecommendation {
  return { featureName: '', reason: '', expectedLearning: '', priority: 1 };
}

function createTestCase(): AdminTemplateTestCase {
  return { input: '', expectedOutput: '', description: '' };
}

function checkProblemMissionType(missionType?: PracticeMissionType) {
  return missionType === 'DEBUGGING' || missionType === 'TEST';
}

function getTemplateMissionType(mission: AdminTemplateMissionDraft) {
  return mission.missionType ?? mission.type;
}

function getMissionValidationJson(mission: AdminTemplateMissionDraft): Record<string, unknown> {
  return mission.validationJson && typeof mission.validationJson === 'object' ? mission.validationJson : {};
}

function getMissionTargetFilePath(mission: AdminTemplateMissionDraft) {
  const validationJson = getMissionValidationJson(mission);
  const filePath =
    validationJson.filePath ??
    validationJson.targetFilePath ??
    validationJson.targetFile ??
    validationJson.mainFile ??
    validationJson.entryFile;

  return typeof filePath === 'string' ? filePath : '';
}

function buildPracticeMissionPayload(
  mission: AdminTemplateMissionDraft,
  missionType: PracticeMissionType,
  orderIndex: number,
): PracticeMissionPayload {
  const missionSteps = (mission.steps ?? []).map((step) => step.trim()).filter(Boolean);
  const missionDescription = mission.description?.trim() ?? '';
  const missionGuideContent = missionSteps.join('\n') || mission.guideContent?.trim() || missionDescription;

  return {
    title: mission.title.trim(),
    description: missionDescription,
    type: missionType,
    missionType,
    guideContent: missionGuideContent,
    validationJson: mission.validationJson ?? {},
    orderIndex,
  };
}

function buildExistingPracticeMissionPayload(
  mission: PracticeMission,
  orderIndex: number,
): PracticeMissionPayload {
  const missionType = mission.missionType ?? mission.type ?? 'CONCEPT';

  return {
    title: mission.title,
    description: mission.description ?? '',
    type: missionType,
    missionType,
    guideContent: mission.guideContent ?? mission.description ?? '',
    validationJson: mission.validationJson ?? {},
    orderIndex,
  };
}

function getMissionTestCases(mission: AdminTemplateMissionDraft) {
  const testCases = getMissionValidationJson(mission).testCases;

  if (!Array.isArray(testCases)) {
    return [];
  }

  return testCases
    .map((testCase) => {
      if (!testCase || typeof testCase !== 'object') return null;
      const record = testCase as Record<string, unknown>;
      const input = typeof record.input === 'string' ? record.input : '';
      const expectedOutput = typeof record.expectedOutput === 'string' ? record.expectedOutput : '';

      return { input, expectedOutput };
    })
    .filter((testCase): testCase is { input: string; expectedOutput: string } => Boolean(testCase));
}

function buildMissionValidationJsonWithTestCases(
  mission: AdminTemplateMissionDraft,
  testCases: MissionTestCaseDraft[],
) {
  return {
    ...getMissionValidationJson(mission),
    testCases,
  };
}

function getMissionValidationStringField(mission: AdminTemplateMissionDraft, key: string) {
  const value = getMissionValidationJson(mission)[key];
  return typeof value === 'string' ? value : '';
}

function getMissionValidationStringArrayField(mission: AdminTemplateMissionDraft, key: string) {
  const value = getMissionValidationJson(mission)[key];

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join('\n');
  }

  return typeof value === 'string' ? value : '';
}

function buildMissionValidationJsonWithField(
  mission: AdminTemplateMissionDraft,
  key: string,
  value: string,
) {
  const validationJson = { ...getMissionValidationJson(mission) };
  const nextValue = value.trim();

  if (nextValue) {
    if (key === 'timeLimitMillis' || key === 'memoryLimitMb') {
      const numericValue = Number(nextValue);
      if (Number.isFinite(numericValue) && numericValue > 0) {
        validationJson[key] = numericValue;
      }
    } else {
      validationJson[key] = nextValue;
    }
  } else {
    delete validationJson[key];
  }

  return validationJson;
}

function buildMissionValidationJsonWithArrayField(
  mission: AdminTemplateMissionDraft,
  key: string,
  value: string,
) {
  const validationJson = { ...getMissionValidationJson(mission) };
  const items = value.split(/\r?\n/g).map((item) => item.trim()).filter(Boolean);

  if (items.length > 0) {
    validationJson[key] = items;
  } else {
    delete validationJson[key];
  }

  return validationJson;
}

function buildMissionProjectValidationJson(mission: AdminTemplateMissionDraft) {
  const validationJson: Record<string, unknown> = {
    ...getMissionValidationJson(mission),
    dockerImage: getMissionValidationStringField(mission, 'dockerImage') || 'gradle:8.14-jdk21',
    testCommand: getMissionValidationStringField(mission, 'testCommand') || 'gradle test --no-daemon',
    timeLimitMillis: getMissionValidationJson(mission).timeLimitMillis || 120000,
    memoryLimitMb: getMissionValidationJson(mission).memoryLimitMb || 512,
  };

  delete validationJson.testCases;
  delete validationJson.expectedOutput;

  return validationJson;
}

async function fetchMergedTemplateDetail(templateId: number): Promise<AdminTemplateDetail> {
  const [rawDetail, practice] = await Promise.all([
    adminService.getTemplate(templateId),
    adminService.getTemplatePractice(templateId).catch(() => null),
  ]);
  const detail =
    rawDetail && typeof rawDetail === 'object' && 'data' in rawDetail
      ? ((rawDetail as unknown as { data: AdminTemplateDetail }).data ?? rawDetail)
      : rawDetail;

  return {
    ...detail,
    missions: practice?.missions ?? detail.missions,
    practiceFiles: practice?.files ?? detail.practiceFiles,
  };
}

export function AdminTemplatesPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<AdminDifficulty | ''>('');
  const [visibility, setVisibility] = useState<AdminVisibility | ''>('');
  const [accessLevel, setAccessLevel] = useState<AdminAccessLevel | ''>('');
  const [ownerId, setOwnerId] = useState('');
  const [page, setPage] = useState(0);
  const [templates, setTemplates] = useState<PageResponse<AdminTemplateSummary> | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AdminTemplateDetail | null>(null);
  const [selectedPracticeFileId, setSelectedPracticeFileId] = useState<number | null>(null);
  const [form, setForm] = useState<TemplateFormState>(emptyForm);
  const [practiceFileForm, setPracticeFileForm] = useState<PracticeFileFormState>(emptyPracticeFileForm);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [adminMemo, setAdminMemo] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      setTemplates(
        await adminService.getTemplates({
          keyword,
          category,
          difficulty: difficulty || undefined,
          visibility: visibility || undefined,
          accessLevel: accessLevel || undefined,
          ownerId: parseOwnerId(ownerId),
          page,
          size: 20,
          sort: 'createdAt,desc',
        }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '기능 템플릿 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [accessLevel, category, difficulty, keyword, ownerId, page, visibility]);

  useEffect(() => {
    queueMicrotask(() => void loadTemplates());
  }, [loadTemplates]);

  const updateForm = <TKey extends keyof TemplateFormState>(key: TKey, value: TemplateFormState[TKey]) => {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    if (page === 0) {
      void loadTemplates();
      return;
    }

    setPage(0);
  };

  const handleNew = () => {
    setSelectedTemplate(null);
    setSelectedPracticeFileId(null);
    setForm(emptyForm);
    setPracticeFileForm(emptyPracticeFileForm);
    setFormMode('create');
    setAdminMemo('');
    setError('');
    setMessage('');
  };

  const handleSelect = async (templateId: number) => {
    setError('');
    setMessage('');

    try {
      const mergedDetail = await fetchMergedTemplateDetail(templateId);

      setSelectedTemplate(mergedDetail);
      setSelectedPracticeFileId(mergedDetail.practiceFiles?.[0]?.id ?? null);
      setPracticeFileForm(mergedDetail.practiceFiles?.[0] ? buildPracticeFileForm(mergedDetail.practiceFiles[0]) : emptyPracticeFileForm);
      setForm(buildFormFromTemplate(mergedDetail));
      setFormMode('edit');
      setAdminMemo('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '기능 템플릿 상세를 불러오지 못했습니다.');
    }
  };

  const saveMissions = async (templateId: number, missions: AdminTemplateMissionDraft[]) => {
    const existingPractice = await adminService.getTemplatePractice(templateId);
    const existingMissions = existingPractice?.missions ?? [];
    const existingMissionIds = new Set(existingMissions.map((mission) => mission.id));
    const savedMissionIds = new Set<number>();
    const matchedMissionIds = new Set<number>();

    const errors: string[] = [];
    const temporaryOrderOffset = 10_000;
    for (const [index, existingMission] of existingMissions.entries()) {
      await adminService.updatePracticeMission(
        templateId,
        existingMission.id,
        buildExistingPracticeMissionPayload(existingMission, temporaryOrderOffset + index),
      );
    }

    for (const [index, mission] of missions.entries()) {
      if (!mission.title?.trim()) {
        const errMsg = '미션 제목이 비어있습니다. 건너뜁니다.';
        errors.push(errMsg);
        continue;
      }

      const missionType = getTemplateMissionType(mission);

      if (!missionType) {
        const errMsg = `미션 타입이 없습니다. 건너뜁니다. (제목: ${mission.title})`;
        errors.push(errMsg);
        continue;
      }

      const missionPayload = buildPracticeMissionPayload(mission, missionType, index);

      const missionId = Number(mission.id);
      const existingById = Number.isFinite(missionId) && missionId > 0 && existingMissionIds.has(missionId)
        ? existingMissions.find((existingMission) => existingMission.id === missionId)
        : undefined;
      const existingByStableKey = existingMissions.find(
        (existingMission) =>
          !matchedMissionIds.has(existingMission.id) &&
          existingMission.title === missionPayload.title &&
          (existingMission.missionType ?? existingMission.type) === missionPayload.missionType,
      );
      const targetMission = existingById ?? existingByStableKey;

      if (targetMission) {
        matchedMissionIds.add(targetMission.id);
      }

      try {
        if (targetMission) {
          const updated = await adminService.updatePracticeMission(templateId, targetMission.id, missionPayload);
          savedMissionIds.add(updated.id);
        } else {
          const created = await adminService.createPracticeMission(templateId, missionPayload);
          savedMissionIds.add(created.id);
        }
      } catch (error) {
        if (targetMission && error instanceof Error && error.message.includes('찾을 수 없습니다')) {
          const created = await adminService.createPracticeMission(templateId, missionPayload);
          savedMissionIds.add(created.id);
          continue;
        }

        const errMsg = `미션 저장 실패 (제목: ${mission.title}): ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errMsg);
      }
    }

    if (errors.length > 0) {
      throw new Error(`미션 저장 중 오류 발생:\n${errors.join('\n')}`);
    }

    for (const existingMission of existingMissions) {
      if (savedMissionIds.has(existingMission.id)) {
        continue;
      }

      try {
        await adminService.deletePracticeMission(templateId, existingMission.id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('찾을 수 없습니다')) {
          continue;
        }

        throw error;
      }
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = buildTemplatePayload(form);

      validateTemplatePayload(payload);

      const saved =
        formMode === 'create'
          ? await adminService.createTemplate(payload)
          : selectedTemplate
            ? await adminService.updateTemplate(selectedTemplate.id, payload)
            : null;

      if (!saved) {
        throw new Error('수정할 템플릿을 선택해주세요.');
      }

      // 미션 저장 (template 저장 후)
      if (form.missions.length > 0 || (selectedTemplate?.missions?.length ?? 0) > 0) {
        await saveMissions(saved.id, form.missions);
      }

      const refreshed = buildTemplateWithFallbackNextRecommendations(
        await fetchMergedTemplateDetail(saved.id),
        payload.nextRecommendations ?? [],
      );
      setSelectedTemplate(refreshed);
      setSelectedPracticeFileId(refreshed.practiceFiles?.[0]?.id ?? null);
      setPracticeFileForm(refreshed.practiceFiles?.[0] ? buildPracticeFileForm(refreshed.practiceFiles[0]) : emptyPracticeFileForm);
      setForm(buildFormFromTemplate(refreshed));
      setFormMode('edit');
      setMessage(
        formMode === 'create' ? '기능 템플릿과 미션을 생성했습니다.' : '기능 템플릿과 미션을 수정했습니다.',
      );
      await loadTemplates();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '기능 템플릿 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExposureChange = async (
    template: AdminTemplateSummary | AdminTemplateDetail,
    nextVisibility: AdminVisibility,
    nextAccessLevel: AdminAccessLevel,
  ) => {
    setError('');

    try {
      const updated = await adminService.updateTemplateExposure(template.id, {
        visibility: nextVisibility,
        accessLevel: nextAccessLevel,
      });

      setMessage('기능 템플릿 노출 정보를 변경했습니다.');

      if (selectedTemplate?.id === updated.id) {
        setSelectedTemplate(updated);
        setForm(buildFormFromTemplate(updated));
      }

      await loadTemplates();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : '노출 정보 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (template: AdminTemplateSummary | AdminTemplateDetail) => {
    if (!confirm(`"${template.title}" 기능 템플릿을 삭제할까요?`)) {
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      await adminService.deleteTemplate(template.id);

      if (selectedTemplate?.id === template.id) {
        handleNew();
      }

      setMessage('기능 템플릿을 삭제했습니다.');
      await loadTemplates();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '기능 템플릿 삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleModeration = async (action: 'BLIND' | 'DELETE') => {
    if (!selectedTemplate || !confirm(`${action} 제재를 적용할까요?`)) {
      return;
    }

    setError('');

    try {
      await adminService.moderateContent({
        targetType: 'TEMPLATE',
        targetId: selectedTemplate.id,
        action,
        adminMemo,
      });
      setMessage('콘텐츠 제재를 적용했습니다.');
    } catch (moderationError) {
      setError(moderationError instanceof Error ? moderationError.message : '콘텐츠 제재에 실패했습니다.');
    }
  };

  const updateRequirement = <TKey extends keyof AdminTemplateRequirement>(
    index: number,
    key: TKey,
    value: AdminTemplateRequirement[TKey],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      requirements: currentForm.requirements.map((requirement, requirementIndex) =>
        requirementIndex === index ? { ...requirement, [key]: value } : requirement,
      ),
    }));
  };

  const deleteRequirement = (index: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      requirements: currentForm.requirements.filter((_, requirementIndex) => requirementIndex !== index),
    }));
  };

  const updateTemplateMission = <TKey extends keyof AdminTemplateMissionDraft>(
    index: number,
    key: TKey,
    value: AdminTemplateMissionDraft[TKey],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      missions: currentForm.missions.map((mission, missionIndex) =>
        missionIndex === index ? { ...mission, [key]: value } : mission,
      ),
    }));
  };

  const updateTemplateMissionSteps = (index: number, value: string) => {
    updateTemplateMission(index, 'steps', value.split(/\r?\n/g));
  };

  const updateTemplateMissionTargetFilePath = (index: number, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      missions: currentForm.missions.map((mission, missionIndex) => {
        if (missionIndex !== index) return mission;

        const nextValidationJson = { ...getMissionValidationJson(mission) };
        const nextFilePath = value.trim();

        if (nextFilePath) {
          nextValidationJson.filePath = nextFilePath;
        } else {
          delete nextValidationJson.filePath;
        }

        return {
          ...mission,
          validationJson: nextValidationJson,
        };
      }),
    }));
  };

  const updateTemplateMissionValidationField = (index: number, key: string, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      missions: currentForm.missions.map((mission, missionIndex) =>
        missionIndex === index
          ? { ...mission, validationJson: buildMissionValidationJsonWithField(mission, key, value) }
          : mission,
      ),
    }));
  };

  const updateTemplateMissionValidationArrayField = (index: number, key: string, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      missions: currentForm.missions.map((mission, missionIndex) =>
        missionIndex === index
          ? { ...mission, validationJson: buildMissionValidationJsonWithArrayField(mission, key, value) }
          : mission,
      ),
    }));
  };

  const applyTemplateMissionProjectValidation = (index: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      missions: currentForm.missions.map((mission, missionIndex) =>
        missionIndex === index
          ? { ...mission, validationJson: buildMissionProjectValidationJson(mission) }
          : mission,
      ),
    }));
  };

  const updateTemplateMissionTestCase = (
    missionIndex: number,
    testCaseIndex: number,
    key: keyof MissionTestCaseDraft,
    value: string,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      missions: currentForm.missions.map((mission, index) => {
        if (index !== missionIndex) return mission;

        const testCases = getMissionTestCases(mission);
        const nextTestCases = testCases.map((testCase, currentTestCaseIndex) =>
          currentTestCaseIndex === testCaseIndex ? { ...testCase, [key]: value } : testCase,
        );

        return {
          ...mission,
          validationJson: buildMissionValidationJsonWithTestCases(mission, nextTestCases),
        };
      }),
    }));
  };

  const addTemplateMissionTestCase = (missionIndex: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      missions: currentForm.missions.map((mission, index) => {
        if (index !== missionIndex) return mission;

        return {
          ...mission,
          validationJson: buildMissionValidationJsonWithTestCases(mission, [
            ...getMissionTestCases(mission),
            { input: '', expectedOutput: '' },
          ]),
        };
      }),
    }));
  };

  const deleteTemplateMissionTestCase = (missionIndex: number, testCaseIndex: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      missions: currentForm.missions.map((mission, index) => {
        if (index !== missionIndex) return mission;

        return {
          ...mission,
          validationJson: buildMissionValidationJsonWithTestCases(
            mission,
            getMissionTestCases(mission).filter((_, currentTestCaseIndex) => currentTestCaseIndex !== testCaseIndex),
          ),
        };
      }),
    }));
  };

  const deleteTemplateMission = (index: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      missions: currentForm.missions.filter((_, missionIndex) => missionIndex !== index),
    }));
  };

  const updateInterviewQuestion = <TKey extends keyof AdminTemplateInterviewQuestion>(
    index: number,
    key: TKey,
    value: AdminTemplateInterviewQuestion[TKey],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      interviewQuestions: currentForm.interviewQuestions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [key]: value } : question,
      ),
    }));
  };

  const deleteInterviewQuestion = (index: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      interviewQuestions: currentForm.interviewQuestions.filter((_, questionIndex) => questionIndex !== index),
    }));
  };

  const updateNextRecommendation = <TKey extends keyof AdminTemplateNextRecommendation>(
    index: number,
    key: TKey,
    value: AdminTemplateNextRecommendation[TKey],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      nextRecommendations: currentForm.nextRecommendations.map((recommendation, recommendationIndex) =>
        recommendationIndex === index ? { ...recommendation, [key]: value } : recommendation,
      ),
    }));
  };

  const deleteNextRecommendation = (index: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      nextRecommendations: currentForm.nextRecommendations.filter((_, recommendationIndex) => recommendationIndex !== index),
    }));
  };

  const updateTestCase = <TKey extends keyof AdminTemplateTestCase>(
    index: number,
    key: TKey,
    value: AdminTemplateTestCase[TKey],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      testCases: currentForm.testCases.map((testCase, testCaseIndex) =>
        testCaseIndex === index ? { ...testCase, [key]: value } : testCase,
      ),
    }));
  };

  const deleteTestCase = (index: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      testCases: currentForm.testCases.filter((_, testCaseIndex) => testCaseIndex !== index),
    }));
  };

  const practiceFiles = selectedTemplate?.practiceFiles ?? [];

  const selectPracticeFile = (file: PracticeFile) => {
    setSelectedPracticeFileId(file.id);
    setPracticeFileForm(buildPracticeFileForm(file));
  };

  const resetPracticeFileForm = () => {
    const nextOrderIndex = buildNextOrderIndex(practiceFiles);

    setSelectedPracticeFileId(null);
    setPracticeFileForm({
      ...emptyPracticeFileForm,
      orderIndex: nextOrderIndex,
    });
  };

  const savePracticeFile = async () => {
    if (!selectedTemplate) {
      return;
    }

    setError('');
    setMessage('');

    try {
      const payload = {
        ...practiceFileForm,
        filePath: buildNormalizedPath(practiceFileForm.filePath),
      };

      if (!payload.filePath) {
        throw new Error('파일 경로를 입력해주세요.');
      }

      if (selectedPracticeFileId) {
        await adminService.updatePracticeFile(selectedTemplate.id, selectedPracticeFileId, payload);
      } else {
        await adminService.createPracticeFile(selectedTemplate.id, payload);
      }

      const refreshed = await fetchMergedTemplateDetail(selectedTemplate.id);
      setSelectedTemplate(refreshed);
      setSelectedPracticeFileId(refreshed.practiceFiles?.[0]?.id ?? null);
      setPracticeFileForm(refreshed.practiceFiles?.[0] ? buildPracticeFileForm(refreshed.practiceFiles[0]) : emptyPracticeFileForm);
      setMessage('실습 파일을 저장했습니다.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '실습 파일 저장에 실패했습니다.');
    }
  };

  const deletePracticeFile = async () => {
    if (!selectedTemplate || !selectedPracticeFileId || !confirm('선택한 실습 파일을 삭제할까요?')) {
      return;
    }

    try {
      await adminService.deletePracticeFile(selectedTemplate.id, selectedPracticeFileId);
      const refreshed = await fetchMergedTemplateDetail(selectedTemplate.id);
      setSelectedTemplate(refreshed);
      setSelectedPracticeFileId(refreshed.practiceFiles?.[0]?.id ?? null);
      setPracticeFileForm(refreshed.practiceFiles?.[0] ? buildPracticeFileForm(refreshed.practiceFiles[0]) : emptyPracticeFileForm);
      setMessage('실습 파일을 삭제했습니다.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '실습 파일 삭제에 실패했습니다.');
    }
  };

  const currentPracticeFile = practiceFiles.find((file) => file.id === selectedPracticeFileId) ?? null;

  return (
    <div>
      <AdminPageTitle title="기능 템플릿 관리" description="기능 템플릿 본문, 실습 메타데이터, 공개 상태를 관리합니다." />

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.2fr)_minmax(32rem,1fr)]">
        <div className="space-y-4">
          <AdminCard>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_9rem_10rem_10rem_10rem_8rem_auto]">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="템플릿 검색"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="category"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as AdminDifficulty | '')}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">난이도 전체</option>
                {difficulties.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value as AdminVisibility | '')}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">공개 전체</option>
                {visibilities.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={accessLevel}
                onChange={(event) => setAccessLevel(event.target.value as AdminAccessLevel | '')}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">등급 전체</option>
                {accessLevels.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                value={ownerId}
                onChange={(event) => setOwnerId(event.target.value)}
                placeholder="ownerId"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white"
              >
                검색
              </button>
            </div>
          </AdminCard>

          <AdminError message={error} />
          {message && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <AdminCard>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">총 {formatNumber(templates?.totalElements ?? 0)}개</p>
              <div className="flex items-center gap-3">
                {isLoading && <p className="text-sm text-slate-500">불러오는 중</p>}
                <button
                  type="button"
                  onClick={handleNew}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  새 템플릿
                </button>
              </div>
            </div>

            {!templates?.content.length ? (
              <AdminEmpty message="기능 템플릿이 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-270 text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-3">템플릿</th>
                      <th className="py-3">분류</th>
                      <th className="py-3">노출</th>
                      <th className="py-3">등급</th>
                      <th className="py-3">소유자</th>
                      <th className="py-3">지표</th>
                      <th className="py-3">생성일</th>
                      <th className="py-3 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {templates.content.map((template) => (
                      <tr key={template.id} className="hover:bg-slate-50">
                        <td className="py-3">
                          <p className="font-semibold">{template.title}</p>
                          <p className="text-xs text-slate-500">{template.summary || `#${template.id}`}</p>
                        </td>
                        <td className="py-3">
                          {template.category} · {template.difficulty}
                        </td>
                        <td className="py-3">
                          <select
                            value={template.visibility}
                            onChange={(event) =>
                              void handleExposureChange(
                                template,
                                event.target.value as AdminVisibility,
                                template.accessLevel,
                              )
                            }
                            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs"
                          >
                            {visibilities.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3">
                          <select
                            value={template.accessLevel}
                            onChange={(event) =>
                              void handleExposureChange(
                                template,
                                template.visibility,
                                event.target.value as AdminAccessLevel,
                              )
                            }
                            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs"
                          >
                            {accessLevels.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3">
                          {template.ownerNickname}
                          <span className="ml-1 text-xs text-slate-400">({template.ownerId})</span>
                        </td>
                        <td className="py-3 text-xs text-slate-500">
                          조회 {formatNumber(template.viewCount)} · 즐겨찾기 {formatNumber(template.favoriteCount)}
                        </td>
                        <td className="py-3">{formatDateTime(template.createdAt)}</td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/templates/${template.id}/practice`}
                              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                            >
                              실습
                            </Link>
                            <button
                              type="button"
                              onClick={() => void handleSelect(template.id)}
                              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(template)}
                              className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <AdminPagination page={page} totalPages={templates?.totalPages ?? 1} onPageChange={setPage} />
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {formMode === 'create' ? '기능 템플릿 생성' : '기능 템플릿 수정'}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedTemplate ? `#${selectedTemplate.id} · ${formatDateTime(selectedTemplate.updatedAt)}` : '새 템플릿'}
                </p>
              </div>
              {selectedTemplate && (
                <Link
                  href={`/admin/templates/${selectedTemplate.id}/practice`}
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  실습 관리
                </Link>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  제목
                  <input
                    value={form.title}
                    onChange={(event) => updateForm('title', event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  요약
                  <input
                    value={form.summary}
                    onChange={(event) => updateForm('summary', event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  카테고리
                  <input
                    value={form.category}
                    onChange={(event) => updateForm('category', event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  난이도
                  <select
                    value={form.difficulty}
                    onChange={(event) => updateForm('difficulty', event.target.value as AdminDifficulty)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    {difficulties.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  런타임
                  <select
                    value={form.runtime}
                    onChange={(event) => updateForm('runtime', event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    {runtimes.map((runtime) => (
                      <option key={runtime} value={runtime}>
                        {runtime}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  태그
                  <input
                    value={form.tagsText}
                    onChange={(event) => updateForm('tagsText', event.target.value)}
                    placeholder="auth, jwt, backend"
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  공개 상태
                  <select
                    value={form.visibility}
                    onChange={(event) => updateForm('visibility', event.target.value as AdminVisibility)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    {visibilities.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  접근 등급
                  <select
                    value={form.accessLevel}
                    onChange={(event) => updateForm('accessLevel', event.target.value as AdminAccessLevel)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    {accessLevels.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(event) => updateForm('published', event.target.checked)}
                  />
                  published
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  미리보기 이미지 URL
                  <input
                    value={form.previewImage}
                    onChange={(event) => updateForm('previewImage', event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  라이선스
                  <input
                    value={form.license}
                    onChange={(event) => updateForm('license', event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                  기술 스택
                  <textarea
                    value={form.techStacksText}
                    onChange={(event) => updateForm('techStacksText', event.target.value)}
                    placeholder="Spring, JWT, Redis"
                    rows={3}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                  상세설명
                  <textarea
                    value={form.description}
                    onChange={(event) => updateForm('description', event.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                  설계 의도
                  <textarea
                    value={form.designIntent}
                    onChange={(event) => updateForm('designIntent', event.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <div className="md:col-span-2 text-sm font-semibold text-slate-700">
                  흐름/구조
                  <textarea
                    value={form.structure}
                    onChange={(event) => updateForm('structure', event.target.value)}
                    rows={9}
                    placeholder="JSON 구조를 입력하면 사용자 화면에서 처리 흐름/계층별 역할 카드로 표시됩니다."
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
                  />
                  <p className="mt-1 text-xs font-normal text-slate-500">
                    기존 마크다운도 그대로 사용할 수 있고, JSON이면 AI 기능 템플릿처럼 구조화해서 표시됩니다.
                  </p>
                </div>
                <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                  소스코드
                  <textarea
                    value={form.source}
                    onChange={(event) => updateForm('source', event.target.value)}
                    placeholder="소스코드 또는 참고 코드"
                    rows={8}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  ERD
                  <textarea
                    value={form.erd}
                    onChange={(event) => updateForm('erd', event.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <AdminApiSpecEditor value={form.apiSpec} onChange={(value) => updateForm('apiSpec', value)} />

              <section className="rounded-md border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-950">요구사항</h4>
                    <p className="mt-1 text-xs text-slate-500">입력값, 처리 조건, 성공/실패 결과를 사용자 화면에서 카드로 표시합니다.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((currentForm) => ({
                          ...currentForm,
                          requirements: [...currentForm.requirements, createRequirement()],
                        }))
                      }
                      className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                    >
                      추가
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {form.requirements.map((requirement, index) => (
                    <div key={index} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-[6rem_10rem_8rem_6rem_auto]">
                        <input
                          value={requirement.id ?? ''}
                          onChange={(event) => updateRequirement(index, 'id', event.target.value)}
                          placeholder="R-001"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                        <input
                          value={requirement.type}
                          onChange={(event) => updateRequirement(index, 'type', event.target.value)}
                          placeholder="type"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                        <input
                          value={requirement.priority ?? ''}
                          onChange={(event) => updateRequirement(index, 'priority', event.target.value)}
                          placeholder="HIGH"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                        <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm">
                          <input
                            type="checkbox"
                            checked={requirement.optionalFlag}
                            onChange={(event) => updateRequirement(index, 'optionalFlag', event.target.checked)}
                          />
                          선택
                        </label>
                        <button
                          type="button"
                          onClick={() => deleteRequirement(index)}
                          className="rounded-md border border-rose-300 px-3 text-xs font-semibold text-rose-700"
                        >
                          삭제
                        </button>
                      </div>
                      <textarea
                        value={requirement.description}
                        onChange={(event) => updateRequirement(index, 'description', event.target.value)}
                        placeholder="요구사항 설명"
                        rows={2}
                        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                        <input
                          value={requirement.inputValue ?? ''}
                          onChange={(event) => updateRequirement(index, 'inputValue', event.target.value)}
                          placeholder="입력값"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                        <input
                          value={requirement.condition ?? ''}
                          onChange={(event) => updateRequirement(index, 'condition', event.target.value)}
                          placeholder="처리 조건"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                        <input
                          value={requirement.successResult ?? ''}
                          onChange={(event) => updateRequirement(index, 'successResult', event.target.value)}
                          placeholder="성공 결과"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                        <input
                          value={requirement.failureResult ?? ''}
                          onChange={(event) => updateRequirement(index, 'failureResult', event.target.value)}
                          placeholder="실패 결과"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-950">미션</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        missions: [...currentForm.missions, createTemplateMission()],
                      }))
                    }
                    className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                  >
                    추가
                  </button>
                </div>
                <div className="mb-3 rounded-md border border-indigo-100 bg-indigo-50 p-3 text-xs leading-5 text-slate-600">
                  <p className="font-semibold text-slate-950">미션은 실제 구현 능력 향상을 위한 실전형 학습입니다.</p>
                  <p className="mt-1">권장 타입: CONCEPT, IMPLEMENTATION, REVIEW · 형태: 기능 구현 / 종합 응용 / 완료 조건 기반 제출</p>
                </div>
                <div className="space-y-3">
                  {form.missions.map((mission, index) => checkProblemMissionType(getTemplateMissionType(mission)) ? null : (
                    <div key={index} className="rounded-md bg-slate-50 p-3">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-[6rem_minmax(0,1fr)_8rem_auto]">
                        <input
                          value={mission.id}
                          onChange={(event) => updateTemplateMission(index, 'id', event.target.value)}
                          placeholder="id"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                        <input
                          value={mission.title}
                          onChange={(event) => updateTemplateMission(index, 'title', event.target.value)}
                          placeholder="미션 제목"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                        <select
                          value={getTemplateMissionType(mission) ?? 'CONCEPT'}
                          onChange={(event) => updateTemplateMission(index, 'missionType', event.target.value as PracticeMissionType)}
                          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                        >
                          {missionTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => deleteTemplateMission(index)}
                          className="rounded-md border border-rose-300 px-3 text-xs font-semibold text-rose-700"
                        >
                          삭제
                        </button>
                      </div>
                      <input
                        value={mission.description ?? ''}
                        onChange={(event) => updateTemplateMission(index, 'description', event.target.value)}
                        placeholder="미션 설명"
                        className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                      />
                      <input
                        value={getMissionTargetFilePath(mission)}
                        onChange={(event) => updateTemplateMissionTargetFilePath(index, event.target.value)}
                        placeholder="연결 파일 경로 예: src/main/java/com/cobip/auth/service/AuthService.java"
                        className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                      />
                      <textarea
                        value={(mission.steps ?? []).join('\n')}
                        onChange={(event) => updateTemplateMissionSteps(index, event.target.value)}
                        placeholder="완료 조건 또는 구현 단계 (한 줄씩)"
                        rows={4}
                        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <div className="mt-2 rounded-md border border-violet-100 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-950">미션 표시 정보</p>
                        <p className="mt-1 text-xs text-slate-500">사용자 화면에서 구현 요구사항과 완료 조건 카드로 표시됩니다.</p>
                        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                          <input
                            value={getMissionValidationStringField(mission, 'difficulty')}
                            onChange={(event) => updateTemplateMissionValidationField(index, 'difficulty', event.target.value)}
                            placeholder="난이도 예: intermediate"
                            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                          />
                          <input
                            value={getMissionValidationStringField(mission, 'questionType')}
                            onChange={(event) => updateTemplateMissionValidationField(index, 'questionType', event.target.value)}
                            placeholder="표시 유형 예: implementation"
                            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                          />
                          <textarea
                            value={getMissionValidationStringArrayField(mission, 'requirements')}
                            onChange={(event) => updateTemplateMissionValidationArrayField(index, 'requirements', event.target.value)}
                            placeholder="구현 요구사항 (한 줄씩)"
                            rows={3}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                          />
                          <textarea
                            value={getMissionValidationStringArrayField(mission, 'successCriteria')}
                            onChange={(event) => updateTemplateMissionValidationArrayField(index, 'successCriteria', event.target.value)}
                            placeholder="완료 조건 (한 줄씩)"
                            rows={3}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-slate-700">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-950">프로젝트 채점 설정</p>
                            <p className="mt-1 text-xs text-slate-500">
                              실제 구현 미션은 Gradle 테스트 명령처럼 프로젝트 단위 채점을 권장합니다.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => applyTemplateMissionProjectValidation(index)}
                            className="rounded-md border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700"
                          >
                            프로젝트 채점 기본값
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <input
                            value={getMissionValidationStringField(mission, 'dockerImage')}
                            onChange={(event) => updateTemplateMissionValidationField(index, 'dockerImage', event.target.value)}
                            placeholder="dockerImage 예: gradle:8.14-jdk21"
                            className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                          />
                          <input
                            value={getMissionValidationStringField(mission, 'testCommand')}
                            onChange={(event) => updateTemplateMissionValidationField(index, 'testCommand', event.target.value)}
                            placeholder="testCommand 예: gradle test --no-daemon"
                            className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                        <input
                          value={String(getMissionValidationJson(mission).timeLimitMillis ?? '')}
                          onChange={(event) => updateTemplateMissionValidationField(index, 'timeLimitMillis', event.target.value)}
                          placeholder="timeLimitMillis: 120000"
                          className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                        />
                        <input
                          value={String(getMissionValidationJson(mission).memoryLimitMb ?? '')}
                          onChange={(event) => updateTemplateMissionValidationField(index, 'memoryLimitMb', event.target.value)}
                          placeholder="memoryLimitMb: 512"
                          className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                        />
                      </div>
                      <div className="mt-2 rounded-md border border-violet-100 bg-violet-50 p-3 text-sm text-slate-700">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-950">단일 출력 채점 케이스</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Main.java처럼 단일 파일 출력 비교가 필요한 경우에만 사용하세요.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addTemplateMissionTestCase(index)}
                            className="rounded-md border border-violet-300 bg-white px-3 py-2 text-xs font-semibold text-violet-700"
                          >
                            케이스 추가
                          </button>
                        </div>
                        <div className="mt-3 space-y-2">
                          {getMissionTestCases(mission).length > 0 ? (
                            getMissionTestCases(mission).map((testCase, testCaseIndex) => (
                              <div key={`mission-${index}-case-${testCaseIndex}`} className="rounded-md bg-white p-2">
                                <div className="mb-2 flex items-center justify-between">
                                  <p className="font-mono text-xs font-semibold text-violet-700">case {testCaseIndex + 1}</p>
                                  <button
                                    type="button"
                                    onClick={() => deleteTemplateMissionTestCase(index, testCaseIndex)}
                                    className="text-xs font-semibold text-rose-600"
                                  >
                                    삭제
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                  <textarea
                                    value={testCase.input}
                                    onChange={(event) => updateTemplateMissionTestCase(index, testCaseIndex, 'input', event.target.value)}
                                    placeholder="input"
                                    rows={3}
                                    className="rounded-md border border-slate-200 px-2 py-1 font-mono text-xs"
                                  />
                                  <textarea
                                    value={testCase.expectedOutput}
                                    onChange={(event) => updateTemplateMissionTestCase(index, testCaseIndex, 'expectedOutput', event.target.value)}
                                    placeholder="expectedOutput"
                                    rows={3}
                                    className="rounded-md border border-slate-200 px-2 py-1 font-mono text-xs"
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500">채점하지 않는 설명형 미션이면 비워둬도 됩니다.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-950">문제</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        missions: [...currentForm.missions, createTemplateProblem()],
                      }))
                    }
                    className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                  >
                    추가
                  </button>
                </div>
                <div className="mb-3 rounded-md border border-violet-100 bg-violet-50 p-3 text-xs leading-5 text-slate-600">
                  <p className="font-semibold text-slate-950">문제는 개념 이해도 점검을 위한 빠른 반복 학습입니다.</p>
                  <p className="mt-1">권장 타입: TEST, DEBUGGING · 형태: 객관식 / 빈칸 / 단답형 / 짧은 검증 과제</p>
                </div>
                <div className="space-y-3">
                  {form.missions.map((mission, index) => !checkProblemMissionType(getTemplateMissionType(mission)) ? null : (
                    <div key={index} className="rounded-md bg-slate-50 p-3">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-[6rem_minmax(0,1fr)_8rem_auto]">
                        <input
                          value={mission.id}
                          onChange={(event) => updateTemplateMission(index, 'id', event.target.value)}
                          placeholder="id"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                        <input
                          value={mission.title}
                          onChange={(event) => updateTemplateMission(index, 'title', event.target.value)}
                          placeholder="문제 제목"
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                        <select
                          value={getTemplateMissionType(mission) ?? 'TEST'}
                          onChange={(event) => updateTemplateMission(index, 'missionType', event.target.value as PracticeMissionType)}
                          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                        >
                          {problemMissionTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => deleteTemplateMission(index)}
                          className="rounded-md border border-rose-300 px-3 text-xs font-semibold text-rose-700"
                        >
                          삭제
                        </button>
                      </div>
                      <input
                        value={mission.description ?? ''}
                        onChange={(event) => updateTemplateMission(index, 'description', event.target.value)}
                        placeholder="문제 설명"
                        className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                      />
                      <input
                        value={getMissionTargetFilePath(mission)}
                        onChange={(event) => updateTemplateMissionTargetFilePath(index, event.target.value)}
                        placeholder="연결 파일 경로 예: src/main/java/com/cobip/auth/controller/AuthController.java"
                        className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                      />
                      <textarea
                        value={(mission.steps ?? []).join('\n')}
                        onChange={(event) => updateTemplateMissionSteps(index, event.target.value)}
                        placeholder="풀이 단계 또는 검증 가이드 (한 줄씩)"
                        rows={4}
                        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <div className="mt-2 rounded-md border border-violet-100 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-950">문제 표시 정보</p>
                        <p className="mt-1 text-xs text-slate-500">사용자 화면에서 객관식, 빈칸, 단답형 문제처럼 표시됩니다.</p>
                        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                          <select
                            value={getMissionValidationStringField(mission, 'questionType') || 'short_answer'}
                            onChange={(event) => updateTemplateMissionValidationField(index, 'questionType', event.target.value)}
                            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                          >
                            <option value="short_answer">short_answer · 단답형</option>
                            <option value="multiple_choice">multiple_choice · 객관식</option>
                            <option value="fill_blank">fill_blank · 빈칸</option>
                          </select>
                          <input
                            value={getMissionValidationStringField(mission, 'difficulty')}
                            onChange={(event) => updateTemplateMissionValidationField(index, 'difficulty', event.target.value)}
                            placeholder="난이도 예: intermediate"
                            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                          />
                          <textarea
                            value={getMissionValidationStringArrayField(mission, 'choices')}
                            onChange={(event) => updateTemplateMissionValidationArrayField(index, 'choices', event.target.value)}
                            placeholder="객관식 선택지 (한 줄씩)"
                            rows={4}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                          />
                          <div className="space-y-2">
                            <input
                              value={getMissionValidationStringField(mission, 'answer')}
                              onChange={(event) => updateTemplateMissionValidationField(index, 'answer', event.target.value)}
                              placeholder="정답 또는 모범 답안"
                              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                            />
                            <textarea
                              value={getMissionValidationStringField(mission, 'explanation')}
                              onChange={(event) => updateTemplateMissionValidationField(index, 'explanation', event.target.value)}
                              placeholder="풀이 힌트 또는 해설"
                              rows={2}
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-slate-700">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-950">프로젝트 채점 설정</p>
                            <p className="mt-1 text-xs text-slate-500">
                              빈칸, 단답형처럼 짧은 문제는 단일 출력 케이스를, 파일 수정 문제는 Gradle 테스트 명령을 사용하세요.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => applyTemplateMissionProjectValidation(index)}
                            className="rounded-md border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700"
                          >
                            프로젝트 채점 기본값
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <input
                            value={getMissionValidationStringField(mission, 'dockerImage')}
                            onChange={(event) => updateTemplateMissionValidationField(index, 'dockerImage', event.target.value)}
                            placeholder="dockerImage 예: gradle:8.14-jdk21"
                            className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                          />
                          <input
                            value={getMissionValidationStringField(mission, 'testCommand')}
                            onChange={(event) => updateTemplateMissionValidationField(index, 'testCommand', event.target.value)}
                            placeholder="testCommand 예: gradle test --no-daemon"
                            className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                        <input
                          value={String(getMissionValidationJson(mission).timeLimitMillis ?? '')}
                          onChange={(event) => updateTemplateMissionValidationField(index, 'timeLimitMillis', event.target.value)}
                          placeholder="timeLimitMillis: 120000"
                          className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                        />
                        <input
                          value={String(getMissionValidationJson(mission).memoryLimitMb ?? '')}
                          onChange={(event) => updateTemplateMissionValidationField(index, 'memoryLimitMb', event.target.value)}
                          placeholder="memoryLimitMb: 512"
                          className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                        />
                      </div>
                      <div className="mt-2 rounded-md border border-violet-100 bg-violet-50 p-3 text-sm text-slate-700">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-950">단일 출력 채점 케이스</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Main.java처럼 단일 파일 출력 비교가 필요한 경우에만 사용하세요.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addTemplateMissionTestCase(index)}
                            className="rounded-md border border-violet-300 bg-white px-3 py-2 text-xs font-semibold text-violet-700"
                          >
                            케이스 추가
                          </button>
                        </div>
                        <div className="mt-3 space-y-2">
                          {getMissionTestCases(mission).length > 0 ? (
                            getMissionTestCases(mission).map((testCase, testCaseIndex) => (
                              <div key={`problem-${index}-case-${testCaseIndex}`} className="rounded-md bg-white p-2">
                                <div className="mb-2 flex items-center justify-between">
                                  <p className="font-mono text-xs font-semibold text-violet-700">case {testCaseIndex + 1}</p>
                                  <button
                                    type="button"
                                    onClick={() => deleteTemplateMissionTestCase(index, testCaseIndex)}
                                    className="text-xs font-semibold text-rose-600"
                                  >
                                    삭제
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                  <textarea
                                    value={testCase.input}
                                    onChange={(event) => updateTemplateMissionTestCase(index, testCaseIndex, 'input', event.target.value)}
                                    placeholder="input"
                                    rows={3}
                                    className="rounded-md border border-slate-200 px-2 py-1 font-mono text-xs"
                                  />
                                  <textarea
                                    value={testCase.expectedOutput}
                                    onChange={(event) => updateTemplateMissionTestCase(index, testCaseIndex, 'expectedOutput', event.target.value)}
                                    placeholder="expectedOutput"
                                    rows={3}
                                    className="rounded-md border border-slate-200 px-2 py-1 font-mono text-xs"
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500">
                              아직 채점 케이스가 없습니다. 케이스를 추가한 뒤 input과 expectedOutput을 입력하세요.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-950">테스트케이스</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        testCases: [...currentForm.testCases, createTestCase()],
                      }))
                    }
                    className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                  >
                    추가
                  </button>
                </div>
                <div className="space-y-2">
                  {form.testCases.map((testCase, index) => (
                    <div key={index} className="rounded-md bg-slate-50 p-3">
                      <div className="mb-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => deleteTestCase(index)}
                          className="rounded-md border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700"
                        >
                          삭제
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <textarea
                          value={testCase.input}
                          onChange={(event) => updateTestCase(index, 'input', event.target.value)}
                          placeholder="문제 입력"
                          rows={4}
                          className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
                        />
                        <textarea
                          value={testCase.expectedOutput ?? testCase.expected_output ?? ''}
                          onChange={(event) => updateTestCase(index, 'expectedOutput', event.target.value)}
                          placeholder="기대 출력"
                          rows={4}
                          className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
                        />
                        <textarea
                          value={testCase.description ?? ''}
                          onChange={(event) => updateTestCase(index, 'description', event.target.value)}
                          placeholder="문제 설명"
                          rows={4}
                          className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-950">핵심 질문</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        interviewQuestions: [...currentForm.interviewQuestions, createInterviewQuestion()],
                      }))
                    }
                    className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                  >
                    추가
                  </button>
                </div>
                <div className="space-y-3">
                  {form.interviewQuestions.map((question, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                      <input
                        value={question.question}
                        onChange={(event) => updateInterviewQuestion(index, 'question', event.target.value)}
                        placeholder="핵심 질문"
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                      />
                      <input
                        value={question.answerHint}
                        onChange={(event) => updateInterviewQuestion(index, 'answerHint', event.target.value)}
                        placeholder="모범 답안 예시"
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => deleteInterviewQuestion(index)}
                        className="rounded-md border border-rose-300 px-3 text-xs font-semibold text-rose-700"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-950">다음 추천</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      사용자 템플릿의 다음 추천 탭에 표시할 연계 학습입니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        nextRecommendations: [...currentForm.nextRecommendations, createNextRecommendation()],
                      }))
                    }
                    className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                  >
                    추가
                  </button>
                </div>
                <div className="space-y-3">
                  {form.nextRecommendations.length === 0 ? (
                    <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
                      아직 입력된 다음 추천이 없습니다.
                    </p>
                  ) : (
                    form.nextRecommendations.map((recommendation, index) => (
                      <div key={index} className="rounded-md border border-slate-200 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-violet-700">recommendation {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => deleteNextRecommendation(index)}
                            className="rounded-md border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700"
                          >
                            삭제
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-[96px_minmax(0,1fr)]">
                          <input
                            type="number"
                            min={1}
                            value={recommendation.priority}
                            onChange={(event) =>
                              updateNextRecommendation(index, 'priority', Number(event.target.value) || index + 1)
                            }
                            placeholder="우선순위"
                            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                          />
                          <input
                            value={recommendation.featureName}
                            onChange={(event) => updateNextRecommendation(index, 'featureName', event.target.value)}
                            placeholder="추천 기능명 예: OAuth 소셜 로그인"
                            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                          />
                          <textarea
                            value={recommendation.reason}
                            onChange={(event) => updateNextRecommendation(index, 'reason', event.target.value)}
                            placeholder="추천 이유"
                            rows={3}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                          />
                          <textarea
                            value={recommendation.expectedLearning}
                            onChange={(event) => updateNextRecommendation(index, 'expectedLearning', event.target.value)}
                            placeholder="기대 학습 예: 외부 인증 제공자 연동 흐름과 계정 연결 전략을 학습합니다."
                            rows={3}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {formMode === 'create' ? '생성' : '수정'}
                </button>
                <button
                  type="button"
                  onClick={handleNew}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  새로 작성
                </button>
                {selectedTemplate && (
                  <button
                    type="button"
                    onClick={() => void handleDelete(selectedTemplate)}
                    className="ml-auto rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
                  >
                    삭제
                  </button>
                )}
              </div>
            </form>
          </AdminCard>

          <AdminCard>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">전체 소스코드</h3>
                <p className="text-sm text-slate-500">이 섹션의 파일들이 사용자 템플릿 화면에서 그대로 탭으로 보입니다.</p>
              </div>
              {selectedTemplate && (
                <button
                  type="button"
                  onClick={resetPracticeFileForm}
                  className="rounded-md border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700"
                >
                  새 파일
                </button>
              )}
            </div>

            {!selectedTemplate ? (
              <AdminEmpty message="템플릿을 먼저 선택하거나 저장해야 실습 파일을 편집할 수 있습니다." />
            ) : practiceFiles.length > 0 ? (
              <div className="space-y-4">
                <SourceCodeSection
                  files={practiceFiles}
                  isDarkMode={false}
                  onOpenEditor={(filePath) => {
                    const file = practiceFiles.find((practiceFile) => practiceFile.filePath === filePath);

                    if (file) {
                      selectPracticeFile(file);
                    }
                  }}
                />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    value={practiceFileForm.filePath}
                    onChange={(event) =>
                      setPracticeFileForm((current) => ({
                        ...current,
                        filePath: event.target.value,
                        language: current.readOnly ? current.language : findLanguageByPath(event.target.value),
                      }))
                    }
                    placeholder="src/app/page.tsx"
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                  />
                  <input
                    value={practiceFileForm.language}
                    onChange={(event) => setPracticeFileForm((current) => ({ ...current, language: event.target.value }))}
                    placeholder="typescript"
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                  />
                  <input
                    type="number"
                    value={practiceFileForm.orderIndex}
                    onChange={(event) =>
                      setPracticeFileForm((current) => ({ ...current, orderIndex: Number(event.target.value) }))
                    }
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                  />
                  <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm">
                    <input
                      type="checkbox"
                      checked={practiceFileForm.readOnly}
                      onChange={(event) =>
                        setPracticeFileForm((current) => ({
                          ...current,
                          readOnly: event.target.checked,
                        }))
                      }
                    />
                    읽기 전용
                  </label>
                  <div className="md:col-span-2">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">코드 내용</span>
                      <span className="text-xs text-slate-500">빈 파일도 바로 입력할 수 있습니다.</span>
                    </div>
                    <div className="h-[34rem] overflow-hidden rounded-md border border-slate-300">
                    <CodeEditor
                      fileName={practiceFileForm.filePath || 'new-file'}
                      code={practiceFileForm.content}
                      onCodeChange={(content) => setPracticeFileForm((current) => ({ ...current, content }))}
                      fileTabs={practiceFiles.map((file) => file.filePath)}
                      activeFile={practiceFileForm.filePath || currentPracticeFile?.filePath}
                      onFileSelect={(filePath) => {
                        const file = practiceFiles.find((practiceFile) => practiceFile.filePath === filePath);

                        if (file) {
                          selectPracticeFile(file);
                        }
                      }}
                      hasContent
                      showRunner={false}
                    />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void savePracticeFile()}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    파일 저장
                  </button>
                  {selectedPracticeFileId && (
                    <button
                      type="button"
                      onClick={() => void deletePracticeFile()}
                      className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
                    >
                      파일 삭제
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <AdminEmpty message="등록된 실습 파일이 없습니다. 아래에서 첫 파일을 추가하세요." />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    value={practiceFileForm.filePath}
                    onChange={(event) =>
                      setPracticeFileForm((current) => ({
                        ...current,
                        filePath: event.target.value,
                        language: findLanguageByPath(event.target.value),
                      }))
                    }
                    placeholder="src/app/page.tsx"
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                  />
                  <input
                    value={practiceFileForm.language}
                    onChange={(event) => setPracticeFileForm((current) => ({ ...current, language: event.target.value }))}
                    placeholder="typescript"
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                  />
                  <input
                    type="number"
                    value={practiceFileForm.orderIndex}
                    onChange={(event) =>
                      setPracticeFileForm((current) => ({ ...current, orderIndex: Number(event.target.value) }))
                    }
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                  />
                  <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm">
                    <input
                      type="checkbox"
                      checked={practiceFileForm.readOnly}
                      onChange={(event) =>
                        setPracticeFileForm((current) => ({
                          ...current,
                          readOnly: event.target.checked,
                        }))
                      }
                    />
                    읽기 전용
                  </label>
                  <div className="md:col-span-2">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">코드 내용</span>
                      <span className="text-xs text-slate-500">파일 경로를 입력한 뒤 코드를 작성하세요.</span>
                    </div>
                    <div className="h-[34rem] overflow-hidden rounded-md border border-slate-300">
                    <CodeEditor
                      fileName={practiceFileForm.filePath || 'new-file'}
                      code={practiceFileForm.content}
                      onCodeChange={(content) => setPracticeFileForm((current) => ({ ...current, content }))}
                      fileTabs={[]}
                      activeFile={practiceFileForm.filePath}
                      onFileSelect={() => {}}
                      hasContent
                      showRunner={false}
                    />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void savePracticeFile()}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    파일 추가
                  </button>
                </div>
              </div>
            )}
          </AdminCard>

          {selectedTemplate && (
            <AdminCard>
              <h3 className="text-sm font-bold text-slate-950">콘텐츠 제재</h3>
              <textarea
                value={adminMemo}
                onChange={(event) => setAdminMemo(event.target.value)}
                placeholder="관리자 메모"
                rows={3}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleModeration('BLIND')}
                  className="rounded-md border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700"
                >
                  BLIND
                </button>
                <button
                  type="button"
                  onClick={() => void handleModeration('DELETE')}
                  className="rounded-md border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700"
                >
                  DELETE
                </button>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}
