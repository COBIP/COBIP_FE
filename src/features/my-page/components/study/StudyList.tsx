import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock3, Layers3 } from 'lucide-react';
import type { LearningProgress } from '@/features/my-page/types/DashboardTypes';
import { formatStudyTime, getLearningCategory, getLearningHref } from '@/features/my-page/utils/DashboardUtils';

interface StudyListProps {
  items: LearningProgress[];
}

function formatDate(value: string | null | undefined) {
  if (!value) return '기록 없음';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '기록 없음';

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getContentTypeLabel(item: LearningProgress) {
  if (item.contentType === 'AI_TEMPLATE') return 'AI 생성 템플릿';
  if (item.contentType === 'GRAMMAR_TEMPLATE') return '문법 템플릿';
  return '기능 템플릿';
}

export function StudyList({ items }: StudyListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const progressPercent = Math.min(100, Math.max(0, Math.round(item.progressPercent)));

        return (
          <Link
            key={`${item.contentType ?? 'TEMPLATE'}-${item.aiTemplateId ?? item.templateId}`}
            href={getLearningHref(item)}
            className="group block rounded-lg border border-gray-200 bg-white p-5 transition hover:border-purple-200 hover:shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700">
                    {getContentTypeLabel(item)}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-bold ${
                      item.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.completed ? '완료' : '학습 중'}
                  </span>
                </div>

                <h2 className="truncate text-base font-bold text-gray-950">{item.templateTitle}</h2>
                <p className="mt-1 text-sm text-gray-500">{getLearningCategory(item)}</p>

                <div className="mt-4 grid gap-2 text-xs text-gray-500 sm:grid-cols-3">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    최근 학습 {formatDate(item.lastAccessedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers3 className="h-3.5 w-3.5" />
                    {item.lastStep ?? '최근 단계 없음'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    학습 시간 {formatStudyTime(item.studySeconds)}
                  </span>
                </div>
              </div>

              <div className="w-full shrink-0 lg:w-64">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-600">진행률</span>
                  <span className="font-bold text-purple-700">{progressPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 text-sm font-semibold text-purple-700">
                  이어서 학습
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
