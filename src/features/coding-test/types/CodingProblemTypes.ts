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

export type CodingDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface CodingProblemSampleTestCase {
    id: number;
    input: string;
    expectedOutput: string;
    orderIndex: number;
}

export interface CodingProblemStarterCode {
    language: CodingLanguage;
    code: string;
}

export interface CodingProblemDetail {
    id: number;
    workbookId: number;
    title: string;
    category: string;
    difficulty: CodingDifficulty;
    contentJson: string; 
    explanationJson: string | null;
    orderIndex: number;
    timeLimitMillis: number;
    memoryLimitMb: number;
    sampleTestCases: CodingProblemSampleTestCase[];
    starterCodes: CodingProblemStarterCode[];
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
    stdout: string;
    stderr: string;
    compileOutput: string;
    message: string;
    time: string;
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
    stdout: string;
    stderr: string;
    compileOutput: string;
    message: string;
    time: string;
    memory: number | null;
    createdAt: string;
}