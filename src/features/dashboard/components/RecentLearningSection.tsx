import type { RecentLearning } from '@/app/types/DashboardTypes';

interface RecentLearningSectionProps {
  learnings: RecentLearning[];
}

export function RecentLearningSection({
  learnings,
}: RecentLearningSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-4">최근 학습</h3>

      <div className="space-y-3">
        {learnings.map((learning) => (
          <div
            key={learning.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
          >
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
          </div>
        ))}
      </div>
    </div>
  );
}