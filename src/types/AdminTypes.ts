import type { JSONContent } from '@tiptap/core';

export type AdminUserRole = 'USER' | 'ADMIN';
export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type AdminDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type AdminVisibility = 'PUBLIC' | 'PRIVATE';
export type AdminAccessLevel = 'FREE' | 'PREMIUM';
export type GrammarTemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type GrammarTemplateLanguage = 'JAVA' | 'PYTHON' | 'JAVASCRIPT';
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
  category: string;
  difficulty: AdminDifficulty;
  visibility: AdminVisibility;
  accessLevel: AdminAccessLevel;
  viewCount: number;
  favoriteCount: number;
  ownerId: number;
  ownerNickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTemplateDetail extends AdminTemplateSummary {
  description?: string;
  techStacks?: string[];
  fileUrl?: string;
  thumbnailUrl?: string;
}

export interface AdminTemplateExposurePayload {
  visibility: AdminVisibility;
  accessLevel: AdminAccessLevel;
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
