// "use client";

// import { useState } from 'react';

// // import DashboardHeader from '@/features/my-page/components/common/MyPageHeader';
// // import DashboardSidebar from '@/features/my-page/components/common/MyPageSidebar';

// import { StatisticsCard } from '@/features/my-page/components/dashboard/StatisticsCard';
// import { LearningProgressChart } from '@/features/my-page/components/dashboard/LearningProgressChart';
// import { RecentLearningSection } from '@/features/my-page/components/dashboard/RecentLearningSection';
// import { RecommendedCoursesSection } from '@/features/my-page/components/dashboard/RecommendedCoursesSection';
// import {
//   dashboardPeriodOptions,
//   dashboardSnapshots,
// } from '@/hooks/useDashboardData';
// import type {
//   DashboardData,
//   DashboardPeriod,
//   DashboardPeriodOption,
// } from '@/app/types/DashboardTypes';

// export default function Dashboard() {
  
//   const [activePeriod, setActivePeriod] = useState<DashboardPeriod>('7d');
//   const data = dashboardSnapshots[activePeriod];
//   const activePeriodOption = dashboardPeriodOptions.find(
//     (option: DashboardPeriodOption) => option.value === activePeriod,
//   );


//   return (
//     // <div className="flex h-screen bg-gray-50">
     
    

        
//       <main className="flex-1 flex flex-col overflow-hidden">
//         {/* 헤더 */}
      

//         {/* 콘텐츠 */}
//         <div className="flex-1 overflow-y-auto px-8 py-8">
//           <div className="max-w-7xl mx-auto space-y-8">
//             <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
//               <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//                 <div>
//                   <p className="text-sm font-semibold text-purple-600">
//                     기간별 인사이트
//                   </p>
//                   <h2 className="mt-1 text-lg font-bold text-gray-900">
//                     {activePeriodOption?.label} 기준으로 대시보드가 바뀝니다
//                   </h2>
//                   <p className="mt-1 text-sm text-gray-500">
//                     {activePeriodOption?.description}에 따라 통계, 학습 활동, 추천 과정이 함께 갱신됩니다.
//                   </p>
//                 </div>

//                 <div className="inline-flex rounded-full bg-gray-100 p-1">
//                   {dashboardPeriodOptions.map((option: DashboardPeriodOption) => {
//                     const isActive = activePeriod === option.value;

//                     return (
//                       <button
//                         key={option.value}
//                         type="button"
//                         onClick={() => setActivePeriod(option.value)}
//                         className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
//                           isActive
//                             ? 'bg-white text-purple-700 shadow-sm'
//                             : 'text-gray-500 hover:text-gray-900'
//                         }`}
//                       >
//                         {option.label}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </section>

//             {/* 상단 통계 카드 (4개) */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {data.statistics.map((stat: DashboardData['statistics'][number]) => (
//                 <StatisticsCard key={stat.id} card={stat} />
//               ))}
//             </div>

//             {/* 학습 활동 + 최근 학습 */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* 학습 활동 차트 (2/3) */}
//               <div className="lg:col-span-2">
//                 <LearningProgressChart activities={data.learningActivities} />
//               </div>

//               {/* 최근 학습 (1/3) */}
//               <div>
//                 <RecentLearningSection learnings={data.recentLearnings} />
//               </div>
//             </div>

//             {/* 추천 과정 */}
//             <RecommendedCoursesSection courses={data.recommendedCourses} />
//           </div>
//         </div>
//       </main>
//     // </div>
//   );
// }


'use client';

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
    category: "학습 기록", 
    lastStudiedDate: new Date(item.lastAccessedAt).toLocaleDateString(),
    completionRate: item.progressPercent
}));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

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