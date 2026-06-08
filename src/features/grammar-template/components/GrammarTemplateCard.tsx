import type { GrammarTemplateItem } from '@/features/grammar-template/Constants';

interface GrammarTemplateCardProps {
  template: GrammarTemplateItem;
  onClick: (id: number) => void;
}

const LANGUAGE_ICONS: Record<string, string> = {
  PYTHON: '🐍',
  JAVA: '☕',
  JAVASCRIPT: '🟨',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'from-blue-100 to-emerald-100',
  INTERMEDIATE: 'from-amber-100 to-yellow-100',
  ADVANCED: 'from-rose-100 to-orange-100',
};

export function GrammarTemplateCard({ template, onClick }: GrammarTemplateCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(template.id)}
      className="group block w-full text-left"
    >
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md hover:shadow-purple-100">
        <div
          className={`h-2 bg-gradient-to-r ${DIFFICULTY_COLORS[template.difficulty] || 'from-gray-100 to-gray-100'}`}
        />

        <div className="p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-lg">
              {LANGUAGE_ICONS[template.language] || '📘'}
            </div>
            <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700">
              {DIFFICULTY_LABELS[template.difficulty] || template.difficulty}
            </span>
          </div>

          <h3 className="text-base font-bold text-gray-900">{template.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{template.summary}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {template.category ? (
              <span className="rounded-md border border-purple-100 bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-700">
                {template.category}
              </span>
            ) : null}
            <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-600">
              {template.language}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
