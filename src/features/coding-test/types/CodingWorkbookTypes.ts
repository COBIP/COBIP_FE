// src/features/coding-test/types/codingWorkbook.type.ts

export type CodingDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface CodingWorkbookSummary {
    id: number;
    slug: string;
    title: string;
    category: string;
    difficulty: CodingDifficulty;
    summary: string;
    displayOrder: number;
    createdAt: string;
}

export interface GetWorkbooksParams {
    keyword?: string;
    category?: string;
    difficulty?: CodingDifficulty;
    page?: number;
    size?: number;
    sort?: string;
}

export interface PageResponse<T> {
    content: T[];
    page?: number;     // 커스텀 응답용
    number?: number;   // Spring 기본 응답용
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}