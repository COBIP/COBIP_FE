import { GRAMMAR_TEMPLATES } from '@/features/grammar-template/Constants';
import { GrammarTemplateCard } from './GrammarTemplateCard'; // 경로에 맞게 수정해주세요

interface PopularTemplatesProps {
  onSelectTemplate: (templateId: string) => void;
}

export function PopularTemplates({ onSelectTemplate }: PopularTemplatesProps) {
  // 1. '인기' 배지를 가진 템플릿만 필터링 (GrammarTemplateList.tsx 로직 추출)
  const popularTemplates = GRAMMAR_TEMPLATES.filter((t) => t.badge === '인기');

  return (
    <div className="w-full">
      {/* 마이페이지용 섹션 타이틀 (필요에 따라 수정) */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          🔥 인기 문법 템플릿
        </h2>
      </div>

      {/* 2. 기존과 완벽히 동일한 반응형 4열 그리드 레이아웃 적용 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {popularTemplates.map((template) => (
          <GrammarTemplateCard
            key={template.id}
            template={template}
            onClick={onSelectTemplate}
          />
        ))}
      </div>

      {/* 인기 템플릿이 없을 경우의 예외 처리 */}
      {popularTemplates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-400 text-sm">현재 인기 템플릿이 없습니다.</p>
        </div>
      )}
    </div>
  );
}