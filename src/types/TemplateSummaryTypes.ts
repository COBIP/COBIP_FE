export interface TemplateSummary {
    id: number;
    title: string;
    description: string;
    category: string;
    difficulty: string; // TemplateDifficulty (Enum)
    accessLevel: string; // TemplateAccessLevel (Enum)
    techStacks: string[];
    thumbnailUrl: string | null;
    viewCount: number;
    favoriteCount: number;
    ownerId: number;
    ownerNickname: string;
    createdAt: string; // LocalDateTime
}