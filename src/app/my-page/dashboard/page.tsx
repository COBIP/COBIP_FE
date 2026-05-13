'use client';

import Link from 'next/link';
import { useDashboard } from '@/hooks/useDashboard';
import { StatisticsCard } from '@/features/my-page/components/dashboard/StatisticsCard';
import { LearningProgressChart } from '@/features/my-page/components/dashboard/LearningProgressChart';
import { RecentLearningSection } from '@/features/my-page/components/dashboard/RecentLearningSection';
import { RecommendedCoursesSection } from '@/features/my-page/components/dashboard/RecommendedCoursesSection';
import { Loader2 } from 'lucide-react'; // 로딩 아이콘
import type { WeeklyActivity } from '@/types/WeeklyActivityTypes'; // 상단에 임포트 추가 (경로 확인)
import type { LearningProgress } from '@/types/LearningProgressTypes';
import type { TemplateSummary } from '@/types/TemplateSummaryTypes';

export default function DashboardPage() {
  const { dashboardData, isLoading, error } = useDashboard();

  // 1. 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-gray-500 font-medium">대시보드를 불러오고 있습니다...</p>
      </div>
    );
  }

  // 2. 에러 상태 처리
  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-red-500">{error || "데이터를 불러올 수 없습니다."}</p>
      </div>
    );
  }

  // 3. UI 컴포넌트 형식에 맞게 데이터 변환 (Data Mapping)
  
  // (1) 통계 카드 데이터 변환
  const statsCards = [
    {
      title: '나의 템플릿',
      value: dashboardData.registeredTemplateCount,
      unit: '개',
      color: 'blue' as const,
    },
    {
      title: '학습 중',
      value: dashboardData.inProgressLearningCount,
      unit: '개',
      color: 'orange' as const,
    },
    {
      title: '학습 완료',
      value: dashboardData.completedLearningCount,
      unit: '개',
      color: 'green' as const,
    },
    {
      title: '평균 정답률',
      value: Math.round(dashboardData.averageCorrectRate),
      unit: '%',
      color: 'purple' as const,
    },
  ];

  const chartActivities = dashboardData.weeklyActivities.map((activity: WeeklyActivity) => ({
      day: new Date(activity.date).toLocaleDateString('ko-KR', { weekday: 'short' }),
      count: activity.activityCount
  }));
  // (3) 최근 학습 데이터 변환
  const recentLearnings = dashboardData.recentLearning.map((item: LearningProgress) => ({
    id: item.templateId,
    title: item.templateTitle,
    category: item.completed ? '학습 완료' : '학습 중',
    lastStudiedDate: new Date(item.lastAccessedAt).toLocaleDateString(),
    completionRate: item.progressPercent,
    href: `/functional-template/${item.templateId}`,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

      {dashboardData.continueLearning && (
        <Link
          href={`/functional-template/${dashboardData.continueLearning.templateId}`}
          className="block rounded-xl border border-purple-200 bg-purple-50 p-5 transition hover:bg-purple-100"
        >
          <p className="text-sm font-semibold text-purple-700">이어서 학습하기</p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-950">{dashboardData.continueLearning.templateTitle}</h2>
              <p className="mt-1 text-sm text-gray-600">
                진행률 {dashboardData.continueLearning.progressPercent}%
                {dashboardData.continueLearning.lastStep ? ` · ${dashboardData.continueLearning.lastStep}` : ''}
              </p>
            </div>
            <span className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white">
              계속하기
            </span>
          </div>
        </Link>
      )}

      {/* 상단 통계 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <StatisticsCard key={index} card={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 학습 차트 */}
        <div className="lg:col-span-2">
          <LearningProgressChart activities={chartActivities} />
        </div>
        
        {/* 오른쪽: 최근 학습 목록 */}
        <div className="lg:col-span-1">
          <RecentLearningSection learnings={recentLearnings} />
        </div>
      </div>

      {/* 하단: 인기 템플릿 (기존 RecommendedCoursesSection 재활용) */}
      <RecommendedCoursesSection 
        courses={dashboardData.popularTemplates.map((t: TemplateSummary) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            releaseDate: new Date(t.createdAt).toLocaleDateString(),
            category: t.category,
            difficulty: t.difficulty.toLowerCase() as 'beginner' | 'intermediate' | 'advanced'
        }))} 
    />
    </div>
  );
}
