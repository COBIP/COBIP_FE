// src/features/dashboard/components/LearningProgressChart.tsx

interface LearningActivityData {
  day: string;
  studySeconds: number; 
}

interface LearningProgressChartProps {
  activities: LearningActivityData[];
}

export function LearningProgressChart({ activities }: LearningProgressChartProps) {
  const safeActivities = Array.isArray(activities) ? activities : [];

  // ✨ 추가된 핵심 로직: 원본 데이터를 복사해서 순서를 완전히 뒤집습니다 (오늘이 맨 왼쪽으로 옴)
  const reversedActivities = [...safeActivities].reverse();

  // safeActivities 대신 reversedActivities 기준으로 최댓값 계산
  const maxSeconds = Math.max(
    ...reversedActivities.map((a) => Number(a.studySeconds) || 0),
    1
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-6">주간 학습 시간</h3>

      <div className="flex items-end justify-between gap-2 h-48">
        {/* ✨ safeActivities.map 대신 reversedActivities.map 사용 */}
        {reversedActivities.map((activity, idx) => {
          const seconds = Number(activity.studySeconds) || 0;
          const percentage = (seconds / maxSeconds) * 100;
          const studyMinutes = Math.floor(seconds / 60);

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center h-32 relative group">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                  {studyMinutes > 0 ? `${studyMinutes}분` : `${seconds}초`}
                </div>
                
                <div
                  className="w-full bg-purple-600 rounded-t-lg transition-all hover:bg-purple-700"
                  style={{ 
                    height: `${seconds > 0 ? Math.max(percentage, 2) : 0}%` 
                  }}
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
      </div>
    </div>
  );
}