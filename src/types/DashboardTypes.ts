import type { ActivityHistory } from './ActivityHistoryTypes';
import type { TemplateSummary } from './TemplateSummaryTypes';
import type { LearningProgress } from './LearningProgressTypes';
import type { Subscription } from './SubscriptionTypes';
import type { WeeklyActivity } from './WeeklyActivityTypes';

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