export interface StatisticCard {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  color: 'blue' | 'green' | 'orange' | 'purple';
}

export interface LearningActivity {
  day: string;
  count: number;
}

export interface RecentLearning {
  id: string;
  title: string;
  category: string;
  completionRate: number;
  lastStudiedDate: string;
}

export interface RecommendedCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  releaseDate: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface DashboardData {
  statistics: StatisticCard[];
  learningActivities: LearningActivity[];
  recentLearnings: RecentLearning[];
  recommendedCourses: RecommendedCourse[];
}