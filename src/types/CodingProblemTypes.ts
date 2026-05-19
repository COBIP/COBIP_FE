import type { CodingDifficulty } from '@/types/CodingWorkbookTypes';

export type CodingLanguage = 'JAVA' | 'PYTHON' | 'JAVASCRIPT';

export type CodingSubmissionStatus =
    | 'PENDING'
    | 'RUNNING'
    | 'ACCEPTED'
    | 'WRONG_ANSWER'
    | 'COMPILE_ERROR'
    | 'RUNTIME_ERROR'
    | 'TIME_LIMIT_EXCEEDED'
    | 'INTERNAL_ERROR';

export type CodingProblemContentBlock = {
    type?: string;
    text?: string;
    content?: CodingProblemContentBlock[];
    attrs?: Record<string, unknown>;
};

export type CodingProblemJson = string | CodingProblemContentBlock | CodingProblemContentBlock[] | null;

export interface CodingProblemSampleTestCaseResponse {
    id: number;
    input: string;
    expectedOutput: string;
    orderIndex: number;
}

export interface CodingProblemStarterCodeResponse {
    language: CodingLanguage;
    code: string;
}

export interface CodingProblemDetailResponse {
    id: number;
    workbookId: number;
    title: string;
    category: string;
    difficulty: CodingDifficulty;
    contentJson: CodingProblemJson;
    explanationJson: CodingProblemJson;
    orderIndex: number;
    timeLimitMillis: number;
    memoryLimitMb: number;
    sampleTestCases: CodingProblemSampleTestCaseResponse[];
    starterCodes: CodingProblemStarterCodeResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface CodingCodeRunRequest {
    language: CodingLanguage;
    sourceCode: string;
    input?: string;
}

export interface CodingCodeRunResponse {
    status: CodingSubmissionStatus;
    stdout: string | null;
    stderr: string | null;
    compileOutput: string | null;
    message: string | null;
    time: string | null;
    memory: number | null;
}

export interface CodingSubmissionRequest {
    language: CodingLanguage;
    sourceCode: string;
}

export interface CodingSubmissionResponse {
    id: number;
    problemId: number;
    language: CodingLanguage;
    status: CodingSubmissionStatus;
    passedCount: number;
    totalCount: number;
    stdout: string | null;
    stderr: string | null;
    compileOutput: string | null;
    message: string | null;
    time: string | null;
    memory: number | null;
    createdAt: string;
}
