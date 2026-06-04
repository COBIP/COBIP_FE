// src/api/services/DashboardService.ts
import axiosInstance from '@/api/AxiosInstance';
import { getSavedAiTemplateLearningItems } from '@/api/services/AiTemplateStorage';
import type {
    LearningActivityHeartbeatResponse,
    LearningProgress,
    MyDashboardData,
    TemplateSummary,
} from '@/features/my-page/types/DashboardTypes';

export interface PageResponse<TItem> {
    content: TItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

type PracticeProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
type LearningContentType = 'TEMPLATE' | 'GRAMMAR_TEMPLATE';

interface TemplatePracticeProgress {
    status: PracticeProgressStatus;
    progressPercent: number;
    completedMissionCount: number;
    currentMissionId: number | null;
    lastAccessedAt: string | null;
    completedAt: string | null;
}

interface TemplatePracticeDetail {
    templateId: number;
    templateTitle: string;
    missions?: unknown[];
    progress: TemplatePracticeProgress | null;
}

function calculateProgressPercent(practice: TemplatePracticeDetail) {
    const totalMissionCount = practice.missions?.length ?? 0;

    if (practice.progress && totalMissionCount > 0) {
        if (practice.progress.completedMissionCount > totalMissionCount) {
            return 0;
        }

        return Math.min(
            100,
            Math.max(0, Math.round((practice.progress.completedMissionCount / totalMissionCount) * 100)),
        );
    }

    return Math.min(100, Math.max(0, practice.progress?.progressPercent ?? 0));
}

function mapPracticeToLearningProgress(practice: TemplatePracticeDetail): LearningProgress | null {
    if (!practice.progress || practice.progress.status === 'NOT_STARTED') {
        return null;
    }

    const progressPercent = calculateProgressPercent(practice);
    const totalMissionCount = practice.missions?.length ?? 0;
    const hasStaleProgress =
        totalMissionCount > 0 && practice.progress.completedMissionCount > totalMissionCount;

    return {
        templateId: practice.templateId,
        templateTitle: practice.templateTitle,
        thumbnailUrl: null,
        progressPercent,
        lastStep: practice.progress.currentMissionId ? `미션 ${practice.progress.currentMissionId}` : null,
        solvedCount: practice.progress.completedMissionCount,
        correctCount: practice.progress.completedMissionCount,
        studySeconds: 0,
        lastAccessedAt: practice.progress.lastAccessedAt ?? practice.progress.completedAt ?? new Date().toISOString(),
        completed: !hasStaleProgress && practice.progress.status === 'COMPLETED' && progressPercent >= 100,
        contentType: 'TEMPLATE',
    };
}

function getLearningKey(item: LearningProgress) {
    return `${item.contentType ?? 'TEMPLATE'}:${item.templateId}`;
}

function buildMergedLearningList(
    dashboardLearning: LearningProgress[],
    practiceLearning: LearningProgress[],
) {
    const learningMap = new Map<string, LearningProgress>();

    [...practiceLearning, ...dashboardLearning].forEach((item) => {
        const key = getLearningKey(item);
        learningMap.set(key, {
            ...learningMap.get(key),
            ...item,
        });
    });

    return [...learningMap.values()].sort(
        (left, right) => new Date(right.lastAccessedAt).getTime() - new Date(left.lastAccessedAt).getTime(),
    );
}

function getCorrectRatePercent(learning: LearningProgress[]) {
    const solvedCount = learning.reduce((total, item) => total + item.solvedCount, 0);

    if (solvedCount <= 0) {
        return null;
    }

    const correctCount = learning.reduce((total, item) => total + item.correctCount, 0);
    return Math.round((correctCount / solvedCount) * 100);
}

function calculateCorrectRatePercent(value: number) {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return value > 0 && value <= 1 ? Math.round(value * 100) : Math.round(value);
}

async function getPracticeLearningFallback(): Promise<LearningProgress[]> {
    const templatesResponse = await axiosInstance.get('/api/v1/templates', {
        params: { page: 0, size: 100 },
    });
    const templates = (templatesResponse.data.data?.content ?? []) as TemplateSummary[];

    const practiceResults = await Promise.allSettled(
        templates.map((template) => axiosInstance.get(`/api/v1/templates/${template.id}/practice`)),
    );

    return practiceResults
        .map((result) => (result.status === 'fulfilled' ? result.value.data.data as TemplatePracticeDetail : null))
        .map((practice) => (practice ? mapPracticeToLearningProgress(practice) : null))
        .filter((item): item is LearningProgress => Boolean(item));
}

async function applyPracticeProgress(dashboard: MyDashboardData): Promise<MyDashboardData> {
    try {
        const practiceLearning = await getPracticeLearningFallback();
        const aiLearning = getSavedAiTemplateLearningItems();

        if (practiceLearning.length === 0 && aiLearning.length === 0) {
            return {
                ...dashboard,
                averageCorrectRate: calculateCorrectRatePercent(dashboard.averageCorrectRate),
            };
        }

        const mergedLearning = buildMergedLearningList(
            dashboard.recentLearning ?? [],
            [...practiceLearning, ...aiLearning],
        );
        const recentLearning = mergedLearning.slice(0, 5);
        const inProgressLearningCount = mergedLearning.filter((learning) => !learning.completed).length;
        const completedLearningCount = mergedLearning.filter((learning) => learning.completed).length;
        const correctRatePercent = getCorrectRatePercent(mergedLearning);

        return {
            ...dashboard,
            inProgressLearningCount: Math.max(dashboard.inProgressLearningCount, inProgressLearningCount),
            completedLearningCount: Math.max(dashboard.completedLearningCount, completedLearningCount),
            averageCorrectRate: correctRatePercent ?? calculateCorrectRatePercent(dashboard.averageCorrectRate),
            continueLearning: dashboard.continueLearning ?? recentLearning.find((learning) => !learning.completed) ?? null,
            recentLearning,
        };
    } catch {
        const aiLearning = getSavedAiTemplateLearningItems();
        if (aiLearning.length > 0) {
            const mergedLearning = buildMergedLearningList(dashboard.recentLearning ?? [], aiLearning);
            const correctRatePercent = getCorrectRatePercent(mergedLearning);

            return {
                ...dashboard,
                inProgressLearningCount: Math.max(
                    dashboard.inProgressLearningCount,
                    mergedLearning.filter((learning) => !learning.completed).length,
                ),
                completedLearningCount: Math.max(
                    dashboard.completedLearningCount,
                    mergedLearning.filter((learning) => learning.completed).length,
                ),
                averageCorrectRate: correctRatePercent ?? calculateCorrectRatePercent(dashboard.averageCorrectRate),
                continueLearning: dashboard.continueLearning ?? mergedLearning.find((learning) => !learning.completed) ?? null,
                recentLearning: mergedLearning.slice(0, 5),
            };
        }

        return {
            ...dashboard,
            averageCorrectRate: calculateCorrectRatePercent(dashboard.averageCorrectRate),
        };
    }
}

// ❌ HeartbeatResult 인터페이스 삭제됨

export async function syncLearningActivityHeartbeat(
    templateId: number,
    activeSeconds: number,
    contentType: LearningContentType = 'TEMPLATE',
    chapterId?: number | null,
): Promise<LearningActivityHeartbeatResponse> {
    const safeActiveSeconds = Math.min(60, Math.max(1, Math.floor(activeSeconds)));
    const response = await axiosInstance.post('/api/v1/users/me/learning-activities/heartbeat', {
        templateId,
        contentType,
        chapterId,
        activeSeconds: safeActiveSeconds,
    });

    return response.data.data;
}

export const dashboardService = {
    getDashboard: async (): Promise<MyDashboardData> => {
        // 인터셉터가 자동으로 헤더에 토큰을 넣어줍니다.
        const response = await axiosInstance.get('/api/v1/users/me/dashboard');
        return applyPracticeProgress(response.data.data);
    },

    getLearningProgress: async (page = 0, size = 20): Promise<PageResponse<LearningProgress>> => {
        const response = await axiosInstance.get('/api/v1/users/me/learning', {
            params: { page, size },
        });
        return response.data.data;
    },

    recordLearningActivityHeartbeat: syncLearningActivityHeartbeat,
};
