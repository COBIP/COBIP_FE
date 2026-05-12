// src/types/CodingWorkbookTypes.ts

// 1. 난이도 Enum
export type CodingDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

// 2. 워크북 요약 정보
export interface CodingWorkbookSummary {
    id: number;
    slug: string;
    title: string;
    category: string;
    difficulty: CodingDifficulty;
    summary: string;
    displayOrder: number;
    createdAt: string; // LocalDateTime
}

// 3. 페이징 공통 응답 구조 (수정됨: 백엔드 변수명 차이 방어)
export interface PageResponse<T> {
    content: T[];
    page?: number;     // 커스텀 응답일 경우
    number?: number;   // Spring 기본 응답일 경우
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

// 4. API 요청 파라미터 (검색, 필터, 페이징용)
export interface GetWorkbooksParams {
    keyword?: string;
    category?: string;
    difficulty?: CodingDifficulty;
    page?: number;
    size?: number;
    sort?: string;
}

// 5. 문제집 내부의 개별 문제 요약 정보
export interface CodingWorkbookProblemSummary {
    id: number;
    title: string;
    category: string;
    difficulty: CodingDifficulty;
    orderIndex: number;
}

// 6. 문제집 상세 정보
export interface CodingWorkbookDetail {
    id: number;
    slug: string;
    title: string;
    category: string;
    difficulty: CodingDifficulty;
    summary: string;
    description: string;
    problems: CodingWorkbookProblemSummary[];
    createdAt: string; // LocalDateTime
    updatedAt: string; // LocalDateTime
}