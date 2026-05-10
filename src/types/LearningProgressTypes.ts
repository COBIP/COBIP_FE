export interface LearningProgress {
    templateId: number;
    templateTitle: string;
    thumbnailUrl: string | null;
    progressPercent: number;
    lastStep: string | null;
    solvedCount: number;
    correctCount: number;
    studySeconds: number;
    lastAccessedAt: string; // LocalDateTime
    completed: boolean;
}