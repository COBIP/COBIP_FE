import type { JSONContent } from '@tiptap/core';

export type AdminUserRole = 'USER' | 'ADMIN';
export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type AdminDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type AdminVisibility = 'PUBLIC' | 'PRIVATE';
export type AdminAccessLevel = 'FREE' | 'PREMIUM';
export type GrammarTemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type GrammarTemplateLanguage = 'JAVA' | 'PYTHON' | 'JAVASCRIPT';
export type GrammarTemplateMissionType = 'PROBLEM' | 'MISSION';
export type AdminReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';
export type AdminReportTargetType = 'TEMPLATE' | 'GRAMMAR_TEMPLATE' | 'COMMENT' | 'USER';
export type AdminModerationTargetType = 'TEMPLATE' | 'GRAMMAR_TEMPLATE';
export type AdminModerationAction = 'BLIND' | 'DELETE';
export type PracticeMissionType = 'CONCEPT' | 'IMPLEMENTATION' | 'DEBUGGING' | 'TEST' | 'REVIEW';

export interface ApiResponse<TData> {
  success: boolean;
  message?: string;
  data: TData;
}

export interface PageResponse<TItem> {
  content: TItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminOperationStatistics {
  userCount: number;
  activeSubscriptionCount: number;
  templateCount: number;
  publicTemplateCount: number;
  premiumTemplateCount: number;
  grammarTemplateCount: number;
  publishedGrammarTemplateCount: number;
  learningProgressCount: number;
  completedLearningProgressCount: number;
  totalSolvedCount: number;
  totalCorrectCount: number;
  totalStudySeconds: number;
  certificateCount: number;
  activityHistoryCount: number;
}

export interface AdminUserSummary {
  id: number;
  email: string;
  nickname: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminUserDetail = AdminUserSummary & {
  profileImageUrl?: string | null;
};

export interface AdminTemplateSummary {
  id: number;
  title: string;
  summary?: string;
  category: string;
  difficulty: AdminDifficulty;
  visibility: AdminVisibility;
  accessLevel: AdminAccessLevel;
  published?: boolean;
  viewCount: number;
  favoriteCount: number;
  ownerId: number;
  ownerNickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTemplateRequirement {
  id?: string;
  type: string;
  description: string;
  optionalFlag: boolean;
  priority?: string;
  inputValue?: string;
  condition?: string;
  successResult?: string;
  failureResult?: string;
}

export interface AdminTemplateMissionDraft {
  id: string | number;
  title: string;
  steps?: string[];
  description?: string;
  type?: PracticeMissionType;
  missionType?: PracticeMissionType;
  orderIndex?: number;
  guideContent?: string;
  validationJson?: Record<string, unknown> | null;
}

export interface AdminTemplateInterviewQuestion {
  question: string;
  answerHint: string;
}

export interface AdminTemplateTestCase {
  id?: number;
  input: string;
  expectedOutput?: string;
  expected_output?: string;
  description?: string;
  orderIndex?: number;
}

export interface AdminTemplateNextRecommendation {
  featureName: string;
  reason: string;
  expectedLearning: string;
  priority: number;
}

export interface AdminTemplateDetail extends AdminTemplateSummary {
  description?: string;
  techStacks?: string[];
  designIntent?: string;
  structure?: string;
  requirements?: AdminTemplateRequirement[];
  requirementsSpec?: string;
  missions?: AdminTemplateMissionDraft[];
  practiceFiles?: Array<PracticeFile & { path?: string; name?: string }>;
  erd?: string;
  apiSpec?: string;
  projectStructure?: string;
  interviewQuestions?: Array<string | AdminTemplateInterviewQuestion>;
  nextRecommendations?: AdminTemplateNextRecommendation[];
  runtime?: string;
  testCases?: AdminTemplateTestCase[];
  tags?: string[];
  previewImage?: string;
  license?: string;
  source?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
}

export interface AdminTemplateExposurePayload {
  visibility: AdminVisibility;
  accessLevel: AdminAccessLevel;
}

export interface AdminTemplatePayload {
  title: string;
  summary?: string;
  description: string;
  category: string;
  difficulty: AdminDifficulty;
  techStacks: string[];
  designIntent: string;
  structure?: string;
  requirements?: AdminTemplateRequirement[];
  requirementsSpec: string;
  missions?: AdminTemplateMissionDraft[];
  erd: string;
  apiSpec: string;
  projectStructure: string;
  interviewQuestions: AdminTemplateInterviewQuestion[];
  nextRecommendations?: AdminTemplateNextRecommendation[];
  runtime?: string;
  testCases?: AdminTemplateTestCase[];
  tags?: string[];
  previewImage?: string;
  visibility: AdminVisibility;
  accessLevel: AdminAccessLevel;
  published?: boolean;
  license?: string;
  source?: string;
}

export interface GrammarTemplateSummary {
  id: number;
  slug: string;
  title: string;
  language: GrammarTemplateLanguage;
  category: string;
  difficulty: AdminDifficulty;
  summary: string;
  status: GrammarTemplateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GrammarTemplateDetail extends GrammarTemplateSummary {
  contentJson: JSONContent;
  chapters?: GrammarTemplateChapter[];
  searchableText?: string;
  deletedAt?: string | null;
}

export interface GrammarTemplatePayload {
  slug: string;
  title: string;
  language: GrammarTemplateLanguage;
  category: string;
  difficulty: AdminDifficulty;
  summary: string;
  contentJson: JSONContent;
  status?: GrammarTemplateStatus;
}

export interface GrammarTemplateMediaUploadResponse {
  templateId: number;
  type: 'IMAGE' | 'VIDEO';
  fileKey: string;
  fileUrl: string;
  contentType: string;
}

export type GrammarTemplatePracticeFileNodeType = 'FILE' | 'FOLDER';

export interface GrammarTemplatePracticeFile {
  id: number;
  templateId: number;
  chapterId: number;
  nodeType: GrammarTemplatePracticeFileNodeType;
  filePath: string;
  language: string | null;
  content: string | null;
  readOnly: boolean;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GrammarTemplateChapterMission {
  id: number;
  templateId: number;
  chapterId: number;
  title: string;
  description?: string | null;
  missionType: GrammarTemplateMissionType;
  orderIndex: number;
  guideContent?: string | null;
  validationJson?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GrammarTemplateChapter {
  id: number;
  templateId: number;
  title: string;
  orderIndex: number;
  contentJson: JSONContent;
  practiceFiles?: GrammarTemplatePracticeFile[];
  missions?: GrammarTemplateChapterMission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GrammarTemplateChapterMissionPayload {
  title: string;
  description?: string;
  missionType: GrammarTemplateMissionType;
  orderIndex: number;
  guideContent?: string;
  validationJson?: Record<string, unknown>;
}

export interface GrammarTemplateChapterPayload {
  title: string;
  orderIndex: number;
  contentJson: JSONContent;
}

export interface GrammarTemplatePracticeFilePayload {
  nodeType: GrammarTemplatePracticeFileNodeType;
  filePath: string;
  language: string | null;
  content: string | null;
  readOnly: boolean;
  orderIndex: number;
}

export interface SubscriptionPlan {
  id: number;
  code: string;
  name: string;
  description: string;
  priceAmount: number;
  currency: string;
  durationDays: number;
  benefitDescription: string;
  visible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlanPayload = Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>;

export interface AdminReportSummary {
  id: number;
  reporterId: number;
  reporterEmail: string;
  reporterNickname: string;
  targetType: AdminReportTargetType;
  targetId: number;
  reason: string;
  status: AdminReportStatus;
  processedById?: number;
  processedByNickname?: string;
  processedAt?: string;
  createdAt: string;
}

export interface AdminReportDetail extends AdminReportSummary {
  description?: string;
  adminMemo?: string;
  updatedAt: string;
}

export interface AdminReportStatusPayload {
  status: AdminReportStatus;
  adminMemo?: string;
}

export interface AdminContentModerationPayload {
  targetType: AdminModerationTargetType;
  targetId: number;
  action: AdminModerationAction;
  adminMemo?: string;
}

export interface AdminContentModerationResponse extends AdminContentModerationPayload {
  resultStatus: string;
  moderatedById: number;
  moderatedByNickname: string;
  moderatedAt: string;
}

export interface AdminActivityHistory {
  id: number;
  userId: number;
  userEmail: string;
  userNickname: string;
  type: string;
  message: string;
  targetType?: string;
  targetId?: number;
  createdAt: string;
}

export interface PracticeFile {
  id: number;
  filePath: string;
  language: string;
  content: string;
  readOnly: boolean;
  orderIndex: number;
}

export interface PracticeMission {
  id: number;
  title: string;
  description?: string;
  guideContent?: string;
  type?: PracticeMissionType;
  missionType?: PracticeMissionType;
  validationJson: Record<string, unknown>;
  orderIndex: number;
}

export interface TemplatePractice {
  templateId: number;
  files: PracticeFile[];
  missions: PracticeMission[];
}

export type PracticeFilePayload = Omit<PracticeFile, 'id'>;
export type PracticeMissionPayload = Omit<PracticeMission, 'id'>;
