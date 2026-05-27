import type { LearningProgress, WeeklyActivity } from '@/features/my-page/types/DashboardTypes';

export type ActivityView = 'weekly-chart' | 'monthly-calendar';

export interface CalendarDay {
  key: string;
  dayOfMonth: number;
  dateLabel: string;
  studySeconds: number;
  activityCount: number;
}

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
export const CALENDAR_LEVEL_COLORS = [
  'bg-gray-100 text-gray-400',
  'bg-purple-100 text-purple-700',
  'bg-purple-300 text-purple-900',
  'bg-purple-500 text-white',
  'bg-purple-700 text-white',
];
export const CALENDAR_MAX_STUDY_SECONDS = 5 * 60 * 60;

export function getLearningHref(item: LearningProgress) {
  return item.contentType === 'GRAMMAR_TEMPLATE'
    ? `/grammar-template/${item.templateId}`
    : `/functional-template/${item.templateId}`;
}

export function getLearningCategory(item: LearningProgress) {
  const templateType = item.contentType === 'GRAMMAR_TEMPLATE' ? '문법 템플릿' : '기능 템플릿';
  return `${templateType} · ${item.completed ? '학습 완료' : '학습 중'}`;
}

export function formatStudyTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours}시간 ${minutes}분`;
  if (hours > 0) return `${hours}시간`;
  if (minutes > 0) return `${minutes}분`;
  return `${safeSeconds}초`;
}

export function buildDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentWeekRange(today = new Date()) {
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return { weekStart, weekEnd };
}

export function buildWeeklyActivities(activities: WeeklyActivity[]) {
  const weeklySeconds = new Map<string, number>();
  const { weekStart, weekEnd } = getCurrentWeekRange();

  activities.forEach((activity) => {
    const date = new Date(activity.date);
    if (Number.isNaN(date.getTime())) return;
    if (date < weekStart || date >= weekEnd) return;

    const day = WEEKDAY_LABELS[date.getDay()];
    weeklySeconds.set(day, (weeklySeconds.get(day) ?? 0) + (Number(activity.studySeconds) || 0));
  });

  return WEEKDAY_LABELS.map((day) => ({
    day,
    studySeconds: weeklySeconds.get(day) ?? 0,
  }));
}

export function buildActivityMap(activities: WeeklyActivity[]) {
  const activityMap = new Map<string, { studySeconds: number; activityCount: number }>();

  activities.forEach((activity) => {
    const date = new Date(activity.date);
    if (Number.isNaN(date.getTime())) return;
    const key = buildDateKey(date);
    const current = activityMap.get(key) ?? { studySeconds: 0, activityCount: 0 };
    activityMap.set(key, {
      studySeconds: current.studySeconds + (Number(activity.studySeconds) || 0),
      activityCount: current.activityCount + (Number(activity.activityCount) || 0),
    });
  });

  return activityMap;
}

export function buildCalendarDays(year: number, month: number, activities: WeeklyActivity[]): Array<CalendarDay | null> {
  const activityMap = buildActivityMap(activities);
  const firstDate = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlankCount = firstDate.getDay();

  return Array.from({ length: 42 }, (_, index) => {
    const dayOfMonth = index - leadingBlankCount + 1;
    if (dayOfMonth < 1 || dayOfMonth > daysInMonth) return null;

    const date = new Date(year, month - 1, dayOfMonth);
    const key = buildDateKey(date);
    const activity = activityMap.get(key) ?? { studySeconds: 0, activityCount: 0 };

    return {
      key,
      dayOfMonth,
      dateLabel: date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }),
      ...activity,
    };
  });
}

export function calculateCalendarLevel(studySeconds: number, maxSeconds: number) {
  if (studySeconds <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((studySeconds / maxSeconds) * 4)));
}
