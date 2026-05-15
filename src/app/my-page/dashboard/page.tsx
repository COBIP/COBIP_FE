'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { useDashboard } from '@/features/my-page/hooks/useDashboard';
import { useAuth } from '@/hooks/useUser';
import type { LearningProgress } from '@/features/my-page/types/DashboardTypes';

import { StatisticsCard } from '@/features/my-page/components/dashboard/StatisticsCard';
import { LearningProgressChart } from '@/features/my-page/components/dashboard/LearningProgressChart';
import { RecentLearningSection } from '@/features/my-page/components/dashboard/RecentLearningSection';
import { PopularTemplates } from '@/features/my-page/components/dashboard/PopularTemplates';
// 분리한 컴포넌트 및 유틸리티 import
import { MonthlyStudyCalendar } from '@/features/my-page/components/dashboard/MonthlyStudyCalendar';
import { RecentActivitiesSection } from '@/features/my-page/components/dashboard/RecentActivitiesSection';
import { ActivityView, buildWeeklyActivities, getLearningCategory, getLearningHref } from '@/features/my-page/utils/DashboardUtils';

export default function DashboardPage() {
  const { dashboardData, isLoading, error } = useDashboard();
  const { user } = useAuth();
  const [activityView, setActivityView] = useState<ActivityView>('weekly-chart');
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        <p className="font-medium text-gray-500">대시보드를 불러오고 있습니다...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-red-500">{error || '데이터를 불러오지 못했습니다.'}</p>
      </div>
    );
  }

  const handleSelectTemplate = (templateId: number) => {
    router.push(`/functional-template/${templateId}`);
  };

  const statsCards = [
    { title: '나의 템플릿', value: dashboardData.registeredTemplateCount, unit: '개', color: 'blue' as const },
    { title: '학습 중', value: dashboardData.inProgressLearningCount, unit: '개', color: 'orange' as const },
    { title: '학습 완료', value: dashboardData.completedLearningCount, unit: '개', color: 'green' as const },
    { title: '평균 정답률', value: Math.round(dashboardData.averageCorrectRate), unit: '%', color: 'purple' as const },
  ];

  const weeklyActivities = buildWeeklyActivities(dashboardData.weeklyActivities ?? []);
  const joinedAt = user?.createdAt ? new Date(user.createdAt) : null;
  const joinedYear = joinedAt && !Number.isNaN(joinedAt.getTime()) ? joinedAt.getFullYear() : new Date().getFullYear();
  
  const recentLearnings = (dashboardData.recentLearning ?? []).map((item: LearningProgress) => ({
    id: `${item.contentType ?? 'TEMPLATE'}-${item.templateId}`,
    title: item.templateTitle,
    category: getLearningCategory(item),
    lastStudiedDate: new Date(item.lastAccessedAt).toLocaleDateString('ko-KR'),
    completionRate: item.progressPercent,
    href: getLearningHref(item),
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

      {dashboardData.continueLearning && (
        <Link
          href={getLearningHref(dashboardData.continueLearning)}
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <StatisticsCard key={index} card={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex justify-end">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setActivityView('weekly-chart')}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                  activityView === 'weekly-chart' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                주간 그래프
              </button>
              <button
                type="button"
                onClick={() => setActivityView('monthly-calendar')}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                  activityView === 'monthly-calendar' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                학습 캘린더
              </button>
            </div>
          </div>

          {activityView === 'weekly-chart' ? (
            <LearningProgressChart activities={weeklyActivities} />
          ) : (
            <MonthlyStudyCalendar
              activities={dashboardData.weeklyActivities ?? []}
              joinedYear={joinedYear}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <RecentLearningSection learnings={recentLearnings} />
        </div>
      </div>

      <RecentActivitiesSection activities={dashboardData.recentActivities ?? []} />

      <PopularTemplates
        templates={dashboardData.popularTemplates ?? []}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}