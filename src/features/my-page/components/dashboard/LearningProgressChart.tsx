// src/features/dashboard/components/LearningProgressChart.tsx

// ✨ props 타입 변경
interface LearningActivityData {
  day: string;
  studySeconds: number; 
}

interface LearningProgressChartProps {
  activities: LearningActivityData[];
}

export function LearningProgressChart({ activities }: LearningProgressChartProps) {
  // 가장 길게 공부한 시간을 기준으로 100% 비율을 구함 (0초일 때 에러 방지용 1)
  const maxSeconds = Math.max(...activities.map((a) => a.studySeconds), 1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-6">주간 학습 시간</h3>

      <div className="flex items-end justify-between gap-2 h-48">
        {activities.map((activity, idx) => {
          // 막대그래프 높이 비율 (%)
          const percentage = (activity.studySeconds / maxSeconds) * 100;
          // 툴팁용: 초를 분으로 환산
          const studyMinutes = Math.floor(activity.studySeconds / 60);

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center h-32 relative group">
                {/* ✨ 추가: 마우스 오버 시 보이는 툴팁 (00분) */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                  {studyMinutes}분
                </div>
                
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
          <span className="text-xs text-gray-600">일간 학습 시간 (분)</span>
        </div>
      </div>
    </div>
  );
}