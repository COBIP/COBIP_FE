'use client';

import { useMemo, useState } from 'react';
import type { WeeklyActivity } from '@/features/my-page/types/DashboardTypes';
import {
  WEEKDAY_LABELS,
  MONTH_OPTIONS,
  CALENDAR_LEVEL_COLORS,
  CalendarDay,
  buildDateKey,
  buildCalendarDays,
  formatStudyTime,
  calculateCalendarLevel,
} from '@/features/my-page/utils/DashboardUtils';

export function MonthlyStudyCalendar({
  activities,
  joinedYear,
}: {
  activities: WeeklyActivity[];
  joinedYear: number;
}) {
  const today = new Date();
  const todayKey = buildDateKey(today);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const currentYear = today.getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - joinedYear + 1 },
    (_, index) => joinedYear + index,
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(selectedYear, selectedMonth, activities),
    [activities, selectedMonth, selectedYear],
  );

  const visibleDays = calendarDays.filter((day): day is CalendarDay => Boolean(day));
  const maxSeconds = Math.max(...visibleDays.map((day) => day.studySeconds), 1);
  const monthlyTotalSeconds = visibleDays.reduce((sum, day) => sum + day.studySeconds, 0);
  const activeDays = visibleDays.filter((day) => day.studySeconds > 0).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">학습 캘린더</h3>
          <p className="mt-1 text-xs text-gray-500">선택한 달의 일별 학습 시간을 달력 형태로 확인합니다.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="text-left text-xs text-gray-500 sm:text-right">
            <p className="font-semibold text-purple-700">총 {formatStudyTime(monthlyTotalSeconds)}</p>
            <p className="mt-1">
              {selectedYear}년 {selectedMonth}월 학습 시간 · {activeDays}일 학습
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm font-medium text-gray-700 outline-none transition focus:border-purple-300"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
              className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm font-medium text-gray-700 outline-none transition focus:border-purple-300"
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => {
          if (!day) return <div key={`blank-${index}`} className="aspect-square rounded-md" />;

          const level = calculateCalendarLevel(day.studySeconds, maxSeconds);
          const isToday = day.key === todayKey;

          return (
            <div
              key={day.key}
              title={`${day.dateLabel} · ${formatStudyTime(day.studySeconds)} · 활동 ${day.activityCount}개`}
              className={`flex aspect-square flex-col justify-between rounded-md border border-white p-1.5 text-xs font-semibold transition ${CALENDAR_LEVEL_COLORS[level]} ${
                isToday ? 'ring-2 ring-amber-400 ring-offset-2' : ''
              }`}
            >
              <span className="flex items-center justify-between gap-1">
                <span>{day.dayOfMonth}</span>
                {isToday && <span className="text-[9px] font-bold text-amber-600">오늘</span>}
              </span>
              {day.studySeconds > 0 && (
                <span className="truncate text-[10px] font-medium">{formatStudyTime(day.studySeconds)}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-[11px] text-gray-500">
        <span>적음</span>
        {CALENDAR_LEVEL_COLORS.map((color) => (
          <span key={color} className={`h-3 w-3 rounded-sm ${color.split(' ')[0]}`} />
        ))}
        <span>많음</span>
      </div>
    </div>
  );
}