"use client";

import { useState } from 'react';

import DashboardHeader from '@/features/my-page/components/common/MyPageHeader';
import DashboardSidebar from '@/features/my-page/components/common/MyPageSidebar';

import { StatisticsCard } from '@/features/my-page/components/dashboard/StatisticsCard';
import { LearningProgressChart } from '@/features/my-page/components/dashboard/LearningProgressChart';
import { RecentLearningSection } from '@/features/my-page/components/dashboard/RecentLearningSection';
import { RecommendedCoursesSection } from '@/features/my-page/components/dashboard/RecommendedCoursesSection';
import {
  dashboardPeriodOptions,
  dashboardSnapshots,
} from '@/hooks/useDashboardData';
import type {
  DashboardData,
  DashboardPeriod,
  DashboardPeriodOption,
} from '@/app/types/DashboardTypes';

export default function Dashboard() {
  const [activePeriod, setActivePeriod] = useState<DashboardPeriod>('7d');
  const data = dashboardSnapshots[activePeriod];
  const activePeriodOption = dashboardPeriodOptions.find(
    (option: DashboardPeriodOption) => option.value === activePeriod,
  );
  const activeMenu = 'dashboard';

  const user = {
        nickName : "nickName",
        image: "/test.png"
    };

  return (
    // <div className="flex h-screen bg-gray-50">
     
    

        
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
      

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-600">
                    기간별 인사이트
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-gray-900">
                    {activePeriodOption?.label} 기준으로 대시보드가 바뀝니다
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {activePeriodOption?.description}에 따라 통계, 학습 활동, 추천 과정이 함께 갱신됩니다.
                  </p>
                </div>

                <div className="inline-flex rounded-full bg-gray-100 p-1">
                  {dashboardPeriodOptions.map((option: DashboardPeriodOption) => {
                    const isActive = activePeriod === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setActivePeriod(option.value)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          isActive
                            ? 'bg-white text-purple-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 상단 통계 카드 (4개) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.statistics.map((stat: DashboardData['statistics'][number]) => (
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
    // </div>
  );
}