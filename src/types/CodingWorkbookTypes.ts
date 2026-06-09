export type CodingDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface GetWorkbooksParams {
    keyword?: string;
    category?: string;
    difficulty?: CodingDifficulty;
    page?: number;
    size?: number;
    sort?: string;
}

export interface CodingWorkbookSummaryResponse {
    id: number;
    slug: string;
    title: string;
    category: string;
    difficulty: CodingDifficulty;
    summary: string;
    displayOrder: number;
    createdAt: string;
}

export interface CodingWorkbookProblemSummaryResponse {
    id: number;
    title: string;
    category: string;
    difficulty: CodingDifficulty;
    orderIndex: number;
    solved?: boolean;
}

export interface CodingWorkbookDetailResponse {
    id: number;
    slug: string;
    title: string;
    category: string;
    difficulty: CodingDifficulty;
    summary: string;
    description: string | null;
    problems: CodingWorkbookProblemSummaryResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface CodingProblemListItem {
    workbook: CodingWorkbookSummaryResponse;
    problem: CodingWorkbookProblemSummaryResponse;
}
