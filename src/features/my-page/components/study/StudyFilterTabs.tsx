import type { StudyFilter } from '@/features/my-page/hooks/useMyLearning';

interface StudyFilterTabsProps {
  activeFilter: StudyFilter;
  onFilterChange: (filter: StudyFilter) => void;
}

const FILTER_OPTIONS: Array<{ value: StudyFilter; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'inProgress', label: '학습 중' },
  { value: 'completed', label: '완료' },
];

export function StudyFilterTabs({ activeFilter, onFilterChange }: StudyFilterTabsProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onFilterChange(option.value)}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeFilter === option.value
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
