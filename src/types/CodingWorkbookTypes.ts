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

// 3. 페이징 공통 응답 구조
export interface PageResponse<T> {
    content: T[];
    page: number;
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