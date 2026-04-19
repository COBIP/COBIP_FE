"use client";

import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { StatisticsCard } from '@/features/dashboard/components/StatisticsCard';
import { LearningProgressChart } from '@/features/dashboard/components/LearningProgressChart';
import { RecentLearningSection } from '@/features/dashboard/components/RecentLearningSection';
import { RecommendedCoursesSection } from '@/features/dashboard/components/RecommendedCoursesSection';
import { dashboardData } from '@/hooks/useDashboardData';

export default function Dashboard() {
  const data = dashboardData;
  const activeMenu = 'dashboard';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <DashboardSidebar activeMenu={activeMenu} />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <DashboardHeader userName="Alex" userProgress={5} />

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* 상단 통계 카드 (4개) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.statistics.map((stat) => (
                <StatisticsCard key={stat.id} card={stat} />
              ))}
            </div>

            {/* 학습 활동 + 최근 학습 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 학습 활동 차트 (2/3) */}
              <div className="lg:col-span-2">
                <LearningProgressChart activities={data.learningActivities} />
              </div>

              {/* 최근 학습 (1/3) */}
              <div>
                <RecentLearningSection learnings={data.recentLearnings} />
              </div>
            </div>

            {/* 추천 과정 */}
            <RecommendedCoursesSection courses={data.recommendedCourses} />
          </div>
        </div>
      </main>
    </div>
  );
}