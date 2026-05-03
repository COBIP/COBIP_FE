import type {
  DashboardData,
  DashboardPeriodOption,
  DashboardPeriod,
} from '@/app/types/DashboardTypes';

const dashboardStatisticsByPeriod: Record<DashboardPeriod, DashboardData['statistics']> = {
  '7d': [
    {
      id: 'completed',
      title: '완료한 문제',
      value: '128',
      unit: '/ 200',
      percentage: 10,
      trend: 'up',
      color: 'blue',
    },
    {
      id: 'completion-rate',
      title: '평균 정답률',
      value: '85',
      unit: '%',
      percentage: 5,
      trend: 'up',
      color: 'green',
    },
    {
      id: 'study-time',
      title: '총 학습 시간',
      value: '42.5',
      unit: '시간',
      percentage: 0,
      trend: 'stable',
      color: 'orange',
    },
    {
      id: 'streak',
      title: '현재 연속 학습',
      value: '12',
      unit: '일',
      percentage: 0,
      trend: 'stable',
      color: 'purple',
    },
  ],
  '30d': [
    {
      id: 'completed',
      title: '완료한 문제',
      value: '146',
      unit: '/ 220',
      percentage: 18,
      trend: 'up',
      color: 'blue',
    },
    {
      id: 'completion-rate',
      title: '평균 정답률',
      value: '87',
      unit: '%',
      percentage: 2,
      trend: 'up',
      color: 'green',
    },
    {
      id: 'study-time',
      title: '총 학습 시간',
      value: '88.2',
      unit: '시간',
      percentage: 16,
      trend: 'up',
      color: 'orange',
    },
    {
      id: 'streak',
      title: '현재 연속 학습',
      value: '18',
      unit: '일',
      percentage: 0,
      trend: 'up',
      color: 'purple',
    },
  ],
  '90d': [
    {
      id: 'completed',
      title: '완료한 문제',
      value: '182',
      unit: '/ 260',
      percentage: 27,
      trend: 'up',
      color: 'blue',
    },
    {
      id: 'completion-rate',
      title: '평균 정답률',
      value: '89',
      unit: '%',
      percentage: 4,
      trend: 'up',
      color: 'green',
    },
    {
      id: 'study-time',
      title: '총 학습 시간',
      value: '204.5',
      unit: '시간',
      percentage: 38,
      trend: 'up',
      color: 'orange',
    },
    {
      id: 'streak',
      title: '현재 연속 학습',
      value: '27',
      unit: '일',
      percentage: 0,
      trend: 'up',
      color: 'purple',
    },
  ],
};

const dashboardActivitiesByPeriod: Record<DashboardPeriod, DashboardData['learningActivities']> = {
  '7d': [
    { day: '월', count: 5 },
    { day: '화', count: 3 },
    { day: '수', count: 7 },
    { day: '목', count: 4 },
    { day: '금', count: 6 },
    { day: '토', count: 2 },
    { day: '일', count: 3 },
  ],
  '30d': [
    { day: '1주', count: 18 },
    { day: '2주', count: 24 },
    { day: '3주', count: 20 },
    { day: '4주', count: 31 },
  ],
  '90d': [
    { day: '1분기', count: 42 },
    { day: '2분기', count: 58 },
    { day: '3분기', count: 63 },
    { day: '4분기', count: 51 },
  ],
};

const dashboardRecentLearningsByPeriod: Record<DashboardPeriod, DashboardData['recentLearnings']> = {
  '7d': [
    {
      id: 'recent-1',
      title: '인덱스 최적화',
      category: 'Database',
      completionRate: 88,
      lastStudiedDate: '2시간 전',
    },
    {
      id: 'recent-2',
      title: '로드 밸런싱',
      category: 'System Design',
      completionRate: 30,
      lastStudiedDate: '1시간 전',
    },
    {
      id: 'recent-3',
      title: '기본 구조',
      category: 'Data Structure',
      completionRate: 0,
      lastStudiedDate: '준비중',
    },
  ],
  '30d': [
    {
      id: 'recent-1',
      title: '캐시 계층 설계',
      category: 'Database',
      completionRate: 92,
      lastStudiedDate: '오늘',
    },
    {
      id: 'recent-2',
      title: '장애 복구 전략',
      category: 'System Design',
      completionRate: 64,
      lastStudiedDate: '어제',
    },
    {
      id: 'recent-3',
      title: '큐와 비동기 처리',
      category: 'Backend',
      completionRate: 38,
      lastStudiedDate: '3일 전',
    },
  ],
  '90d': [
    {
      id: 'recent-1',
      title: '분산 트랜잭션',
      category: 'Database',
      completionRate: 96,
      lastStudiedDate: '이번 주',
    },
    {
      id: 'recent-2',
      title: '대규모 이벤트 처리',
      category: 'System Design',
      completionRate: 81,
      lastStudiedDate: '지난주',
    },
    {
      id: 'recent-3',
      title: '자료구조 복습',
      category: 'Computer Science',
      completionRate: 57,
      lastStudiedDate: '2주 전',
    },
  ],
};

const dashboardRecommendedCoursesByPeriod: Record<DashboardPeriod, DashboardData['recommendedCourses']> = {
  '7d': [
    {
      id: 'course-1',
      title: 'CS 아키텍처101',
      description: '소프트 아키텍처',
      category: 'Architecture',
      releaseDate: '2023년 10월 출시',
      difficulty: 'intermediate',
    },
    {
      id: 'course-2',
      title: '쉽운 시스템 디자인',
      description: '시스템 설계',
      category: 'System Design',
      releaseDate: '2024년 1월 출시',
      difficulty: 'beginner',
    },
    {
      id: 'course-3',
      title: '테스트 자동화',
      description: 'QA 전략',
      category: 'Testing',
      releaseDate: '2024년 4월 출시',
      difficulty: 'beginner',
    },
  ],
  '30d': [
    {
      id: 'course-1',
      title: 'CS 아키텍처101',
      description: '소프트 아키텍처',
      category: 'Architecture',
      releaseDate: '2023년 10월 출시',
      difficulty: 'intermediate',
    },
    {
      id: 'course-2',
      title: '이벤트 드리븐 아키텍처',
      description: '확장 가능한 시스템 설계',
      category: 'System Design',
      releaseDate: '2024년 3월 출시',
      difficulty: 'advanced',
    },
    {
      id: 'course-3',
      title: '테스트 자동화',
      description: 'QA 전략',
      category: 'Testing',
      releaseDate: '2024년 4월 출시',
      difficulty: 'beginner',
    },
  ],
  '90d': [
    {
      id: 'course-1',
      title: 'CS 아키텍처101',
      description: '소프트 아키텍처',
      category: 'Architecture',
      releaseDate: '2023년 10월 출시',
      difficulty: 'intermediate',
    },
    {
      id: 'course-2',
      title: '클라우드 네이티브 시스템',
      description: '운영과 확장성',
      category: 'System Design',
      releaseDate: '2024년 5월 출시',
      difficulty: 'advanced',
    },
    {
      id: 'course-3',
      title: '테스트 자동화',
      description: 'QA 전략',
      category: 'Testing',
      releaseDate: '2024년 4월 출시',
      difficulty: 'beginner',
    },
  ],
};

export const dashboardPeriodOptions: DashboardPeriodOption[] = [
  {
    value: '7d',
    label: '7일',
    description: '가장 최근 학습 흐름',
  },
  {
    value: '30d',
    label: '30일',
    description: '이번 달 집중도',
  },
  {
    value: '90d',
    label: '90일',
    description: '학습 추세 전체',
  },
];

export const dashboardSnapshots: Record<DashboardPeriod, DashboardData> = {
  '7d': {
    statistics: dashboardStatisticsByPeriod['7d'],
    learningActivities: dashboardActivitiesByPeriod['7d'],
    recentLearnings: dashboardRecentLearningsByPeriod['7d'],
    recommendedCourses: dashboardRecommendedCoursesByPeriod['7d'],
  },
  '30d': {
    statistics: dashboardStatisticsByPeriod['30d'],
    learningActivities: dashboardActivitiesByPeriod['30d'],
    recentLearnings: dashboardRecentLearningsByPeriod['30d'],
    recommendedCourses: dashboardRecommendedCoursesByPeriod['30d'],
  },
  '90d': {
    statistics: dashboardStatisticsByPeriod['90d'],
    learningActivities: dashboardActivitiesByPeriod['90d'],
    recentLearnings: dashboardRecentLearningsByPeriod['90d'],
    recommendedCourses: dashboardRecommendedCoursesByPeriod['90d'],
  },
};
