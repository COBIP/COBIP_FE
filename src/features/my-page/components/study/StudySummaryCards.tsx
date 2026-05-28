import { createElement } from 'react';
import { BookOpen, CheckCircle2, Clock3, TrendingUp } from 'lucide-react';
import { formatStudyTime } from '@/features/my-page/utils/DashboardUtils';

interface StudySummaryCardsProps {
  averageProgress: number;
  completedCount: number;
  inProgressCount: number;
  totalCount: number;
  totalStudySeconds: number;
}

export function StudySummaryCards({
  averageProgress,
  completedCount,
  inProgressCount,
  totalCount,
  totalStudySeconds,
}: StudySummaryCardsProps) {
  const cards = [
    { label: '전체 학습', value: `${totalCount}개`, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '학습 중', value: `${inProgressCount}개`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '완료', value: `${completedCount}개`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '평균 진행률', value: `${averageProgress}%`, icon: Clock3, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-500">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">{card.value}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg} ${card.color}`}>
              {createElement(card.icon, { className: 'h-5 w-5' })}
            </div>
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-purple-100 bg-purple-50 p-5 md:col-span-2 xl:col-span-4">
        <p className="text-xs font-semibold text-purple-700">현재 페이지 학습 시간 합계</p>
        <p className="mt-1 text-lg font-bold text-purple-950">{formatStudyTime(totalStudySeconds)}</p>
      </div>
    </div>
  );
}
