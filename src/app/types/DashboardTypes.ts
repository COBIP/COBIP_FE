// src/app/types/DashboardTypes.ts

export interface StatisticCard {
  id?: string | number; // 백엔드 연동을 위해 선택 및 number 허용
  title: string;
  value: string | number;
  unit?: string;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  color: 'blue' | 'green' | 'orange' | 'purple';
}

export type DashboardPeriod = '7d' | '30d' | '90d';

export interface DashboardPeriodOption {
  value: DashboardPeriod;
  label: string;
  description: string;
}

export interface LearningActivity {
  day: string;
  count: number;
}

export interface RecentLearning {
  id: string | number; // 백엔드의 Long 타입 ID(number) 처리를 위해 허용
  title: string;
  category: string;
  completionRate: number;
  lastStudiedDate: string;
  href?: string;
}

export interface RecommendedCourse {
  id: string | number; // 백엔드 ID 연동
  title: string;
  description: string;
  category?: string; // 백엔드 데이터에 없을 수 있으므로 선택(?) 처리
  releaseDate: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // 선택(?) 처리
}

export interface DashboardData {
  statistics: StatisticCard[];
  learningActivities: LearningActivity[];
  recentLearnings: RecentLearning[];
  recommendedCourses: RecommendedCourse[];
}
