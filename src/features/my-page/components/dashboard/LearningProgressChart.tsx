interface LearningActivityData {
  day: string;
  studySeconds: number;
}

interface LearningProgressChartProps {
  activities: LearningActivityData[];
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatStudyTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  if (hours > 0) {
    return `${hours}시간`;
  }

  if (minutes > 0) {
    return `${minutes}분`;
  }

  return `${safeSeconds}초`;
}

export function LearningProgressChart({ activities }: LearningProgressChartProps) {
  const todayLabel = WEEKDAY_LABELS[new Date().getDay()];
  const activityMap = new Map(
    (Array.isArray(activities) ? activities : []).map((activity) => [
      activity.day,
      Number(activity.studySeconds) || 0,
    ]),
  );

  const fixedActivities = WEEKDAY_LABELS.map((day) => ({
    day,
    studySeconds: activityMap.get(day) ?? 0,
  }));
  const totalSeconds = fixedActivities.reduce((sum, activity) => sum + activity.studySeconds, 0);
  const maxSeconds = Math.max(
    ...fixedActivities.map((activity) => activity.studySeconds),
    1,
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-end justify-between gap-3">
        <h3 className="text-sm font-bold text-gray-900">주간 학습 시간</h3>
        <p className="text-xs font-semibold text-purple-700">주간 총 {formatStudyTime(totalSeconds)}</p>
      </div>

      <div className="grid h-48 grid-cols-7 items-end gap-2">
        {fixedActivities.map((activity) => {
          const percentage = (activity.studySeconds / maxSeconds) * 100;
          const height = activity.studySeconds > 0 ? Math.max(percentage, 4) : 0;
          const isToday = activity.day === todayLabel;

          return (
            <div key={activity.day} className="flex min-w-0 flex-col items-center gap-2">
              <div className="group relative flex h-32 w-full items-end justify-center">
                <div className="pointer-events-none absolute -top-8 z-10 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {formatStudyTime(activity.studySeconds)}
                </div>
                <div
                  className="w-full rounded-t-lg bg-purple-600 transition-colors hover:bg-purple-700"
                  style={{ height: `${height}%` }}
                />
              </div>

              <div className="flex h-8 flex-col items-center justify-start gap-0.5">
                <span className={`text-xs font-medium ${isToday ? 'text-amber-600' : 'text-gray-600'}`}>
                  {activity.day}
                </span>
                {isToday && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    오늘
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <div className="h-3 w-3 rounded-full bg-purple-600" />
        <span className="text-xs text-gray-600">일간 학습 시간</span>
      </div>
    </div>
  );
}
