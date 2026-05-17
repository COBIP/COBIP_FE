import type { TemplateSummary } from '@/features/my-page/types/DashboardTypes';

interface PopularTemplatesProps {
  templates: TemplateSummary[];
  onSelectTemplate: (templateId: number) => void;
}

const difficultyLabels: Record<string, string> = {
  BEGINNER: '입문',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
};

function formatDifficulty(difficulty: string) {
  return difficultyLabels[difficulty] ?? difficulty;
}

export function PopularTemplates({ templates, onSelectTemplate }: PopularTemplatesProps) {
  return (
    <section className="w-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-gray-900">인기 템플릿</h2>
        <span className="text-xs font-medium text-gray-500">백엔드 대시보드 기준</span>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50 py-12 text-center">
          <p className="text-sm text-gray-400">현재 인기 템플릿이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template.id)}
              className="group rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md hover:shadow-purple-100"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-purple-600">{template.category}</p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-bold text-gray-900">{template.title}</h3>
                </div>
                <span className="shrink-0 rounded-full border border-purple-100 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600">
                  {formatDifficulty(template.difficulty)}
                </span>
              </div>

              <p className="line-clamp-2 text-xs leading-5 text-gray-500">{template.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {template.techStacks.slice(0, 3).map((stack) => (
                  <span
                    key={stack}
                    className="rounded-md border border-gray-100 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500"
                  >
                    {stack}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 text-[11px] text-gray-400">
                <span>조회 {template.viewCount}</span>
                <span>좋아요 {template.favoriteCount}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}