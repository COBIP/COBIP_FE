// src/features/dashboard/components/RecentLearningSection.tsx
import Link from 'next/link';
import type { RecentLearning } from '@/app/types/DashboardTypes';

interface RecentLearningSectionProps {
  learnings: RecentLearning[];
}

export function RecentLearningSection({ learnings }: RecentLearningSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-4">최근 학습</h3>

      {learnings.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">아직 최근 학습 내역이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {learnings.map((learning) => {
            const content = (
              <>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {learning.title}
                  </p>
                  <p className="text-xs text-gray-500">{learning.category}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {learning.lastStudiedDate}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${learning.completionRate}%` }}
                />
              </div>
    
              <p className="text-xs text-gray-600 mt-2">
                {learning.completionRate}% 완료
              </p>
              </>
            );

            return learning.href ? (
              <Link
                key={learning.id}
                href={learning.href}
                className="block rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
              >
                {content}
              </Link>
            ) : (
              <div
                key={learning.id}
                className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
              >
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
