export interface ActivityHistory {
    id: number;
    type: string; // ActivityType (Enum)
    message: string;
    targetType: string;
    targetId: number;
    createdAt: string; // LocalDateTime
}

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

export interface Subscription {
    planName: string | null;
    status: string | null; // SubscriptionStatus (Enum)
    startedAt: string | null; // LocalDate
    expiredAt: string | null; // LocalDate
    nextPaymentAt: string | null; // LocalDate
    active: boolean;
}

export interface WeeklyActivity {
    date: string; // LocalDate
    activityCount: number;
    studySeconds: number; // ✨ 추가: 해당 날짜의 총 학습 시간(초)
}


export interface LearningActivityHeartbeatResponse {
    date: string;
    studySeconds: number;
}

export interface MyDashboardData {
    registeredTemplateCount: number;
    inProgressLearningCount: number;
    completedLearningCount: number;
    totalStudySeconds: number;
    averageCorrectRate: number;
    subscription: Subscription;
    continueLearning: LearningProgress | null;
    weeklyActivities: WeeklyActivity[];
    popularTemplates: TemplateSummary[];
    recentLearning: LearningProgress[];
    recentActivities: ActivityHistory[];
}
