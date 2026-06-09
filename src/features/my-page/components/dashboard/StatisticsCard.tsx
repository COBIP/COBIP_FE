import { TrendingDown, TrendingUp } from 'lucide-react';
import type { StatisticCard as StatisticCardType } from '@/app/types/DashboardTypes';

interface StatisticsCardProps {
  card: StatisticCardType;
}

const colorMap: Record<StatisticCardType['color'], string> = {
  blue: 'bg-purple-50 border-purple-200',
  green: 'bg-green-50 border-green-200',
  orange: 'bg-orange-50 border-orange-200',
  purple: 'bg-purple-50 border-purple-200',
};

const textColorMap: Record<StatisticCardType['color'], string> = {
  blue: 'text-purple-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
};

const barColorMap: Record<StatisticCardType['color'], string> = {
  blue: 'bg-purple-600',
  green: 'bg-green-600',
  orange: 'bg-orange-600',
  purple: 'bg-purple-600',
};

function getNumericValue(value: StatisticCardType['value']) {
  return typeof value === 'number' ? value : Number(value);
}

export function StatisticsCard({ card }: StatisticsCardProps) {
  const isPositive = card.trend === 'up';
  const hasTrend = card.percentage !== undefined && card.percentage !== 0;
  const numericValue = getNumericValue(card.value);
  const isZeroValue = Number.isFinite(numericValue) && numericValue <= 0;
  const shouldShowProgress = card.unit === '%' && Number.isFinite(numericValue);
  const progressPercent = shouldShowProgress ? Math.min(100, Math.max(0, Math.round(numericValue))) : 0;
  const cardColor = isZeroValue ? 'bg-gray-50 border-gray-200' : colorMap[card.color];
  const valueColor = isZeroValue ? 'text-gray-500' : textColorMap[card.color];
  const progressColor = progressPercent > 0 ? barColorMap[card.color] : 'bg-gray-300';

  return (
    <div className={`rounded-lg border p-6 ${cardColor}`}>
      {hasTrend && (
        <div className={`mb-2 flex items-center justify-end gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {card.percentage}%
        </div>
      )}

      <p className="mb-2 text-xs text-gray-600">{card.title}</p>

      <div className={shouldShowProgress ? 'mb-3' : ''}>
        <span className={`text-2xl font-bold ${valueColor}`}>{card.value}</span>
        {card.unit && <span className="ml-1 text-sm text-gray-600">{card.unit}</span>}
      </div>

      {shouldShowProgress && (
        <div className="h-1.5 w-full rounded-full bg-gray-200">
          <div
            className={`h-1.5 rounded-full transition-all ${progressColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
