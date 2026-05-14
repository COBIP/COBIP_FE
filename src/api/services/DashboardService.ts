// src/api/services/DashboardService.ts
import axiosInstance from '@/api/AxiosInstance';
import type { MyDashboardData, LearningProgress, TemplateSummary } from '@/types/DashboardTypes';
// ❌ HeartbeatRequest 임포트 삭제됨

export interface PageResponse<TItem> {
    content: TItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

type PracticeProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

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
    };
}

function buildMergedLearningList(
    dashboardLearning: LearningProgress[],
    practiceLearning: LearningProgress[],
) {
    const learningMap = new Map<number, LearningProgress>();

    [...practiceLearning, ...dashboardLearning].forEach((item) => {
        learningMap.set(item.templateId, {
            ...learningMap.get(item.templateId),
            ...item,
        });
    });

    return [...learningMap.values()].sort(
        (left, right) => new Date(right.lastAccessedAt).getTime() - new Date(left.lastAccessedAt).getTime(),
    );
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

        if (practiceLearning.length === 0) {
            return dashboard;
        }

        const recentLearning = buildMergedLearningList(dashboard.recentLearning ?? [], practiceLearning).slice(0, 5);
        const inProgressLearningCount = recentLearning.filter((learning) => !learning.completed).length;
        const completedLearningCount = recentLearning.filter((learning) => learning.completed).length;

        return {
            ...dashboard,
            inProgressLearningCount: Math.max(dashboard.inProgressLearningCount, inProgressLearningCount),
            completedLearningCount: Math.max(dashboard.completedLearningCount, completedLearningCount),
            continueLearning: dashboard.continueLearning ?? recentLearning.find((learning) => !learning.completed) ?? null,
            recentLearning,
        };
    } catch {
        return dashboard;
    }
}

// ❌ HeartbeatResult 인터페이스 삭제됨

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
    // ❌ recordHeartbeat 메서드 삭제됨
};