/**
 * 템플릿 그리드 컴포넌트
 * 
 * 디자인: 4열 반응형 그리드
 * - 데스크톱: 4열
 * - 태블릿: 3열
 * - 모바일: 2열
 * - 호버 효과: 스케일 1 → 1.05, 그림자 강화
 */

interface Template {
  id: number;
  title: string;
  category: string;
  rating: number;
}

interface TemplateGridProps {
  templates: Template[];
}

export default function TemplateGrid({ templates }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {templates.map(template => (
        <div
          key={template.id}
          className="group cursor-pointer"
        >
          {/* 템플릿 카드 */}
          <div className="h-40 md:h-48 bg-primary rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.05] flex items-center justify-center">
            <div className="text-center text-primary-foreground">
              <div className="text-sm font-medium opacity-75">Template</div>
              <div className="text-2xl font-bold">{template.id}</div>
            </div>
          </div>

          {/* 템플릿 정보 */}
          <div className="mt-3">
            <h4 className="font-semibold text-foreground text-sm line-clamp-2">
              {template.title}
            </h4>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                {template.category}
              </span>
              <span className="text-xs text-muted-foreground">
                ⭐ {template.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
