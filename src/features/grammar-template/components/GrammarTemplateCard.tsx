import type { GrammarTemplateItem } from '@/features/grammar-template/Constants';

interface GrammarTemplateCardProps {
  template: GrammarTemplateItem;
  onClick: (id: number) => void;
}

/** 언어별 아이콘 매핑 */
const LANGUAGE_ICONS: Record<string, string> = {
  PYTHON: '🐍',
  JAVA: '☕',
  JAVASCRIPT: '🟨',
};

/** 난이도별 컬러 매핑 */
const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'from-blue-100 to-green-100',
  INTERMEDIATE: 'from-yellow-100 to-amber-100',
  ADVANCED: 'from-red-100 to-orange-100',
};

export function GrammarTemplateCard({ template, onClick }: GrammarTemplateCardProps) {
  return (
    <div
      onClick={() => onClick(template.id)}
      className="group cursor-pointer"
    >
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:border-purple-300 hover:shadow-md hover:shadow-purple-100 hover:-translate-y-0.5">
        {/* 상단 컬러 바 */}
        <div className={`h-2 bg-gradient-to-r ${DIFFICULTY_COLORS[template.difficulty] || 'from-gray-100 to-gray-100'}`} />

        <div className="p-4">
          {/* 헤더: 아이콘 + 난이도 */}
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-lg">
              {LANGUAGE_ICONS[template.language] || '📄'}
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border bg-purple-50 text-purple-600 border-purple-200">
              {template.difficulty === 'BEGINNER' ? '초급' : template.difficulty === 'INTERMEDIATE' ? '중급' : '고급'}
            </span>
          </div>

          {/* 제목 */}
          <h3 className="text-sm font-bold text-gray-900 mb-1">{template.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{template.summary}</p>

          {/* 카테고리 */}
          {template.category && (
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] rounded-md border border-purple-100">
                {template.category}
              </span>
              <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[10px] rounded-md border border-gray-100">
                {template.language}
              </span>
            </div>
          )}

          {/* 푸터 */}
          <div className="pt-2.5 border-t border-gray-50" />
        </div>
      </div>
    </div>
  );
}
