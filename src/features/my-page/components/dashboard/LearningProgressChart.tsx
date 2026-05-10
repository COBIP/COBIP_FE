// src/features/dashboard/components/LearningProgressChart.tsx
import type { LearningActivity } from '@/app/types/DashboardTypes';

interface LearningProgressChartProps {
  activities: LearningActivity[];
}

export function LearningProgressChart({ activities }: LearningProgressChartProps) {
  // 활동이 없을 경우 1로 나누어 Infinity 에러 방지
  const maxCount = Math.max(...activities.map((a) => a.count), 1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-6">학습 활동</h3>

      <div className="flex items-end justify-between gap-2 h-48">
        {activities.map((activity, idx) => {
          const percentage = (activity.count / maxCount) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center h-32">
                <div
                  className="w-full bg-purple-600 rounded-t-lg transition-all hover:bg-purple-700"
                  style={{ height: `${percentage}%` }}
                />
              </div>

              <span className="text-xs text-gray-600 font-medium">
                {activity.day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-600 rounded-full" />
          <span className="text-xs text-gray-600">일간 학습 시간</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full" />
          <span className="text-xs text-gray-600">시간</span>
        </div>
      </div>
    </div>
  );
}