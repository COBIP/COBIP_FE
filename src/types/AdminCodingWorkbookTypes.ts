import type { CodingDifficulty } from '@/types/CodingWorkbookTypes';
import type { CodingLanguage } from '@/types/CodingProblemTypes';

export type CodingWorkbookStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CodingProblemStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface PageResponse<TItem> {
  content: TItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AdminCodingWorkbookSummary {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: CodingDifficulty;
  summary: string;
  status: CodingWorkbookStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCodingWorkbookDetail extends AdminCodingWorkbookSummary {
  description: string | null;
  problems: AdminCodingProblemSummary[];
}

export interface AdminCodingWorkbookPayload {
  slug: string;
  title: string;
  category: string;
  difficulty: CodingDifficulty;
  summary: string;
  description?: string;
  status: CodingWorkbookStatus;
  displayOrder: number;
}

export interface AdminCodingProblemSummary {
  id: number;
  workbookId: number;
  title: string;
  category: string;
  difficulty: CodingDifficulty;
  orderIndex: number;
  timeLimitMillis: number;
  memoryLimitMb: number;
  status: CodingProblemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCodingProblemTestCase {
  id?: number;
  input: string;
  expectedOutput: string;
  sample: boolean;
  orderIndex: number;
}

export interface AdminCodingProblemStarterCode {
  id?: number;
  language: CodingLanguage;
  code: string;
}

export interface TiptapTextDoc {
  type: 'doc';
  content: Array<{
    type: 'paragraph';
    content?: Array<{
      type: 'text';
      text: string;
    }>;
  }>;
}

export interface AdminCodingProblemPayload {
  title: string;
  category: string;
  difficulty: CodingDifficulty;
  contentJson: TiptapTextDoc;
  explanationJson?: TiptapTextDoc;
  orderIndex: number;
  timeLimitMillis: number;
  memoryLimitMb: number;
  status: CodingProblemStatus;
  testCases: AdminCodingProblemTestCase[];
  starterCodes: AdminCodingProblemStarterCode[];
}

export interface AdminCodingProblemDetail extends AdminCodingProblemSummary {
  contentJson: TiptapTextDoc;
  explanationJson: TiptapTextDoc | null;
  testCases: AdminCodingProblemTestCase[];
  starterCodes: AdminCodingProblemStarterCode[];
}

export interface AdminCodingWorkbookQuery {
  keyword?: string;
  category?: string;
  difficulty?: CodingDifficulty;
  status?: CodingWorkbookStatus;
  page?: number;
  size?: number;
  sort?: string;
}
