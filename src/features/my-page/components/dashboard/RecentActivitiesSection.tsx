'use client';

import { Activity } from 'lucide-react';
import type { ActivityHistory } from '@/features/my-page/types/DashboardTypes';

export function RecentActivitiesSection({ activities }: { activities: ActivityHistory[] }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-purple-600" />
        <h3 className="text-sm font-bold text-gray-900">최근 활동 기록</h3>
      </div>

      {activities.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-500">아직 최근 활동 기록이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{activity.message}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {activity.type} · {activity.targetType}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  {new Date(activity.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}