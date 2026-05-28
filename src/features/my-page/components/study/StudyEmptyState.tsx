import { BookOpen } from 'lucide-react';

interface StudyEmptyStateProps {
  hasFilter: boolean;
}

export function StudyEmptyState({ hasFilter }: StudyEmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
        <BookOpen className="h-6 w-6" />
      </div>
      <h2 className="text-base font-bold text-gray-900">
        {hasFilter ? '조건에 맞는 학습이 없습니다' : '아직 진행한 학습이 없습니다'}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {hasFilter
          ? '다른 상태를 선택해 학습 기록을 확인해보세요.'
          : '기능 템플릿이나 문법 템플릿을 시작하면 이곳에 진행 기록이 쌓입니다.'}
      </p>
    </div>
  );
}
