import { TrendingUp, TrendingDown } from 'lucide-react';
import type { StatisticCard as StatisticCardType } from '@/app/types/DashboardTypes';

interface StatisticsCardProps {
  card: StatisticCardType;
}

const colorMap = {
  blue: 'bg-purple-50 border-purple-200',
  green: 'bg-green-50 border-green-200',
  orange: 'bg-orange-50 border-orange-200',
  purple: 'bg-purple-50 border-purple-200',
};

const textColorMap = {
  blue: 'text-purple-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
};

const barColorMap = {
  blue: 'bg-purple-600',
  green: 'bg-green-600',
  orange: 'bg-orange-600',
  purple: 'bg-purple-600',
};

export function StatisticsCard({ card }: StatisticsCardProps) {
  const isPositive = card.trend === 'up';
  const hasTrend = card.percentage !== undefined && card.percentage !== 0;

  return (
    <div className={`rounded-lg border p-6 ${colorMap[card.color]}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-end mb-2 min-h-6">
        {hasTrend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {card.percentage}%
          </div>
        )}
      </div>

      {/* 제목 */}
      <p className="text-xs text-gray-600 mb-2">{card.title}</p>

      {/* 값 */}
      <div className="mb-3">
        <span className={`text-2xl font-bold ${textColorMap[card.color]}`}>
          {card.value}
        </span>
        {card.unit && (
          <span className="text-sm text-gray-600 ml-1">{card.unit}</span>
        )}
      </div>

      {/* 프로그레스 바 */}
      <div className="w-full bg-gray-300 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${barColorMap[card.color]}`}
          style={{ width: '60%' }}
        />
      </div>
    </div>
  );
}