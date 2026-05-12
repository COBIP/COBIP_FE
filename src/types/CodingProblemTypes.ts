// 1. Enum 값 동기화
export type CodingLanguage = 'JAVA' | 'PYTHON' | 'JAVASCRIPT'; 
export type CodingSubmissionStatus = 
    | 'PENDING' | 'RUNNING' | 'ACCEPTED' | 'WRONG_ANSWER' 
    | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'INTERNAL_ERROR';

export type CodingDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

// 2. 내부 DTO 객체
export interface CodingProblemSampleTestCaseResponse {
    id: number;
    input: string;
    expectedOutput: string; // output에서 수정됨
    orderIndex: number;
}

export interface CodingProblemStarterCodeResponse {
    language: CodingLanguage;
    code: string;
}

// 3. 문제 상세 정보 (CodingProblemDetailResponse.java 대응)
export interface CodingProblemDetailResponse {
    id: number;
    workbookId: number;
    title: string;
    category: string;
    difficulty: CodingDifficulty;
    contentJson: string; // any 대신 구체적인 타입(주로 string) 지정
    explanationJson: string | null;
    orderIndex: number;
    timeLimitMillis: number;
    memoryLimitMb: number;
    sampleTestCases: CodingProblemSampleTestCaseResponse[];
    starterCodes: CodingProblemStarterCodeResponse[];
    createdAt: string;
    updatedAt: string;
}

// 4. 실행 및 제출 관련
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